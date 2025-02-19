// controllers/authController,js

// TODO - Replace dummy values and placeholder code after DB Integration

exports.loginUser = (req, res) => {
    try {
        const { user, pass } = req.body;

        if (!user || !pass) {
            return res.status(400).json({ message: "Missing username or password"});
        }


        /**
         * Check if the user exists in the database. The database is not connected so as
         * of right now we will use dummy data.
         * Placeholder code, NOT to be used for production
         **/

        const dummyUser = {
            username: 'dummyUser',
            passwordHash: 'somehashedpassword'
        };

        if (!dummyUser) {
            return res.status(404).json({ message: "User not found"});
        }

        /**
         * Compare password with stored hash
         * Placeholder code, NOT to be used for production
         **/

        const isPasswordValid = pass === 'plaintext'; // Placeholder text

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        /**
         * Generate a session/token
         * Placeholder code, NOT to be used for production
         **/

        const token = 'dummy-jwt-token';

        return res.json({
            message: 'Login successful',
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.registerUser = (req, res) => {
    try {
        const { user, pass } = req.body;

        if (!user || !pass) {
            return res.status(400).json({ message: "Username and password are required"});
        }

        /**
         * Check if the user exists
         * Will query the DB when it exists
         * Placeholder code, NOT to be used for production
         **/

        const existingUser = null;

        if (existingUser) {
            return res.status(409).json({ message: "User already exist" });
        }

        /**
         * Hash the password
         * Will finish with DB integration
         * Placeholder code, NOT to be used for production
         **/

        const hashedPassword = 'fakeHashedPassword';

        /**
         * Create and save the new user in the DB
         * Will create User models
         * Placeholder code, NOT to be used for production
         **/

        const newUser = {
            user_id: 'some-unique-id',
            user,
            password_hash: hashedPassword,
        }

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.user_id,
                username: newUser.user,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};