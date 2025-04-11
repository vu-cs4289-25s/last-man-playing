const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({message: "Missing username or password"});
        }

        const existingUser = await db.User.findOne({ where: { username } });
        if (!existingUser) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({message: "Invalid credentials"});
        }

        const token = jwt.sign(
            {userId: existingUser.user_id},
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({
            message: 'Login successful',
            token: token,
            username: existingUser.username, //username?
            user_id: existingUser.user_id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.registerUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required"});
        }

        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already in use" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await db.User.create({
            username,
            email,
            password_hash: hashedPassword
        });

        const token = jwt.sign(
            {userId: newUser.user_id},
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(201).json({
            message: 'User registered successfully',
            token: token,
            // username store
            username: newUser.username,
            user_id: newUser.user_id
        });
    } catch (error) {
        console.error('Error in registerUser:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};