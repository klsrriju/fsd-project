import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/env';

export type AppRole = 'hr' | 'recruiter' | 'candidate';

export type AuthUser = {
  id: string;
  email: string;
  role: AppRole;
  passwordHash: string;
};

const users: AuthUser[] = [
  {
    id: 'user-hr-1',
    email: 'hr@company.com',
    role: 'hr',
    passwordHash: bcrypt.hashSync('password123', 10)
  },
  {
    id: 'user-recruiter-1',
    email: 'recruiter@company.com',
    role: 'recruiter',
    passwordHash: bcrypt.hashSync('password123', 10)
  },
  {
    id: 'user-candidate-1',
    email: 'candidate@company.com',
    role: 'candidate',
    passwordHash: bcrypt.hashSync('password123', 10)
  }
];

export function verifyPassword(password: string, user: AuthUser) {
  return bcrypt.compareSync(password, user.passwordHash);
}

export function findUserByEmail(email: string) {
  return users.find((user) => user.email === email);
}

export function signToken(user: AuthUser) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    config.jwtSecret,
    { expiresIn: '1h' }
  );
}
