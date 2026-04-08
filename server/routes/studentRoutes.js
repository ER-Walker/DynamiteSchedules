import { Router } from 'express';
import { createStudent, getStudentById, getStudents } from '../controllers/studentController.js';

const router = Router();

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', createStudent);

export default router;
