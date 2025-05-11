const express = require('express');
const Stripe = require('stripe');
const User = require('../models/User');
const Cash = require('../models/Cash');
require('dotenv').config({ path: './config/.env' });


const stripe = Stripe(process.env.SECRET_KEY);
const router = express.Router();

const insertCashIn = async (userId, amount, cash, currency) => {
    try {
        if (!userId || !amount || !cash || !currency) {
            return { success: false, message: 'Missing fields' };
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const trasaction = await Cash.create({
            userId: userId,
            amount: amount,
            cash: cash,
            type: 'IN',
            currency: currency
        });

        return { success: true, trasaction: trasaction };

    } catch (error) {
        console.error('Error inserting IN cash:', error);
        return { success: false, message: 'Internal server error' };
    }
};

router.post('/create-payment-link', express.json(), async (req, res) => {
    const { userId, amount, cash, currency } = req.body;

    try {
        // Cria o produto e o preço dinamicamente
        const product = await stripe.products.create({
            name: "Sogoj Cash: " + cash,
            images: ['https://www.ucl.ac.uk/mathematical-physical-sciences/sites/mathematical_physical_sciences/files/250x250-placeholder.png'],
        });

        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: amount, // valor em centavos
            currency: currency,
        });

        // Cria uma session de checkout (pagamento único)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: [
                'card',                // Cartão de crédito/débito
                'boleto',              // Boleto bancário (Brasil)
            ],
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'https://teusite.com/pagamento-sucesso',  // Redireciona após sucesso
            cancel_url: 'https://teusite.com/pagamento-cancelado', // Redireciona se cancelar
            payment_intent_data: {
                metadata: {
                    userId: userId,
                    amount: amount,
                    cash: cash,
                    currency: currency
                },
            },
        });

        res.json({ url: session.url, metadata: req.body });
    } catch (error) {
        console.error('Erro ao criar Checkout Session:', error);
        res.json({ error: 'Erro ao criar Checkout Session' });
    }
});



router.post('/webhook', express.json(), (request, response) => {
    const event = request.body;

    if (event.type == 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        insertCashIn(paymentIntent.metadata.userId, paymentIntent.metadata.amount, paymentIntent.metadata.cash, paymentIntent.metadata.currency);
    }

    response.json({ received: true });
});

module.exports = router;
