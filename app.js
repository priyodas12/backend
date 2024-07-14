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

//Routing end points;
app.get('/api/v1/users/', getAllUsers);
app.get('/api/v1/users/:userId', getUserById);
app.get('/api/v1/users/search/:searchString', searchUserByName);
app.post('/api/v1/users/', createUser);
app.delete('/api/v1/users/:userId', deleteUser);
app.put('/api/v1/users/', updateUser);

app.get('/api/v2/users/', getAllUsersV2);
app.get('/api/v2/users/:userId', getUserByIdV2);
app.post('/api/v2/users/', createUserV2);
app.delete('/api/v2/users/:userId', deleteUserV2);
app.put('/api/v2/users/', updateUserV2);

// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});

///CURD operation in MongoDB////////////////////////////////////////////////////////////////
const ERROR_500 = {
	message: 'MongoDB: Error while database opeartion.',
};
async function getAllUsersV2(req, res) {
	try {
		const users = await User.find();
		res.json(users);
	} catch (err) {
		console.error(err.message);
		res.status(500).send(ERROR_500);
	}
}

async function createUserV2(req, res) {
	const { username, fullName, age, gender } = req.body;

	const users = await User.find({ username: username });
	console.log(users);
	if (users.length > 0)
		return res.status(400).json({
			message: 'Username already exists, Try with another username!',
		});

	try {
		let userId = Math.floor(Math.random() * 100000000);
		let sal = Math.random() * 100000;
		let email = faker.internet.email();
		let address =
			faker.location.streetAddress() + ', ' + faker.location.zipCode();
		let favoriteColor = faker.color.human();
		let favoriteAnimal = faker.animal.cetacean();
		let isActive = true;

		let user = new User({
			userId,
			username,
			fullName,
			age,
			gender,
			email,
			address,
			sal,
			favoriteColor,
			favoriteAnimal,
			isActive,
		});
		await user.save();
		res.status(201).json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send(ERROR_500);
	}
}

async function updateUserV2(req, res) {
	const {
		fullName,
		age,
		email,
		address,
		sal,
		favoriteColor,
		favoriteAnimal,
		isActive,
	} = req.body;

	try {
		let user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: 'User not found' });

		user.email = email || user.email;
		user.age = age || user.age;
		user.fullName = fullName || user.fullName;
		user.isActive = isActive || user.isActive;
		user.favoriteColor = favoriteColor || user.favoriteColor;
		user.favoriteAnimal = favoriteAnimal || user.favoriteAnimal;
		user.address = address || user.address;
		user.sal = sal || user.sal;

		await user.save();
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send(ERROR_500);
	}
}

async function deleteUserV2(req, res) {
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
		const user = await User.findById(req.params.id);
		console.log('removing user: ', user?.username);
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json({ ...user });
	} catch (err) {
		console.error(err.message);
		res.status(500).send(ERROR_500);
	}
}

///CURD operation  in file//////////////////////////////////////////////////////////////////
async function loadAllUsers() {
	try {
		const filePath = path.join(__dirname, 'users.json');
		const results = await fs.readFile(filePath, { encoding: 'utf-8' });
		const allUserArray = JSON.parse(results);

		const newUserArray = allUserArray.map((obj) => ({
			...obj,
			sal: Math.round(Math.random() * 10000000),
			email: faker.internet.email(),
			isActive: faker.datatype.boolean(),
		}));

		return newUserArray;
	} catch (error) {
		console.error('Error reading file:', error);
		return;
	}
}
/**
 * Fetches all users and sends the user data as a response.
 *
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} req.params - The route parameters.
 * @param {Object} req.originalUrl - The original URL of the request.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends the user data or an error message as a response.
 *
 * @example
 * // Assume the route is set up in your Express app
 * // GET /users
 * app.get('/users/:userId', getAllUsers);
 */
async function getAllUsers(req, res) {
	try {
		console.log('Requested:: ', req.originalUrl);

		const usersList = await loadAllUsers(); // Wait for loadAllUsers to complete

		return res.send(usersList);
	} catch (error) {
		console.error('Error fetching users:', error);
		return res.status(500).send('Error fetching users');
	}
}
/**
 * Fetches a user by their ID from a list of users and sends the user data as a response.
 *
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} req.params - The route parameters.
 * @param {string} req.params.userId - The ID of the user to fetch.
 * @param {Object} req.originalUrl - The original URL of the request.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends the user data or an error message as a response.
 *
 * @example
 * // Assume the route is set up in your Express app
 * // GET /users/123
 * app.get('/users/:userId', getUserById);
 */
