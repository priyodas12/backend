const { faker } = require('@faker-js/faker');
const { isUtf8 } = require('buffer');
const { error } = require('console');
const { getRandomValues } = require('crypto');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { Http2ServerRequest } = require('http2');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const connectDB = require('./mongo-db');
const User = require('./model/model');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

const corsOptions = {
	credentials: true,
	origin: [
		'http://localhost:3000',
		'http://localhost:4200',
		'http://localhost:1300',
	],
};

connectDB();

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, './Template/')));

// Simple route handler
app.get('/application/health/status', (req, res) => {
	res.sendFile(path.resolve(__dirname, './Template/', 'index.html'));
});

const ERROR_500 = {
	message: 'MongoDB: Error while database opeartion.',
};

const ERROR_400 = {
	message: 'Bad Credentials: UserName Already Exists',
};

app.get('/api/v2/users/', getAllUsersV2);
app.get('/api/v2/users/:userId', getUserByIdV2);
app.post('/api/v2/user/', createUserV2);
app.delete('/api/v2/users/:userId', deleteUserV2);
app.put('/api/v2/users/', updateUserV2);

// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});

async function getAllUsersV2(req, res) {
	try {
		console.log('------------------------------------>GET: /api/v2/users/');
		const users = await User.find();
		res.json(users);
	} catch (err) {
		console.error(err.message);
		res.status(500).send(ERROR_500);
	}
}

async function createUserV2(req, res) {
	try {
		console.log(
			'----------------------------------->POST: /api/v2/users/',
			req.body,
		);
		let {
			userName,
			firstName,
			lastName,
			emailId,
			userType,
			city,
			designation,
			gender,
			age,
			salary,
		} = req.body;

		console.log(
			userName,
			firstName,
			lastName,
			emailId,
			userType,
			city,
			designation,
			gender,
			age,
			salary,
		);

		let userId = crypto.randomInt(100000000);
		const hashPassword = faker.date.anytime().getTime().toString();
		const hashedPassword = await bcrypt.hash(hashPassword, 10);
		if (city === null || city === undefined || city === '') {
			city = faker.address.city();
		}
		if (
			designation === null ||
			designation === undefined ||
			designation === ''
		) {
			designation = faker.name.jobTitle();
		}
		if (salary === null || salary === undefined || salary === 0) {
			salary = faker.commerce.price();
		}

		const users = await User.find();

		if (users.some((user) => user.userName === userName)) {
			return res.status(201).json(ERROR_400);
		}

		console.log('hashed Password::', hashedPassword);

		const user = new User({
			userId,
			userName,
			password: hashedPassword,
			firstName,
			lastName,
			emailId,
			userType,
			city,
			designation,
			gender,
			age,
			salary,
		});
		console.log('Saving user::', user);

		await user.save();

		res.status(201).json(user);
	} catch (error) {
		console.error(error.message);
		res.status(500).send(ERROR_500);
	}
}

async function updateUserV2(req, res) {
	const { fullName, age, email, address, sal, isActive } = req.body;

	try {
		let user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: 'User not found' });

		user.emailId = email || user.emailId;
		user.age = age || user.age;
		user.firstName = fullName || user.firstName;
		user.userType = isActive || user.userType;
		user.city = address || user.city;
		user.salary = sal || user.salary;

		await user.save();
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send(ERROR_500);
	}
}

async function deleteUserV2(req, res) {
	console.log('DELETE: /api/v2/users/', req.param);
	try {
		let userId = Number(req.params.userId);
		const users = await User.find({ userId: userId });
		console.log('removing user object: ', users);
		if (!users) return res.status(404).json({ message: 'User not found' });
		let idPk = users[0].id;
		console.log('Removing User:: ', idPk);
		await User.findByIdAndDelete(idPk);
		res.json({ message: 'User removed' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send(ERROR_500);
	}
}

async function getUserByIdV2(req, res) {
	try {
		console.log(
			'---------------------------------->GET: /api/v2/users/' +
				req.params.userId,
		);
		const user = await User.find({ userId: Number(req.params.userId) });

		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json({ ...user });
	} catch (err) {
		console.error(err.message);
		res.status(500).send(ERROR_500);
	}
}


