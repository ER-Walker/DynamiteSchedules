import { Router } from 'express';
import {
  createDegreeRequirement,
  getDegreeRequirementById,
  getDegreeRequirements
} from '../controllers/degreeRequirementController.js';

const router = Router();

router.get('/', getDegreeRequirements);
router.get('/:id', getDegreeRequirementById);
router.post('/', createDegreeRequirement);

export default router;
