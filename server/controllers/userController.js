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
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const created = await User.create({
      username: username.trim(),
      password,
      role: role || 'student'
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
    console.log('Stored password:', user.password);
    console.log('Provided password:', password);
    if (password != user.password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};