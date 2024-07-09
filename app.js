const faker = require('faker');
const { isUtf8 } = require('buffer');
const { error } = require('console');
const { getRandomValues } = require('crypto');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Simple route handler
app.get('/ping', (req, res) => {
	res.send('Hello, User!');
});

app.get('/users/:userId', getUserById);

app.get('/users/', getAllUsers);

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
async function getAllUsers(req, res) {
	try {
		console.log('Requested:: ', req.originalUrl);

		const usersList = await loadAllUsers(); // Wait for loadAllUsers to complete
		//console.log('Total Users List:', usersList);

		return res.send(usersList);
	} catch (error) {
		console.error('Error fetching users:', error);
		return res.status(500).send('Error fetching users');
	}
}

async function getUserById(req, res) {
	try {
		console.log('Requested:: ', req.originalUrl);
		const userId = +req.params.userId;

		const usersList = await loadAllUsers(); // Wait for loadAllUsers to complete
		//console.log('Total Users List:', usersList);
		const searchedUser = usersList.filter((usr) => usr.userId === userId);

		return res.send(searchedUser);
	} catch (error) {
		console.error('Error fetching users:', error);
		return res.status(500).send('Error fetching users');
	}
}
