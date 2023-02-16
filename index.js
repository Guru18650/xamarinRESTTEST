const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// create connection to MySQL database
const connection = mysql.createConnection({
  host: '45.138.26.6',
  user: 'root',
  password: '1234',
  database: 'xamarin_db'
});

// initialize Express app
const app = express();
const port = 3000;

// Use body-parser middleware to parse incoming JSON data
app.use(bodyParser.json());

// Register new user endpoint
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    connection.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send({ message: 'An error occurred while registering the user.' });
      } else {
        res.send({ message: 'User registered successfully.' });
      }
    });
  });
});

// Login user endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send({ message: 'An error occurred while retrieving user data.' });
    } else if (results.length === 0) {
      res.status(404).send({ message: 'User not found.' });
    } else {
      const user = results[0];
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          res.send({ message: 'Login successful.' });
        } else {
          res.status(401).send({ message: 'Incorrect password.' });
        }
      });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});