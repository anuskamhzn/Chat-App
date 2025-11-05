import  { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // Note: Ensure this import path is correct (e.g., '../models/User')

// Middleware to check if the user is authenticated
export const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id || decoded._id, // Handle both `id` and `_id` from JWT
    };
    if (!req.user.id) {
      return res.status(400).json({ message: 'Invalid token: User ID missing' });
    }
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};