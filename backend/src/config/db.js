const mongoose = require('mongoose');

const maskMongoUri = (uri) => {
    if (!uri) return '';
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
};

const connectWithUri = async (uri) => {
    return mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        family: 4,
    });
};

const connectDB = async () => {
    const primaryUri = process.env.MONGO_URI;
    const fallbackUri = process.env.MONGO_URI_FALLBACK;

    if (!primaryUri) {
        console.error('MongoDB connection failed: MONGO_URI is not defined');
        process.exit(1);
    }

    try {
        const conn = await connectWithUri(primaryUri);
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
        return conn;
    } catch (primaryError) {
        console.error(`MongoDB primary connection failed: ${primaryError.message}`);

        if (!fallbackUri) {
            console.error(
                `Primary URI used: ${maskMongoUri(primaryUri)}\nSet MONGO_URI_FALLBACK to a non-SRV Atlas URI if DNS/SRV resolution is failing.`
            );
            process.exit(1);
        }

        try {
            const conn = await connectWithUri(fallbackUri);
            console.log(
                `MongoDB connected successfully using fallback URI: ${conn.connection.host}`
            );
            return conn;
        } catch (fallbackError) {
            console.error(
                `MongoDB fallback connection failed: ${fallbackError.message}`
            );
            console.error(
                `Primary URI: ${maskMongoUri(primaryUri)}\nFallback URI: ${maskMongoUri(fallbackUri)}`
            );
            process.exit(1);
        }
    }
};

module.exports = connectDB;
