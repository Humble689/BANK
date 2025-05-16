-- Create database if not exists
CREATE DATABASE IF NOT EXISTS bankingapp;
USE bankingapp;

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL UNIQUE,
    dateOfBirth DATE NOT NULL,
    address JSON,
    isVerified BOOLEAN DEFAULT false,
    twoFactorEnabled BOOLEAN DEFAULT false,
    lastLogin DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phoneNumber)
);

-- Create Accounts table
CREATE TABLE IF NOT EXISTS Accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    accountType ENUM('SAVINGS', 'CHECKING', 'INVESTMENT', 'CREDIT') NOT NULL,
    accountNumber VARCHAR(12) NOT NULL UNIQUE,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    isActive BOOLEAN DEFAULT true,
    interestRate DECIMAL(5, 2) DEFAULT 0.00,
    minimumBalance DECIMAL(10, 2) DEFAULT 0.00,
    creditLimit DECIMAL(10, 2) DEFAULT 0.00,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_account_number (accountNumber),
    INDEX idx_user_id (userId)
);

-- Create Transactions table
CREATE TABLE IF NOT EXISTS Transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fromAccountId INT NOT NULL,
    toAccountId INT,
    type ENUM('TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'BILL_PAYMENT', 'CHECK_DEPOSIT') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    description TEXT,
    reference VARCHAR(255) UNIQUE,
    metadata JSON,
    completedAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fromAccountId) REFERENCES Accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (toAccountId) REFERENCES Accounts(id) ON DELETE SET NULL,
    INDEX idx_from_account (fromAccountId),
    INDEX idx_to_account (toAccountId),
    INDEX idx_reference (reference),
    INDEX idx_status (status)
);

-- Create Bills table
CREATE TABLE IF NOT EXISTS Bills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    billerId VARCHAR(255) NOT NULL,
    billerName VARCHAR(255) NOT NULL,
    accountNumber VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    dueDate DATE NOT NULL,
    status ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED') DEFAULT 'PENDING',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id),
    INDEX idx_user_bills (userId),
    INDEX idx_due_date (dueDate)
);

-- Create Messages table
CREATE TABLE IF NOT EXISTS Messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    isRead BOOLEAN DEFAULT false,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id),
    INDEX idx_user_messages (userId, isRead)
); 