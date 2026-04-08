import { Router } from 'express';
import { createUser, getUserById, getUsers } from '../controllers/userController.js';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);

export default router;
