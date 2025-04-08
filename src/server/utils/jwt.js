import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY; 

export function generateToken(user) {
    console.log('Generating token for user:', user);
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role
    },  
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}
