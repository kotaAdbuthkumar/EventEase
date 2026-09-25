import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eventease_super_secret_jwt_key_2026_production_grade');

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        profileImage: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token authentication failed.' });
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const userRole = req.user.role?.toUpperCase();
    const authorized = allowedRoles.map(r => r.toUpperCase()).includes(userRole);

    if (!authorized) {
      return res.status(403).json({
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};
