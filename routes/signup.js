const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const moment = require('moment');
const router = express.Router();

// Registration route
router.post('/', express.json(), async (req, res) => {
    const { name, email, username, nickname, password, confirmPassword, birthdate } = req.body;

    // Validate input
    if (!name || !email || !username || !password || !confirmPassword || !birthdate || !nickname) {
        return res.json({ success: false, message: 'All fields are required.' });
    }

    if(password !== confirmPassword){
        return res.json({ success: false, message: 'Password`s do not match!' });
    }

    let formattedBirthdate = moment(birthdate, ['YYYY-M-D', 'YYYY-MM-DD'], true);

    if (!formattedBirthdate.isValid()) {
        return res.json({ success: false, message: 'Invalid birthdate.' });
    }
    
    const finalBirthdate = formattedBirthdate.format('YYYY-MM-DD');
    

    try {
        // Check if the username or email already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.json({ success: false, message: 'Username is already taken.' });
        }

        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.json({ success: false, message: 'Email is already registered.' });
        }

        const existingNickname = await User.findOne({ where: { nickname } });
        if (existingNickname) {
            return res.json({ success: false, message: 'Nickname is already registered.' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = await User.create({
            name,
            email,
            username,
            nickname,
            password: hashedPassword,
            birthdate: finalBirthdate,
            isActive: false
        });

        return res.json({
            success: true,
            message: 'User registered successfully!',
            user: newUser
        });

    } catch (error) {
        console.error('Error during registration:', error);
        return res.json({ success: false, message: 'Internal server error.' });
    }
});

module.exports = router;
