const http = require('http');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { setSocketServer } = require('./src/utils/socket');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
        },
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error('Socket authentication failed'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = String(decoded.id);
            next();
        } catch (error) {
            next(new Error('Socket authentication failed'));
        }
    });

    io.on('connection', (socket) => {
        socket.join(`user:${socket.userId}`);
        socket.emit('socket-connected', { userId: socket.userId });
    });

    setSocketServer(io);

    server.listen(PORT, () => {
        console.log(`ParkLynk server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
});
