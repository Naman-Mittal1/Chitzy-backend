const { body } = require('express-validator');

exports.createUserSchema = [
    body('name').trim().exists().withMessage('Name is required'),
    body('email').trim().exists().withMessage('Email is required').isEmail().withMessage('Must be a valid email').normalizeEmail(),
    body('password').trim().exists().withMessage('Password is required').notEmpty().isLength({ min: 6 }).withMessage('Password must contain at least 6 characters'),
    body('username').trim().exists().withMessage('Username is required').notEmpty().isLength({ min: 3 }).withMessage('Username must be of 3 characters')
];

exports.validateLoginSchema = [
    body('usernameOrEmail').notEmpty().withMessage('Username or email is required'),
    body('password').trim().notEmpty().withMessage('Password is required'),
];