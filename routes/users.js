const express = require('express'),
    router = express.Router(),
    bcrypt = require('bcryptjs'),
    {
        check,
        validationResult
    } = require('express-validator'),
    config = require('config'),
    jwt = require('jsonwebtoken'),
    User = require('../models/User');

router.post('/', [
        check('name', 'Please add name').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            name,
            email,
            password
        } = req.body;

        try {
            let user = await User.findOne({
                email
            });

            if (user) {
                return res.status(400).json({
                    msg: 'User already exists'
                });
            }

            user = new User({
                name,
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
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
            res.status(500).send('Server error');
        }
    })

module.exports = router;