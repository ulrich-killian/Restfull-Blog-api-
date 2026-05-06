import * as authService from '../services/authService.js';
import { pool } from '../config/database.config.js';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.registerUser({ username, email, password });
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    if (error.message === 'EMAIL_OR_USERNAME_EXISTS') {
      return res.status(409).json({ message: 'Email or username already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    await pool.query(
      'UPDATE users SET profile_picture = $1 WHERE id = $2',
      [fileUrl, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profile_picture: fileUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading profile picture', error: error.message });
  }
};