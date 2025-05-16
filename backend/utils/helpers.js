const crypto = require('crypto');

// Generate random string
const generateRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

// Validate phone number
const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\+?[\d\s-]+$/;
    return phoneRegex.test(phoneNumber);
};

// Generate account number
const generateAccountNumber = (accountType) => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${accountType.charAt(0)}${timestamp}${random}`.slice(0, 12);
};

// Calculate interest
const calculateInterest = (principal, rate, time) => {
    return (principal * rate * time) / 100;
};

// Format date
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Mask sensitive data
const maskData = (data, start = 4, end = 4) => {
    if (!data) return '';
    const length = data.length;
    const maskedLength = length - start - end;
    if (maskedLength <= 0) return data;
    
    return data.substring(0, start) + 
           '*'.repeat(maskedLength) + 
           data.substring(length - end);
};

// Generate transaction reference
const generateTransactionReference = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `TXN${timestamp}${random}`;
};

// Validate email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

module.exports = {
    generateRandomString,
    formatCurrency,
    validatePhoneNumber,
    generateAccountNumber,
    calculateInterest,
    formatDate,
    maskData,
    generateTransactionReference,
    validateEmail
}; 