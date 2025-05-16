const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

class User extends Model {
    // Method to compare password
    async comparePassword(candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    }

    // Method to get public profile
    getPublicProfile() {
        const { password, ...userObject } = this.toJSON();
        return userObject;
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [8, 100]
        }
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^\+?[\d\s-]+$/
        }
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: false
    },
    address: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastLogin: {
        type: DataTypes.DATE
    }
}, {
    sequelize,
    modelName: 'User',
    timestamps: true,
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

module.exports = User; 