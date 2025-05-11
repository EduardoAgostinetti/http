const express = require('express');
const Cash = require('../models/Cash');
const User = require('../models/User');
const router = express.Router();


router.post('/get', async (req, res) => {
  const { userId } = req.body;
  try {

    const cashList = await Cash.findAll({ where: { userId: userId } });

    let totalIn = 0;
    let totalOut = 0;

    cashList.forEach((value) => {
      if (value.type === 'IN') {
        totalIn += value.cash;
      } else if (value.type === 'OUT') {
        totalOut += value.cash;
      }
    });

    const total = totalIn - totalOut;

    return res.json({
      success: true,
      cashList: cashList,
      totalIn: totalIn,
      totalOut: totalOut,
      total: total
    });

  } catch (error) {
    console.error('Error fetching cash:', error);
    return res.json({ success: false, message: 'Internal server error.' });
  }
});

router.post('/out', async (req, res) => {
  const { userId, cash, itemId, itemType } = req.body;

  try {
    if (!userId || !cash || !itemId || !itemType) {
      return res.json({ success: false, message: 'Missing fields' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }


    const cashList = await Cash.findAll({ where: { userId } });

    let totalIn = 0;
    let totalOut = 0;

    cashList.forEach((c) => {
      if (c.type === 'IN') totalIn += c.cash;
      else if (c.type === 'OUT') totalOut += c.cash;
    });

    const total = totalIn - totalOut;

    if (cash > total) {
      return res.json({ success: false, message: 'Insufficient balance' });
    }


    // Cria a transação de saída
    const transaction = await Cash.create({
      userId,
      amount: 0,
      cash,
      type: 'OUT',
      currency: 'SOG',
    });
    

    return res.json({
      success: true,
      message: "Item pucharshed, congratulations!",
      transaction,
      acquired,
    });

  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: 'Internal server error' });
  }
});


module.exports = router;
