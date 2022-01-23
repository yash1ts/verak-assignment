const express = require('express');
const { auth } = require('../middleware/auth');
const { Subscriber } = require('../models/Subscriber');
const router = express.Router();

router.post('/', auth, (req, res) => {
    const model = {
        name: req.user.name,
        endpoint: req.body.endpoint,
        keys: req.body.keys
    }
    const subscriptionModel = new Subscriber(model);
    subscriptionModel.save((err, subscription) => {
        if (err) {
            console.error(`Error occurred while saving subscription. Err: ${err}`);
            res.status(500).json({
                status: 'failed',
                error: 'Technical error occurred'
            });
        } else {
            res.status(200).json({ status: 'success' });
        }
    });
})

module.exports = router;