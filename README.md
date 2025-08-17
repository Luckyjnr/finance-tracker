
# Finance Tracker API

## Description
The **Finance Tracker API** is a backend service that helps users manage their finances by tracking income, expenses, and account balances.  
It provides secure user authentication, transaction management, and financial summaries using RESTful API endpoints.

---

## Features
- User authentication with JWT.
- Secure password hashing with bcrypt.
- Track user account balance (default balance = 0).
- CRUD operations for income and expense transactions.
- Filter transactions by category or date.
- Error handling and input validation.

---

## Installation & Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/finance-tracker-api.git

# Navigate into folder
cd finance-tracker-api

# Install dependencies
npm install

# Create .env file and add:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

# Start the app
npm run dev   # development (nodemon)
npm start     # production
````


## Technologies Used

* **Node.js** – JavaScript runtime.
* **Express.js** – Backend framework.
* **MongoDB & Mongoose** – Database and ORM.
* **JWT (jsonwebtoken)** – Authentication.
* **Bcrypt.js** – Password hashing.
* **Dotenv** – Environment variables.

## API Endpoints

### **Auth Routes**

* `POST /api/auth/register` – Register a new user.
* `POST /api/auth/login` – Login user & get JWT.


## Author

**Noah Lucky**