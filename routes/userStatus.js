const express = require('express');
const router = express.Router();
const UserStatus = require('../models/UserStatus');
const User = require('../models/User');

// GET /status/:userId
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const status = await UserStatus.findOne({
            where: { userId },
            include: {
                model: User,
                attributes: ['username', 'nickname'],
            }
        });

        if (!status) {
            return res.json({success: false, message: 'Status not found for user' });
        }

        res.json({
            success: true,
            status: status
        });
    } catch (error) {
        console.error('Error fetching user status:', error);
        res.json({success: false, message: 'Internal Server Error' });
    }
});

// POST /status
router.post('/', async (req, res) => {
    const { userId, isOnline } = req.body;

    if (!userId || typeof isOnline !== 'boolean') {
        return res.json({ success: false, message: 'userId and isOnline are required' });
    }

    try {
        await UserStatus.upsert({
            userId,
            isOnline,
            lastOnline: isOnline ? null : new Date()
        });

        res.json({success: true, message: 'User status saved successfully' });
    } catch (error) {
        console.error('Error saving user status:', error);
        res.json({success: false, message: 'Internal Server Error' });
    }
});


module.exports = router;
