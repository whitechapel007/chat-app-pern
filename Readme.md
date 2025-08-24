# 💬 Real-Time Chat App

A modern, real-time chat application where you can message friends, create groups, and see who's online instantly!

## ✨ What can you do?

- 💬 **Chat in real-time** - Messages appear instantly, no refresh needed
- 👥 **See who's online** - Green dots show when your friends are active
- 🏠 **Create group chats** - Chat with multiple people at once
- 📸 **Share images** - Send photos directly in your conversations
- 📱 **Works everywhere** - Responsive design for phone, tablet, and desktop
- 🔐 **Secure & private** - Your messages are protected with authentication

## 🚀 Quick Start

### What you need first

- Node.js (version 18+)
- PostgreSQL database
- A code editor

### Get it running

1. **Download the code**

```bash
git clone <your-repo-url>
cd pern_chat_app
```

2. **Install everything**

```bash
# Backend stuff
cd backend
npm install

# Frontend stuff
cd ../frontend
npm install
```

3. **Set up your database**

Create a `.env` file in the `backend` folder:

```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/chat_db"
JWT_SECRET="make-this-super-secret-and-random"
PORT=5000
```

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

4. **Set up the database**

```bash
cd backend
npx prisma migrate dev
```

5. **Start everything**

Open two terminals:

**Terminal 1 (Backend):**

```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm run dev
```

6. **Open your browser** to `http://localhost:3000` and start chatting! 🎉

## 🛠 Built with

**Frontend (what you see):**

- React - For the user interface
- TypeScript - For better code
- Zustand - For managing app state
- Socket.IO - For real-time features
- Tailwind CSS - For beautiful styling

**Backend (the engine):**

- Node.js & Express - For the server
- Socket.IO - For real-time communication
- PostgreSQL - For storing messages
- Prisma - For database management
- JWT - For secure authentication

## 📁 How it's organized

```
pern_chat_app/
├── backend/          # Server code
│   ├── src/
│   │   ├── controllers/  # Handle requests
│   │   ├── routes/       # API endpoints
│   │   ├── socket/       # Real-time features
│   │   └── services/     # Business logic
│   └── prisma/           # Database stuff
└── frontend/         # What users see
    ├── src/
    │   ├── components/   # UI pieces
    │   ├── pages/        # Different screens
    │   ├── store/        # App state
    │   └── hooks/        # Reusable logic
    └── public/           # Static files
```

## 🎯 Cool features explained

### Real-time magic ⚡

Messages appear instantly using WebSocket technology. No need to refresh!

### Online status 🟢

See green dots next to friends who are currently online and chatting.

### Group conversations 👥

Create groups, add friends, and chat with multiple people at once.

### Image sharing 📸

Drag and drop images right into your conversations.

## 🤝 Want to contribute?

1. Fork this repo
2. Create a new branch (`git checkout -b cool-new-feature`)
3. Make your changes
4. Commit them (`git commit -m 'Added something cool'`)
5. Push to your branch (`git push origin cool-new-feature`)
6. Open a Pull Request

## 🆘 Need help?

- Check the issues tab for common problems
- Create a new issue if you find a bug
- Feel free to ask questions!

## 📄 License

MIT License - feel free to use this code for your own projects!

---

Made with ❤️ and lots of ☕
