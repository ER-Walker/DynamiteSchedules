import { Router } from 'express';
import { addCourseToCart, createStudent, getStudentById, getStudents } from '../controllers/studentController.js';
import { requireAuth } from '../auth/auth.js';

const router = Router();

router.get('/', getStudents);
router.patch('/cart', requireAuth, addCourseToCart);
router.get('/:id', getStudentById);
router.post('/', createStudent);

export default router;
