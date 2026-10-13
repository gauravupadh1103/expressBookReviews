
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

// Register/login users
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  const token = jwt.sign({ username }, 'access', { expiresIn: '1h' });

  req.session.authorization = token;

  return res.status(200).json({
    message: 'User successfully logged in',
    token
  });
});

// Add or update a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const username = req.user?.username;
  const isbn = req.params.isbn;
  const review = req.body?.review;

  if (!username) {
    return res.status(401).json({
      message: 'User not authenticated'
    });
  }

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  if (!review) {
    return res.status(400).json({
      message: 'Review is required'
    });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: 'Review added or updated successfully',
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
