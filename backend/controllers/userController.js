// TODO - Replace dummy values and placeholder code after DB Integration

exports.getUserProfile = (req, res) => {
    try {
        /**
         * Extract user info from token and use it to query the DB
         * For now we will use dummy values
         * Placeholder code, NOT to be used for production
         **/
        const dummyUser = {
            user_id: 'fakeUserId',
            username: 'fakeUserName',
        };

        return res.json({
            message: 'User profile fetched successfully',
            user: {
                user_id: dummyUser.username,
            }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}