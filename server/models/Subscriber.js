const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriberSchema = new Schema({
    name: {type: String, index: true, unique: true},
    endpoint: String,
    keys: Schema.Types.Mixed,
    createDate: {
        type: Date,
        default: Date.now
    }
});

const Subscriber = mongoose.model('subscriber', SubscriberSchema);

module.exports = { Subscriber };