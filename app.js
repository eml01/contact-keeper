const express = require('express'),
    app = express(),
    PORT = process.env.PORT || 5000,
    mongoose = require('mongoose');

//Connect to DB
mongoose.connect('mongodb://localhost:27017/contact_keeper', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => {
        console.log(err.message);
        process.exit(1);
    });

//Allow to use json
app.use(express.json({
    extended: false
}));

//Use routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));

//Listen to port PORT in .env or 5000 by default
app.listen(PORT, (req, res) => {
    console.log(`Server started on port ${PORT}`);
});