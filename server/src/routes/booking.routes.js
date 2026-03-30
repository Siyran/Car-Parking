import { Router } from 'express';
import { startSession, endSession, getMyBookings, getActiveSession, cancelBooking } from '../controllers/booking.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

router.post('/', verifyToken, requireRole('user'), startSession);
router.put('/:id/end', verifyToken, requireRole('user'), endSession);
router.put('/:id/cancel', verifyToken, requireRole('user'), cancelBooking);
router.get('/my', verifyToken, getMyBookings);
router.get('/active', verifyToken, requireRole('user'), getActiveSession);

export default router;
