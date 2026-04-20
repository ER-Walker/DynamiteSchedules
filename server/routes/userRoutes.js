import { Router } from 'express';
import { createUser, getUserById, getUsers, loginUser, logoutUser } from '../controllers/userController.js';

const router = Router();

router.get('/', getUsers);
router.post('/', createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/:id', getUserById);

export default router;
