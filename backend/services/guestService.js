const User = require('../models/user');
const {v4 : uuidv4 } = require('uuid');

exports.createGuestUser = async () => {
    const randomSuffix = Math.random().toString(36).substr(2,8);
    const guestUsername = `Guest_${randomSuffix}`;

    // Create guest user and store it in the DB
    const newGuest = await User.create({
        user_id: uuidv4(),
        username: guestUsername,
        email: `guest_${randomSuffix}@example.com`,
        password_hash: 'guest_account',
        profile_image_url: null, // could be something funny
    });

    return {
        user_id: newGuest.user_id,
        username: newGuest.username,
        email: newGuest.email,
    };
};
