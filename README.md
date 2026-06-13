
# SilentChat

A modern real-time chat application designed for seamless and secure communication. SilentChat enables users to connect instantly through a clean and responsive interface while providing a smooth messaging experience.

LIVE DEMO: [Website demo link](https://silentchat-9hz2.onrender.com)


## 🚀 Features

- Real-time messaging
- User authentication and authorization
- One-to-one conversations
- Responsive UI for desktop and mobile devices
- Online/offline user status
- Message timestamps
- Secure backend architecture
- Modern and intuitive user interface


## 🛠️ Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript (ES6+)
### Backend
- Node.js
- Express.js
### Database
- MongoDB
### Real-Time Communication
- Socket.IO
### Authentication
- JWT Authentication


## 📂 Project Structure

```text
SilentChat/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── utils/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── screenshots/
├── .gitignore
├── README.md
└── package.json
```
## ⚙️ Installation

### 1. Clone the Repository

```bash id="mnk7su"
git clone https://github.com/mehulkala/SilentChat.git
cd SilentChat
```

### 2. Install Dependencies

#### Frontend

```bash id="35e6ws"
cd client
npm install
```

#### Backend

```bash id="nqt6zj"
cd ../server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the server directory:

```env id="odtll3"
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Run the Application

#### Start Backend

```bash id="ft6opj"
cd server
npm run dev
```

#### Start Frontend

```bash id="s5gx04"
cd client
npm run dev
```

### 5. Open in Browser

```text id="6k0m20"
http://localhost:5173
```

## 🔒 Security Features

- Secure password handling
- JWT-based authentication
- Protected API routes
- Input validation
- Secure communication between client and server
## 🌟 Future Improvements

- Group chats
- Voice messages
- File sharing
- End-to-end encryption
- Video calling
- Message reactions
- Push notifications

## 👨‍💻 Author

**Mehul Kala**

* GitHub: [@mehulkala](https://github.com/mehulkala)
* LinkedIn: [Mehul kala](https://www.linkedin.com/in/mehul-kala/)

---

⭐ If you found this project useful, consider giving it a star on GitHub!

## License

This project is for educational and portfolio purposes.

