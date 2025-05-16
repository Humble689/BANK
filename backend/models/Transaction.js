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
                try {
                    const fromAccount = await sequelize.models.Account.findByPk(transaction.fromAccountId);
                    
                    if (transaction.type === 'TRANSFER' && transaction.toAccountId) {
                        const toAccount = await sequelize.models.Account.findByPk(transaction.toAccountId);
                        await fromAccount.updateBalance(transaction.amount, 'debit');
                        await toAccount.updateBalance(transaction.amount, 'credit');
                    } else if (transaction.type === 'WITHDRAWAL') {
                        await fromAccount.updateBalance(transaction.amount, 'debit');
                    } else if (transaction.type === 'DEPOSIT' || transaction.type === 'CHECK_DEPOSIT') {
                        await fromAccount.updateBalance(transaction.amount, 'credit');
                    }
                } catch (error) {
                    console.error('Error updating account balances:', error);
                    transaction.status = 'FAILED';
                    await transaction.save();
                }
            }
        }
    }
});

// Define associations
Transaction.associate = (models) => {
    Transaction.belongsTo(models.Account, {
        foreignKey: 'fromAccountId',
        as: 'fromAccount'
    });
    Transaction.belongsTo(models.Account, {
        foreignKey: 'toAccountId',
        as: 'toAccount'
    });
};

module.exports = Transaction; 