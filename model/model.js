// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	userId: {
		type: Number,
		required: true,
		unique: true,
	},
	username: {
		type: String,
		required: true,
		unique: true,
	},
	fullName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	isActive: {
		type: Boolean,
	},
	gender: {
		type: String,
		required: true,
	},
	address: {
		type: String,
	},
	age: {
		type: Number,
		required: true,
	},
	favoriteColor: {
		type: String,
	},
	sal: {
		type: Number,
	},
	favoriteAnimal: {
		type: String,
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
