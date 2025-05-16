const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { generateTransactionReference } = require('../utils/helpers');

class Transaction extends Model {}

Transaction.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fromAccountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Accounts',
            key: 'id'
        }
    },
    toAccountId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Accounts',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'BILL_PAYMENT', 'CHECK_DEPOSIT'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD'
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'),
        defaultValue: 'PENDING'
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reference: {
        type: DataTypes.STRING,
        unique: true
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    completedAt: {
        type: DataTypes.DATE
    }
}, {
    sequelize,
    modelName: 'Transaction',
    timestamps: true,
    hooks: {
        beforeCreate: async (transaction) => {
            if (!transaction.reference) {
                transaction.reference = generateTransactionReference();
            }
        },
        afterCreate: async (transaction) => {
            if (transaction.status === 'COMPLETED') {
                const t = await sequelize.transaction();
                
                try {
                    const fromAccount = await sequelize.models.Account.findByPk(
                        transaction.fromAccountId,
                        { transaction: t, lock: true }
                    );
                    
                    if (!fromAccount) {
                        throw new Error('Source account not found');
                    }

                    if (transaction.type === 'TRANSFER' && transaction.toAccountId) {
                        const toAccount = await sequelize.models.Account.findByPk(
                            transaction.toAccountId,
                            { transaction: t, lock: true }
                        );
                        
                        if (!toAccount) {
                            throw new Error('Destination account not found');
                        }

                        // Check sufficient funds
                        if (fromAccount.balance < transaction.amount) {
                            throw new Error('Insufficient funds');
                        }

                        // Update balances
                        await fromAccount.decrement('balance', { 
                            by: transaction.amount,
                            transaction: t 
                        });
                        await toAccount.increment('balance', { 
                            by: transaction.amount,
                            transaction: t 
                        });

                    } else if (transaction.type === 'WITHDRAWAL') {
                        if (fromAccount.balance < transaction.amount) {
                            throw new Error('Insufficient funds');
                        }
                        await fromAccount.decrement('balance', { 
                            by: transaction.amount,
                            transaction: t 
                        });
                    } else if (transaction.type === 'DEPOSIT' || transaction.type === 'CHECK_DEPOSIT') {
                        await fromAccount.increment('balance', { 
                            by: transaction.amount,
                            transaction: t 
                        });
                    }

                    // Update transaction status
                    transaction.completedAt = new Date();
                    await transaction.save({ transaction: t });

                    await t.commit();
                } catch (error) {
                    await t.rollback();
                    console.error('Error processing transaction:', error);
                    transaction.status = 'FAILED';
                    transaction.metadata = {
                        ...transaction.metadata,
                        error: error.message
                    };
                    await transaction.save();
                }
            }
        }
    }
});

module.exports = Transaction; 