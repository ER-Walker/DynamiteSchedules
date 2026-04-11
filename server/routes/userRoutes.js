import { Router } from 'express';
import { createUser, getUserById, getUsers, loginUser } from '../controllers/userController.js';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.post('/login', loginUser);

export default router;
