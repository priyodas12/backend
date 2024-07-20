// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	userId: {
		type: Number,
		required: true,
		unique: true,
	},
	userName: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	emailId: {
		type: String,
		required: true,
	},
	userType: {
		type: String,
	},
	city: {
		type: String,
	},
	designation: {
		type: String,
	},
	gender: {
		type: String,
	},
	age: {
		type: Number,
	},
	salary: {
		type: Number,
	},
});

module.exports = mongoose.model('User', UserSchema);

// "username": "musdhsd914",
// "fullName": "gowns wedge",
// "gender": "Female",
// "userId": 707065036,
// "city": "New Destiny",
// "favoriteColor": "orange",
// "favoriteAnimal": "Indo-Pacific Hump-backed Dolphin",
// "email": "Dangelo48@gmail.com",
// "sal": 7141830,
// "isActive": true
