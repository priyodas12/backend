const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017';
const connectDB = async () => {
	try {
		await mongoose.connect(url, {});
		console.log('MongoDB connected');
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
};

module.exports = connectDB;

