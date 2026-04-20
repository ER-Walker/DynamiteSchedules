import { Router } from 'express';
import { createCourse, getCourseById, getCourses } from '../controllers/courseController.js';

const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', createCourse);

export default router;
