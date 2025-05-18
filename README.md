# Mobile Banking System

A professional mobile banking system that provides secure and convenient banking services to customers.

## Features

- Secure user authentication and authorization
- Account management (checking, savings, etc.)
- Fund transfers between accounts
- Transaction history
- Bill payments
- Mobile check deposit
- Account statements
- Secure messaging system
- Push notifications
- Two-factor authentication   

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt
- **Security**: Helmet, Express-validator
- **Mobile App**: React Native
- **API Documentation**: Swagger/OpenAPI

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Security Features

- End-to-end encryption for sensitive data
- JWT-based authentication
- Input validation and sanitization
- Rate limiting
- Security headers with Helmet
- Password hashing with bcrypt
- Session management
- CORS protection

## API Documentation

API documentation is available at `/api-docs` when running the server.

## License

MIT License 