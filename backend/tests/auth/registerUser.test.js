const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../models');
const { registerUser } = require('../../controllers/authController');

jest.mock('../../models', () => ({
    User:{
        findOne: jest.fn(),
        create: jest.fn()
    }
}))

describe('registerUser',  () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if fields are missing', async () => {
        const req = {
            body:{
                // missing email, pass, etc
                username: 'john_pork'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await registerUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    })

    it('should return 409 if email is already in use', async () => {
        db.User.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });

        const req = {
            body: {
                username: 'john',
                email: 'test@example.com',
                password: 'plaintext'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await registerUser(req, res);

        expect(db.User.findOne).toHaveBeenCalledWith({where: {email: 'test@example.com'}});
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email is already in use' });
    })

    it('should create a new user and return 201 with a token', async () => {
        db.User.findOne.mockResolvedValue(null);

        db.User.create.mockResolvedValue({
            user_id: 'uuid-123',
            username: 'john',
            email: 'test@example.com'
        })

        jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

        jest.spyOn(jwt, 'sign').mockReturnValue('fake-jwt-token');

        const req = {
            body: {
                username: 'john',
                email: 'test@example.com',
                password: 'plaintext'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await registerUser(req, res);

        expect(bcrypt.hash).toHaveBeenCalledWith('plaintext', 10);

        expect(db.User.create).toHaveBeenCalledWith({
            username: 'john',
            email: 'test@example.com',
            password_hash: 'hashedPassword'
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User registered successfully',
            token: 'fake-jwt-token'
        })
    })
})