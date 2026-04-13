# 🚀 Planora

Planora is a full-stack web application designed to help users manage study plans, take quizzes, and track their learning progress efficiently through a clean and interactive interface.

---

## 📌 Features

### 🔐 Authentication
- User Registration & Login
- JWT-based authentication
- Protected routes
- Persistent login using localStorage

### 📚 Study Plan Management
- Create study plans
- View all your plans
- Delete plans
- User-specific data with ownership verification

### 🧠 Quiz System
- Take quizzes based on topics
- Questions served securely from backend
- Backend-only score calculation (secure)
- Instant results with detailed breakdown
- Automatic total score tracking

### 📊 Dashboard
- Displays user information
- Shows total score
- Quick navigation to features

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Axios
- React Router
- Context API

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
git clone https://github.com/your-username/planora.git
cd planora

---

### 2. Setup Backend
cd server
npm install

Create a .env file:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Run backend:
npm run dev

---

### 3. Setup Frontend
cd client
npm install
npm run dev

---

## 🌐 API Endpoints

### Auth
POST /api/auth/register  
POST /api/auth/login  
GET /api/auth/me  

### Study Plans
GET /api/study-plans  
POST /api/study-plans  
GET /api/study-plans/:id  
DELETE /api/study-plans/:id  

### Quiz
POST /api/quizzes  
POST /api/quizzes/:id/submit  

---

## 🔒 Security Features
- Password hashing with bcrypt
- JWT authentication
- Protected routes
- Ownership verification
- Secure backend score calculation

---

## 🎯 Project Status

- ✅ Authentication Complete  
- ✅ Study Plans CRUD Complete  
- ✅ Quiz System Complete  
- ⏳ Analytics & Leaderboard (Phase 5 - Optional)

---

## 🤝 Contributing
Feel free to fork the repository and contribute.

---

## 📄 License
This project is open-source and available under the MIT License.

---

## 💡 Author
Jency Irin
