require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const otpRoutes = require('./routes/otpRoutes');
const adminRoutes = require('./routes/adminRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const runEscalationEngine = require('./services/escalationCron');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Inject Socket.IO into the req object for routes to emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log('[SOCKET.IO] A client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('[SOCKET.IO] A client disconnected:', socket.id);
  });
});

// Start Background Services
runEscalationEngine(io);

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error (Offline Mock Mode Active)');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/complaints', complaintRoutes);

app.get('/', (req, res) => {
  res.send('CivicBrain API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
