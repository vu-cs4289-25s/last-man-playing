require('dotenv').config({path: '../.env' });
const db = require('../models');

describe('Users Model Tests', () => {
    beforeAll(async () => {
        await db.sequelize.sync({alter: true});
    })

    afterEach(async () => {
        await db.User.destroy({where: {email: 'test@example.com'}});
    })

    afterAll(async () => {
        await db.sequelize.close();
    })

    it('should create a new user successfully', async () => {
        const userData = {
            username: 'testUser',
            email: 'test@example.com',
            password_hash: 'someHashedPassword'
        }

        const newUser = await db.User.create(userData);
        expect(newUser).toBeDefined();
        expect(newUser.user_id).toBeDefined();
        expect(newUser.username).toEqual('testUser');
        expect(newUser.email).toEqual('test@example.com');
        expect(newUser.password_hash).toEqual('someHashedPassword');
    })

    it('should fail if username is missing', async () => {
        expect.assertions(1);
        try {
            await db.User.create({
                email: 'test@example.com',
                password_hash: 'someHashedPassword',
            })
        } catch (error) {
            expect(error).toBeDefined();
        }
    })
})