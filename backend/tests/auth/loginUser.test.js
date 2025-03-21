const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../models');
const { loginUser } = require('../../controllers/authController');

jest.mock('../../models', () => ({
    User: {
        findOne: jest.fn()
    }
}))

describe('loginUser',  () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if fields are missing', async () => {
        const req = {
            body:{
                username: '',
                password: '',
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await loginUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Missing username or password' });
    })

    it('should return 401 if user not found', async () => {
        db.User.findOne.mockResolvedValue(null);

        const req = {
            body: {
                username: 'veggie',
                password: 'chips'
            }
        }

        const res =  {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await loginUser(req, res);

        expect(db.User.findOne).toHaveBeenCalledWith({where: {username: 'veggie'}});
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    })

    test('should return 401 if password is invalid', async () => {
        db.User.findOne.mockResolvedValue({
            user_id: 'uuid-123',
            username: 'veggie',
            password_hash: 'hashedChipsPassword'
        });

        // Mock bcrypt.compare to return false
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

        const req = {
            body: {
                username: 'veggie',
                password: 'wrongChipsPassword'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await loginUser(req, res);

        expect(bcrypt.compare).toHaveBeenCalledWith('wrongChipsPassword', 'hashedChipsPassword');
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    test('should return 200 and a JWT token if credentials are valid', async () => {
        db.User.findOne.mockResolvedValue({
            user_id: 'uuid-123',
            username: 'veggie',
            password_hash: 'hashedChipsPassword'
        });

        // Mock bcrypt.compare to return true
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

        // Mock jwt.sign
        jest.spyOn(jwt, 'sign').mockReturnValue('fake-jwt-token');

        const req = {
            body: {
                username: 'veggie',
                password: 'correctChipsPassword'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await loginUser(req, res);

        expect(bcrypt.compare).toHaveBeenCalledWith('correctChipsPassword', 'hashedChipsPassword');
        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: 'uuid-123' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        expect(res.json).toHaveBeenCalledWith({
            message: 'Login successful',
            token: 'fake-jwt-token'
        });
    });
})
