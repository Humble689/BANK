const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const jwt = require('jsonwebtoken');

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Create transfer transaction
router.post('/transfer', [
    authenticateUser,
    body('fromAccountId').isMongoId().withMessage('Valid from account ID required'),
    body('toAccountId').isMongoId().withMessage('Valid to account ID required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount required'),
    body('description').optional().trim().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fromAccountId, toAccountId, amount, description } = req.body;

        // Verify from account belongs to user
        const fromAccount = await Account.findOne({
            _id: fromAccountId,
            userId: req.userId,
            isActive: true
        });

        if (!fromAccount) {
            return res.status(404).json({
                success: false,
                message: 'Source account not found'
            });
        }

        // Verify to account exists
        const toAccount = await Account.findOne({
            _id: toAccountId,
            isActive: true
        });

        if (!toAccount) {
            return res.status(404).json({
                success: false,
                message: 'Destination account not found'
            });
        }

        // Check sufficient balance
        if (fromAccount.balance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient funds'
            });
        }

        // Create and process transaction
        const transaction = new Transaction({
            fromAccount: fromAccountId,
            toAccount: toAccountId,
            type: 'TRANSFER',
            amount,
            currency: fromAccount.currency,
            description,
            status: 'COMPLETED',
            completedAt: new Date()
        });

        await transaction.save();

        // Update account balances
        fromAccount.balance -= amount;
        toAccount.balance += amount;
        
        fromAccount.transactions.push(transaction._id);
        toAccount.transactions.push(transaction._id);

        await Promise.all([
            fromAccount.save(),
            toAccount.save()
        ]);

        res.status(201).json({
            success: true,
            message: 'Transfer completed successfully',
            data: transaction
        });
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing transfer',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Create deposit transaction
router.post('/deposit', [
    authenticateUser,
    body('accountId').isMongoId().withMessage('Valid account ID required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount required'),
    body('description').optional().trim().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { accountId, amount, description } = req.body;

        const account = await Account.findOne({
            _id: accountId,
            userId: req.userId,
            isActive: true
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        const transaction = new Transaction({
            fromAccount: accountId,
            type: 'DEPOSIT',
            amount,
            currency: account.currency,
            description,
            status: 'COMPLETED',
            completedAt: new Date()
        });

        await transaction.save();

        account.balance += amount;
        account.transactions.push(transaction._id);
        await account.save();

        res.status(201).json({
            success: true,
            message: 'Deposit completed successfully',
            data: transaction
        });
    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing deposit',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get transaction history
router.get('/history/:accountId', authenticateUser, async (req, res) => {
    try {
        const account = await Account.findOne({
            _id: req.params.accountId,
            userId: req.userId
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        const transactions = await Transaction.find({
            $or: [
                { fromAccount: account._id },
                { toAccount: account._id }
            ]
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction history',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 