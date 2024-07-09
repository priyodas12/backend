const faker = require('faker');
const { isUtf8 } = require('buffer');
const { error } = require('console');
const { getRandomValues } = require('crypto');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { Http2ServerRequest } = require('http2');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.use(express.static(path.join(__dirname, './Template/')));

// Simple route handler
app.get('/application/health/status', (req, res) => {
	res.sendFile(path.resolve(__dirname, './Template/', 'index.html'));
});

//Routing end points;
app.get('/api/v1/users/', getAllUsers);
app.get('/api/v1/users/:userId', getUserById);
app.get('/api/v1/users/search/:searchString', searchUserByName);

// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});

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

		console.log('searching for: ', searchedString);

		const usersList = await loadAllUsers(); // Wait for loadAllUsers to complete

		const searchedUsersResults = usersList.filter((obj) => {
			return obj.username.includes(searchedString);
		});

		return res.send(searchedUsersResults);
	} catch (error) {
		console.error('Error fetching users:', error);
		return res.status(500).send('Error fetching users');
	}
}
