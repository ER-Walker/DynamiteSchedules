import { Router } from 'express';
import { createCourse, getCourseById, getCourses, updateCourse, deleteCourse } from '../controllers/courseController.js';
import { requireAuth } from '../auth/auth.js';

const router = Router();

router.get('/', getCourses);
router.post('/', requireAuth, createCourse);
router.get('/:id', getCourseById);
router.patch('/:id', requireAuth, updateCourse);
router.delete('/:id', requireAuth, deleteCourse);

export default router;
