# 💬 Confera – Smart Chat & Collaboration App

**Confera** is a real-time chat and collaboration platform built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js) with real-time capabilities powered by **Socket.IO**.
It supports **Google login** and **custom authentication** using `express-session`.

---

## 🚀 Features

- 🔐 Login with **Google OAuth** and **custom credentials**
- 🧠 **Session-based authentication** using `express-session`
- 🛡️ Protected routes and sessions
- 💬 **Real-time chat** using Socket.IO
- 🧾 Messages stored in MongoDB with sender & room info
- 🧵 Create and join **chat rooms**
- 🎨 Responsive UI (React)

---

## 🧰 Tech Stack

| Technology | Role |
|------------|------|
| **React.js** | Frontend UI |
| **Node.js + Express.js** | Backend APIs |
| **MongoDB + Mongoose** | Database |
| **Socket.IO** | Real-time messaging |
| **express-session** | Session-based login |
| **Google OAuth 2.0** | Third-party authentication |
| **Render** | Deployment (Backend) |

-

## 🔧 Installation Guide


# Clone the project
git clone https://github.com/Somu9008/confera
cd confera

cd server
npm install

 Create a .env file and add the following:
MONGO_URI=your_mongo_uri
SESSION_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Start backend server
npm start

cd client
npm install

# Start frontend
npm start

