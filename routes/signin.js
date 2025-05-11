const express = require('express');
const User = require('../models/User');
const Cash = require('../models/Cash');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.post('/', express.json(), async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.json({ success: false, message: 'username and password are required.' });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.json({ success: false, message: 'User not found.' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ success: false, message: 'Invalid username or password.' });
        }

        const userData = user.toJSON();
        delete userData.password;
        delete userData.createdAt;
        delete userData.updatedAt;

        return res.json({
            success: true,
            message: 'Login successful!',
            user: userData
        });


    } catch (error) {
        return res.json({ success: false, message: 'Internal server error.' });
    }
});


module.exports = router;
