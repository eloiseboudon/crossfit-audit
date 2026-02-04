const jwt = require('jsonwebtoken');
const { auth, isAdmin } = require('../../middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  describe('protect middleware', () => {
    it('devrait authentifier avec token valide', async () => {
      const token = jwt.sign(
        { id: 'user123', email: 'test@test.com', role: 'user' },
        process.env.JWT_SECRET
      );

      req.headers.authorization = `Bearer ${token}`;

      await auth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('user123');
      expect(next).toHaveBeenCalled();
    });

    it('devrait rejeter sans token', async () => {
      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait rejeter avec token invalide', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('authorize middleware', () => {
    it('devrait autoriser rôle admin', () => {
      req.user = { role: 'admin' };
      
      isAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('devrait rejeter utilisateur non autorisé', () => {
      req.user = { role: 'user' };
      
      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
