import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export async function getUsers(req, res) {
  try {
    const users = await User.find().select('_id username role').sort({ username: 1 });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
}

export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select('_id username role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid user id', error: err.message });
  }
}

export async function createUser(req, res) {
  try {
    const { username, password, code } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    let role ='student';
   if (code && code === process.env.ADMIN_CODE) {
    role = 'admin';
   }

    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const created = await User.create({
      username: username.trim(),
      password,
      role
    });

    return res.status(201).json({
      _id: created._id,
      username: created.username,
      role: created.role
    });
  } catch (err) {
    return res.status(400).json({ message: 'Failed to create user', error: err.message });
  }
}

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt:', username, password);
  try {
    const user = await User.findOne({ username });
    console.log('User found:', user);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    if (password != user.password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign( 
      { username: user.username, role: user.role },
      process.env.SECRET,
      { expiresIn: '1h' }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
}

export const logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
  });
  res.status(200).json({ message: 'Logout successful' });
};