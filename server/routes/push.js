const webPush = require('web-push');
const { publicVapidKey, privateVapidKey } = require('../config/prod');
const { Subscriber } = require('../models/Subscriber');

const pushNotification = async (req, users) => {
    const payload = {
        title: req.title,
        message: req.message,
        url: req.url,
        ttl: req.ttl,
        icon: req.icon,
        image: req.image,
        badge: req.badge,
        tag: req.tag
    };

    Subscriber.find({ name: { $in: users }}, (err, subscriptions) => {
        if (err) {
            console.error(`Error occurred while getting subscriptions`);
        } else {
            let parallelSubscriptionCalls = subscriptions.map((subscription) => {
                return new Promise((resolve, reject) => {
                    const pushSubscription = {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.keys.p256dh,
                            auth: subscription.keys.auth
                        }
                    };

                    const pushPayload = JSON.stringify(payload);
                    const pushOptions = {
                        vapidDetails: {
                            subject: 'mailto:yashwantsandey2000@gmail.com',
                            privateKey: publicVapidKey,
                            publicKey: privateVapidKey
                        },
                        TTL: payload.ttl,
                        headers: {}
                    };
                    webPush.sendNotification(
                        pushSubscription,
                        pushPayload,
                        pushOptions
                    ).then((value) => {
                        resolve({
                            status: true,
                            endpoint: subscription.endpoint,
                            data: value
                        });
                    }).catch((err) => {
                        reject({
                            status: false,
                            endpoint: subscription.endpoint,
                            data: err
                        });
                    });
                });
            });
            Promise.allSettled(parallelSubscriptionCalls).then((pushResults) => {
                console.info(pushResults);
            });
        }
    });
}

module.exports = { pushNotification }