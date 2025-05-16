const User = require('./User');
const Account = require('./Account');
const Transaction = require('./Transaction');

// User - Account associations
User.hasMany(Account, {
    foreignKey: 'userId',
    as: 'accounts'
});
Account.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Account - Transaction associations
Account.hasMany(Transaction, {
    foreignKey: 'fromAccountId',
    as: 'outgoingTransactions'
});
Account.hasMany(Transaction, {
    foreignKey: 'toAccountId',
    as: 'incomingTransactions'
});
Transaction.belongsTo(Account, {
    foreignKey: 'fromAccountId',
    as: 'fromAccount'
});
Transaction.belongsTo(Account, {
    foreignKey: 'toAccountId',
    as: 'toAccount'
});

module.exports = {
    User,
    Account,
    Transaction
}; 