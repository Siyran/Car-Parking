import { Router } from 'express';
import { getUsers, getSpots, approveSpot, getTransactions, getAnalytics, toggleUserStatus } from '../controllers/admin.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

router.use(verifyToken, requireRole('admin'));

router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/spots', getSpots);
router.put('/spots/:id/approve', approveSpot);
router.get('/transactions', getTransactions);
router.get('/analytics', getAnalytics);

export default router;
