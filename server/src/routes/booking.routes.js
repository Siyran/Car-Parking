import { Router } from 'express';
import { startSession, endSession, getMyBookings, getActiveSession, cancelBooking } from '../controllers/booking.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

router.post('/', verifyToken, requireRole('driver'), startSession);
router.put('/:id/end', verifyToken, requireRole('driver'), endSession);
router.put('/:id/cancel', verifyToken, requireRole('driver'), cancelBooking);
router.get('/my', verifyToken, getMyBookings);
router.get('/active', verifyToken, requireRole('driver'), getActiveSession);

export default router;
