const express = require('express');
const cors = require('cors');

const signin = require('./routes/signin');
const signup = require('./routes/signup');
const codes = require('./routes/codes');
const cash = require('./routes/cash');
const stripe = require('./routes/stripe');
const friendship = require('./routes/friendship');
const userStatus = require('./routes/userStatus');

require('./models/syncModels');


const app = express();
const PORT = 3000; 

app.use(express.json());
app.use(cors());

app.use('/signin', signin);
app.use('/signup', signup);
app.use('/codes', codes);
app.use('/cash', cash);
app.use('/stripe', stripe);
app.use('/friendship', friendship);
app.use('/userStatus', userStatus);

app.listen(PORT, () => {
    console.log(` HTTP running at port: 3000`);
});
