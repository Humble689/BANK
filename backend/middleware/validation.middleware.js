const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Common validation rules
const userValidationRules = {
    register: [
        body('firstName').trim().notEmpty().withMessage('First name is required'),
        body('lastName').trim().notEmpty().withMessage('Last name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
            .withMessage('Password must include one lowercase letter, one uppercase letter, one number, and one special character'),
        body('phoneNumber').matches(/^\+?[\d\s-]+$/).withMessage('Valid phone number is required'),
        body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required')
    ],
    login: [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty()
    ]
};

const accountValidationRules = {
    create: [
        body('accountType')
            .isIn(['SAVINGS', 'CHECKING', 'INVESTMENT', 'CREDIT'])
            .withMessage('Invalid account type'),
        body('currency')
            .optional()
            .isString()
            .isLength({ min: 3, max: 3 })
            .withMessage('Currency must be a 3-letter code')
    ]
};

const transactionValidationRules = {
    transfer: [
        body('fromAccountId').isMongoId().withMessage('Valid from account ID required'),
        body('toAccountId').isMongoId().withMessage('Valid to account ID required'),
        body('amount')
            .isFloat({ min: 0.01 })
            .withMessage('Amount must be greater than 0'),
        body('description')
            .optional()
            .trim()
            .isString()
            .withMessage('Description must be a string')
    ],
    deposit: [
        body('accountId').isMongoId().withMessage('Valid account ID required'),
        body('amount')
            .isFloat({ min: 0.01 })
            .withMessage('Amount must be greater than 0'),
        body('description')
            .optional()
            .trim()
            .isString()
            .withMessage('Description must be a string')
    ]
};

module.exports = {
    validate,
    userValidationRules,
    accountValidationRules,
    transactionValidationRules
}; 