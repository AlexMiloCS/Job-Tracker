import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import JobController from '../controllers/JobController.js';

const router = express.Router();
const jobController = new JobController();

router.post('/', requireAuth, jobController.createJob);
router.get('/', requireAuth, jobController.getJobs);
router.put('/:id', requireAuth, jobController.updateJob);
router.delete('/:id', requireAuth, jobController.deleteJob);

export default router;
