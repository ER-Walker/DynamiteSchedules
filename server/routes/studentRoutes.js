import { Router } from 'express';
import {
  addCourseToCart,
  createStudent,
  getCurrentStudentCart,
  getStudentById,
  getStudents,
  moveCartToCurrentClasses,
  removeSelectedCoursesFromCart
} from '../controllers/studentController.js';
import { requireAuth } from '../auth/auth.js';

const router = Router();

router.get('/', getStudents);
router.get('/cart', requireAuth, getCurrentStudentCart);
router.patch('/cart/commit', requireAuth, moveCartToCurrentClasses);
router.patch('/cart/remove', requireAuth, removeSelectedCoursesFromCart);
router.patch('/cart', requireAuth, addCourseToCart);
router.get('/:id', getStudentById);
router.post('/', createStudent);

export default router;
