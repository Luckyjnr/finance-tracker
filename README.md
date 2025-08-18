
# 📌 Finance Tracker API

## 📖 Description

The **Finance Tracker API** is a backend service that helps users **manage their finances** by tracking **income, expenses, and account balances**.
It provides **secure user authentication, transaction management, and financial summaries** via RESTful API endpoints.

---

## 🚀 Features

* 🔐 User authentication with JWT.
* 🔑 Secure password hashing with **bcrypt**.
* 💰 Track user account balance (**default balance = 0**).
* 📊 CRUD operations for income and expense transactions.
* 📅 Filter transactions by **category** or **date**.
* ⚡ Error handling and input validation.

---

## 🛠️ Installation & Setup

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
```

---

## 🏗️ Technologies Used

* **Node.js** – JavaScript runtime.
* **Express.js** – Backend framework.
* **MongoDB & Mongoose** – Database and ORM.
* **JWT (jsonwebtoken)** – Authentication.
* **Bcrypt.js** – Password hashing.
* **Dotenv** – Environment variables.

---

## 📡 API Endpoints

### 🔑 Auth Routes

| Method | Endpoint             | Description          | Auth Required |
| ------ | -------------------- | -------------------- | ------------- |
| POST   | `/api/auth/register` | Register a new user  | ❌             |
| POST   | `/api/auth/login`    | Login user & get JWT | ❌             |

---

### 💳 Transaction Routes

| Method | Endpoint                | Description                             | Auth Required |
| ------ | ----------------------- | --------------------------------------- | ------------- |
| GET    | `/api/transactions`     | Get all transactions for logged-in user | ✅                         |
| POST   | `/api/transactions`     | Add new transaction (income/expense)    | ✅             |
| PUT    | `/api/transactions/:id` | Update an existing transaction by ID    | ✅             |
| DELETE | `/api/transactions/:id` | Delete a transaction by ID              | ✅             |

---

## 🔒 Authentication

* Authentication is handled via **JWT tokens**.
* To access protected routes, include the token in headers:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 📌 Example Transaction Object

```json
{
  "type": "income", 
  "amount": 500,
  "category": "salary",
  "description": "August salary"
}
```

---

## 👤 Author

**Noah Lucky**
