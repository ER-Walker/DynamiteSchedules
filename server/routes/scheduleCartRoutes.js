import { Router } from 'express';
import {
  addCourseToScheduleCart,
  createScheduleCart,
  getScheduleCartById,
  getScheduleCarts
} from '../controllers/scheduleCartController.js';

const router = Router();

router.get('/', getScheduleCarts);
router.get('/:id', getScheduleCartById);
router.post('/', createScheduleCart);
router.patch('/:id/add-course', addCourseToScheduleCart);

export default router;
