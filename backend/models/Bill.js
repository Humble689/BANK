const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Bill extends Model {}

Bill.init({
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
    billerId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    billerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED'),
        defaultValue: 'PENDING'
    }
}, {
    sequelize,
    modelName: 'Bill',
    timestamps: true
});

module.exports = Bill; 