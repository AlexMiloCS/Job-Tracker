import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import ClusterController from '../controllers/ClusterController.js';

const router = express.Router();
const clusterController = new ClusterController();

// POST /api/cluster/recluster
// Re-clusters all jobs for the authenticated user
router.post('/recluster', requireAuth, clusterController.recluster);

// POST /api/cluster/rename
// Rename a cluster label for all jobs in that cluster
router.post('/rename', requireAuth, clusterController.rename);

// POST /api/cluster/auto-name
// Use LLM to generate labels for all current clusters
router.post('/auto-name', requireAuth, clusterController.autoName);

export default router;
