
const { isUtf8 } = require("buffer");
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Simple route handler
app.get('/ping', (req, res) => {
	res.send('Hello, World!');
});

app.get('/users/:id', getUsers);

app.get('/users/', getAllUsers);

// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});

function getAllUsers(req, res) {

	fs.readFile('users.json', { encoding: 'utf-8' }, (error, results) => {
		if (error) {
			console.error('Error reading file:', error);
			return;
		}
		console.log(results.length);
		let users = JSON.parse(results);
		return res.send(users);
	});
}


function getUsers(req, res) {
	const startUserId = req.params.id;
	fs.readFile("users.json", { encoding: "utf-8" }, (error, results) => {
		 if (error) {
				console.error('Error reading file:', error);
				return;
		}
		const users  = JSON.parse(results);
		console.log(users.length);
		return res.send(users.slice(startUserId - 1, 20));
	});
}
