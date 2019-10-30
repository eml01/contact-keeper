const express = require('express'),
    router = express.Router(),
    bcrypt = require('bcryptjs'),
    {
        check,
        validationResult
    } = require('express-validator'),
    config = require('config'),
    jwt = require('jsonwebtoken'),
    auth = require('../middleware/auth');

const User = require('../models/User');

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            msg: 'Server Error'
        });
    }
});

router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password if required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({
        errors: errors.array()
    });
    const {
        email,
        password
    } = req.body;
    try {
        let user = await User.findOne({
            email
        });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!user || !isMatch) return res.status(400).json({
            msg: 'Invalid Credentials'
        });
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 3600
        }, (err, token) => {
            if (err) throw err;
            res.json({
                token
            });
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;