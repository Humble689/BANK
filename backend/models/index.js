const User = require('./User');
const Account = require('./Account');
const Transaction = require('./Transaction');
const Bill = require('./Bill');
const Message = require('./Message');

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

// User - Bill associations
User.hasMany(Bill, {
    foreignKey: 'userId',
    as: 'bills'
});
Bill.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// User - Message associations
User.hasMany(Message, {
    foreignKey: 'userId',
    as: 'messages'
});
Message.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

module.exports = {
    User,
    Account,
    Transaction,
    Bill,
    Message
}; 