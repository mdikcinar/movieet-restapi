const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/movieet', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Db connection successfull'))
    .catch(err => console.log('db connection Error' + err));

