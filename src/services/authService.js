import { pool } from '../config/database.config.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async ({ username, email, password }) => {
  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );
  if (existing.rows.length > 0) {
    throw new Error('EMAIL_OR_USERNAME_EXISTS');
  }

  const password_hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
    [username, email, password_hash]
  );

  const user = result.rows[0];
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) throw new Error('INVALID_CREDENTIALS');

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });

  return {
    user: { id: user.id, username: user.username, email: user.email },
    token
  };
};

export const getMe = async (userId) => {
  const result = await pool.query(
    'SELECT id, username, email, profile_picture, created_at FROM users WHERE id = $1',
    [userId]
  );
  if (result.rows.length === 0) throw new Error('USER_NOT_FOUND');
  return result.rows[0];
};