async function getUserById(req, res) {
	try {
		console.log('Requested:: ', req.originalUrl);
		const userId = +req.params.userId;

		const usersList = await loadAllUsers(); // Wait for loadAllUsers to complete

		const searchedUser = usersList.filter((usr) => usr.userId === userId);

		return res.send(searchedUser);
	} catch (error) {
		console.error('Error fetching users:', error);
		return res.status(500).send('Error fetching users');
	}
}
/**
 * search user by username sends the user data as a response.
 *
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} req.params - The route parameters.
 * @param {string} req.params.searchString - searched string.
 * @param {Object} req.originalUrl - The original URL of the request.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Sends the user data or an error message as a response.
 *
 * @example
 * // Assume the route is set up in your Express app
 * // GET /users/123
 * app.get('/users/:searchString', searchUserByName);
 */
async function searchUserByName(req, res) {
	try {
		console.log('Requested:: ', req.originalUrl);
		const searchedString = req.params.searchString;

		console.log('Searching for username: ', searchedString);

		const usersList = await loadAllUsers(); // Wait for loadAllUsers to complete

		const searchedUsersResults = usersList.filter((obj) => {
			return obj.username
				.toLowerCase()
				.includes(searchedString.toLowerCase());
		});

		return res.send(searchedUsersResults);
	} catch (error) {
		console.error('Error fetching users:', error);
		return res.status(500).send('Error fetching users');
	}
}

async function createUser(req, res) {
	let usersList = await loadAllUsers();

	let requestNewUser = req.body;

	let isUniqueUserName = usersList.some(
		(user) => user.username === requestNewUser.username,
	);
	console.log(
		'username ',
		requestNewUser.username,
		'is unique ? ',
		isUniqueUserName,
	);
	if (isUniqueUserName) {
		const response = {
			status: 400,
			message: 'User Already exists!',
		};

		res.status(400).json(response);
	} else {
		usersList.sort((a, b) => (a.userId > b.userId ? 1 : -1));

		let listLength = usersList.length - 1;

		requestNewUser.userId =
			listLength + Math.round(Math.random() * 1000000000);
		requestNewUser.city = faker.location.city();
		requestNewUser.favoriteColor = faker.color.human();
		requestNewUser.favoriteAnimal = faker.animal.cetacean();
		requestNewUser.email = faker.internet.email();

		console.log('Creating new user: ', requestNewUser);

		usersList.push(requestNewUser);

		const jsonString = JSON.stringify(usersList, null, 2);

		writeToFile(jsonString);
		res.send(requestNewUser);
	}
}

async function deleteUser(req, res) {
	let usersList = await loadAllUsers();

	let deleteUserId = +req.params.userId;

	console.log('deleteUserId: ', deleteUserId);

	usersList.sort((a, b) => (a.userId > b.userId ? 1 : -1));

	let deleteUser = usersList.filter((usr) => usr.userId === deleteUserId);

	console.log('Deleting  user: ', deleteUser);

	usersList.splice(
		usersList.findIndex((a) => a.id === deleteUserId),
		1,
	);

	const jsonString = JSON.stringify(usersList, null, 2);

	writeToFile(jsonString);

	res.send(deleteUser);
}

async function updateUser(req, res) {
	let usersList = await loadAllUsers();

	let requestUpdateUser = req.body;

	console.log('requestUpdateUser', requestUpdateUser);

	usersList.sort((a, b) => (a.userId > b.userId ? 1 : -1));

	const updatedUsersList = usersList.map((user) =>
		user.userId === requestUpdateUser.userId
			? { ...user, ...requestUpdateUser }
			: user,
	);

	console.log('Updating user: ', updatedUsersList);

	usersList.push(updatedUsersList);

	const jsonString = JSON.stringify(usersList, null, 2);

	writeToFile(jsonString);

	res.send(requestUpdateUser);
}

async function writeToFile(jsonString) {
	// @ts-ignore
	fs.writeFile('users.json', jsonString, (err) => {
		if (err) {
			console.error('Error writing file:', err);
		} else {
			console.log('File has been written');
		}
	});
}


