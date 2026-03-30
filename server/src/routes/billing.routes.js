import { Router } from 'express';
import { getMonthlyBill, simulatePayment, getOwnerDashboard, requestWithdrawal, getOwnerEarnings, getSpotBookings } from '../controllers/billing.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

// Driver billing
router.get('/monthly', verifyToken, requireRole('driver'), getMonthlyBill);
router.post('/pay', verifyToken, requireRole('driver'), simulatePayment);

// Owner dashboard & earnings
router.get('/owner/dashboard', verifyToken, requireRole('owner'), getOwnerDashboard);
router.get('/owner/earnings', verifyToken, requireRole('owner'), getOwnerEarnings);
router.get('/owner/spots/:spotId/bookings', verifyToken, requireRole('owner'), getSpotBookings);
router.post('/owner/withdraw', verifyToken, requireRole('owner'), requestWithdrawal);

export default router;
