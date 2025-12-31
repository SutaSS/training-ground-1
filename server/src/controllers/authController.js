import { authService } from '../services/authService.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password, fullName, phone, address } = req.body;

      // Validasi input
      if (!email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and fullName are required',
        });
      }

      const result = await authService.register(email, password, fullName, phone, address);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      if (error.message === 'Email already registered') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      if (error.message === 'Invalid email or password' || error.message === 'Account is blocked') {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const userId = req.user.userId; // dari middleware authenticate

      const profile = await authService.getProfile(userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },
};