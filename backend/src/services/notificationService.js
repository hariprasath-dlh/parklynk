const Notification = require('../models/Notification');
const { getSocketServer } = require('../utils/socket');

const createNotification = async ({ userId, category, title, message }) => {
    const notification = await Notification.create({
        user: userId,
        category,
        title,
        message,
    });

    const io = getSocketServer();
    if (io) {
        io.to(`user:${String(userId)}`).emit('new-notification', {
            _id: notification._id,
            user: notification.user,
            category: notification.category,
            title: notification.title,
            message: notification.message,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        });
    }

    return notification;
};

module.exports = {
    createNotification,
};
