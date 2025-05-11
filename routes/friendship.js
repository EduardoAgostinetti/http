const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const Friendship = require('../models/Friendship');
const UserStatus = require('../models/UserStatus');
const User = require('../models/User');

router.post('/send', async (req, res) => {
  const { userId, friendId } = req.body;

  if (!userId || !friendId) {
    return res.json({ success: false, message: 'userId and friendId are required' });
  }

  if (userId === friendId) {
    return res.json({ success: false, message: 'You cannot add yourself as a friend' });
  }

  try {
    const users = await User.findAll({
      where: {
        id: [userId, friendId]
      }
    });

    if (users.length !== 2) {
      return res.json({ success: false, message: 'One or both users not found' });
    }

    const existingFriendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId, friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });

    if (existingFriendship) {
      return res.json({ success: false, message: 'Friendship already exists or is pending' });
    }

    const friendship = await Friendship.create({
      userId,
      friendId,
      status: 'pending'
    });

    return res.json({ success: true, message: 'Friend request sent', friendship });

  } catch (error) {
    console.error('Error sending friend request:', error);
    return res.json({ success: false, message: 'Internal server error' });
  }
});

router.post('/accept', async (req, res) => {
  const { userId, friendId } = req.body;

  if (!userId || !friendId) {
    return res.json({ success: false, message: 'userId and friendId are required' });
  }

  try {
    const friendship = await Friendship.findOne({
      where: {
        userId: friendId,
        friendId: userId,
        status: 'pending'
      }
    });

    if (!friendship) {
      return res.json({ success: false, message: 'Friend request not found' });
    }

    friendship.status = 'accepted';
    await friendship.save();

    return res.json({ success: true, message: 'Friend request accepted', friendship });

  } catch (error) {
    console.error('Error accepting friend request:', error);
    return res.json({ success: false, message: 'Internal server error' });
  }
});

router.post('/delete', async (req, res) => {
  const { userId, friendId } = req.body;

  if (!userId || !friendId) {
    return res.json({ success: false, message: 'userId and friendId are required' });
  }

  try {
    const deleted = await Friendship.destroy({
      where: {
        [Op.or]: [
          { userId, friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });

    if (!deleted) {
      return res.json({ success: false, message: 'Friendship not found' });
    }

    return res.json({ success: true, message: 'friendship successfully declined' });

  } catch (error) {
    console.error('Error deleting friendship:', error);
    return res.json({ success: false, message: 'Internal server error' });
  }
});

router.post('/getFriends', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: 'userId is required' });
  }

  try {
    const friendships = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { userId },
          { friendId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'Requester',
          attributes: ['id', 'nickname'],
          include: [
            {
              model: UserStatus,
              attributes: ['isOnline', 'lastOnline']
            }
          ]
        },
        {
          model: User,
          as: 'Receiver',
          attributes: ['id', 'nickname'],
          include: [
            {
              model: UserStatus,
              attributes: ['isOnline', 'lastOnline']
            }
          ]
        }
      ]
    });

    const friends = friendships.map(f => {
      const isRequester = f.userId === userId;
      const friendData = isRequester ? f.Receiver : f.Requester;

      return {
        id: friendData.id,
        nickname: friendData.nickname,
        status: friendData.UserStatus // adiciona status do usuário
          ? {
              isOnline: friendData.UserStatus.isOnline,
              lastOnline: friendData.UserStatus.lastOnline
            }
          : null
      };
    });

    return res.json({
      success: true,
      friends
    });

  } catch (error) {
    console.error('Error retrieving friends:', error);
    return res.json({ success: false, message: 'Internal server error' });
  }
});


router.post('/getIdByNickname', async (req, res) => {
  const { nickname } = req.body;

  if (!nickname) {
    return res.json({ success: false, message: 'Nickname is required' });
  }

  try {
    const user = await User.findOne({ where: { nickname } });

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      userId: user.id,
      nickname: user.nickname
    });

  } catch (error) {
    console.error('Error retrieving user by nickname:', error);
    return res.json({ success: false, message: 'Internal server error' });
  }
});

router.post('/received', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: 'userId is required' });
  }

  try {
    const receivedRequests = await Friendship.findAll({
      where: {
        friendId: userId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'Requester',
          attributes: ['id', 'nickname']
        }
      ]
    });

    return res.json({
      success: true,
      total: receivedRequests.length, // quantidade total de recebidos
      requests: receivedRequests
    });
  } catch (error) {
    console.error('Error retrieving received friend requests:', error);
    return res.json({ success: false, message: 'Internal server error' });
  }
});


router.post('/sent', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: 'userId is required' });
  }

  try {
    const sentRequests = await Friendship.findAll({
      where: {
        userId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'Receiver',
          attributes: ['id', 'nickname']
        }
      ]
    });

    return res.json({
      success: true,
      requests: sentRequests
    });
  } catch (error) {
    console.error('Error retrieving sent friend requests:', error);
    return res.json({ success: false, message: 'Internal server error' });
  }
});

router.post('/searchByNickname', async (req, res) => {
  const { nickname } = req.body;

  if (!nickname) {
    return res.json({ success: false, message: 'Nickname is required' });
  }

  try {
    const users = await User.findAll({
      where: {
        nickname: {
          [Op.iLike]: `%${nickname}%`  // PostgreSQL → busca parcial ignorando maiúsculas/minúsculas
        }
      },
      attributes: ['id', 'nickname']
    });

    if (users.length === 0) {
      return res.json({ success: false, message: 'No users found' });
    }

    return res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Error searching users by nickname:', error);
    return res.json({ success: false, message: 'Internal server error' });
  }
});


module.exports = router;
