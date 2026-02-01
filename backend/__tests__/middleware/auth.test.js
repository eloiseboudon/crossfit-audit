const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../../middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('protect middleware', () => {
    it('devrait authentifier avec token valide', async () => {
      const token = jwt.sign(
        { id: 'user123', email: 'test@test.com', role: 'user' },
        process.env.JWT_SECRET
      );

      req.headers.authorization = `Bearer ${token}`;

      await protect(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('user123');
      expect(next).toHaveBeenCalled();
    });

    it('devrait rejeter sans token', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait rejeter avec token invalide', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('authorize middleware', () => {
    it('devrait autoriser rôle admin', () => {
      req.user = { role: 'admin' };

      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('devrait rejeter utilisateur non autorisé', () => {
      req.user = { role: 'user' };

      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
