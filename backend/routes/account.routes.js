const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Account = require('../models/Account');
const User = require('../models/User');
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
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Create new account
router.post('/', [
    authenticateUser,
    body('accountType')
        .isIn(['SAVINGS', 'CHECKING', 'INVESTMENT', 'CREDIT'])
        .withMessage('Invalid account type'),
    body('currency').optional().isString().isLength({ min: 3, max: 3 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const account = new Account({
            userId: req.user._id,
            accountType: req.body.accountType,
            currency: req.body.currency || 'USD'
        });

        await account.save();

        // Add account to user's accounts array
        req.user.accounts.push(account._id);
        await req.user.save();

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: account
        });
    } catch (error) {
        console.error('Account creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating account',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all accounts for user
router.get('/', authenticateUser, async (req, res) => {
    try {
        const accounts = await Account.find({ userId: req.user._id })
            .populate('transactions');

        res.json({
            success: true,
            data: accounts
        });
    } catch (error) {
        console.error('Fetch accounts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching accounts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get account by ID
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('transactions');

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        res.json({
            success: true,
            data: account
        });
    } catch (error) {
        console.error('Fetch account error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching account',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Close account
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        if (account.balance > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot close account with positive balance'
            });
        }

        account.isActive = false;
        await account.save();

        res.json({
            success: true,
            message: 'Account closed successfully'
        });
    } catch (error) {
        console.error('Close account error:', error);
        res.status(500).json({
            success: false,
            message: 'Error closing account',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 