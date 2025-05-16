const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { generateAccountNumber } = require('../utils/helpers');

class Account extends Model {
    // Method to get account balance
    getBalance() {
        return this.balance;
    }

    // Method to update balance
    async updateBalance(amount, type) {
        if (type === 'credit') {
            this.balance += amount;
        } else if (type === 'debit') {
            if (this.balance < amount) {
                throw new Error('Insufficient funds');
            }
            this.balance -= amount;
        }
        return this.save();
    }
}

Account.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    accountType: {
        type: DataTypes.ENUM('SAVINGS', 'CHECKING', 'INVESTMENT', 'CREDIT'),
        allowNull: false
    },
    accountNumber: {
        type: DataTypes.STRING(12),
        allowNull: false,
        unique: true
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    interestRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00
    },
    minimumBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    creditLimit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    }
}, {
    sequelize,
    modelName: 'Account',
    timestamps: true,
    hooks: {
        beforeCreate: async (account) => {
            if (!account.accountNumber) {
                account.accountNumber = generateAccountNumber(account.accountType);
            }
        }
    }
});

module.exports = Account; 