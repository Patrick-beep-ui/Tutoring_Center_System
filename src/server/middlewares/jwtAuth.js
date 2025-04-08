import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY; 

export default function jwtAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return res.status(401).json({ message: 'Token missing' });

  const token = authHeader.split(' ')[1];  // Extract token from "Bearer <token>"
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // Store payload in req.user for further use
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
}

