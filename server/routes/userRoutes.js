import { Router } from 'express';
import { createUser, getUserById, getUsers, loginUser, logoutUser, getMe } from '../controllers/userController.js';
import { requireAuth } from '../auth/auth.js';

const router = Router();

router.get('/', getUsers);
router.post('/', createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', requireAuth, getMe);
router.get('/:id', getUserById);

export default router;
