import { Router } from 'express';
import { 
  startSession, endSession, endActiveSession, getMyBookings, 
  getActiveSession, cancelBooking, getOwnerBookings,
  updateGPS, getBookingETA, getActiveDriversForOwner
} from '../controllers/booking.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

router.post('/', verifyToken, requireRole('user'), startSession);
router.put('/active/end', verifyToken, requireRole('user'), endActiveSession);
router.put('/active/gps', verifyToken, requireRole('user'), updateGPS);
router.put('/:id/end', verifyToken, requireRole('user'), endSession);
router.put('/:id/cancel', verifyToken, requireRole('user'), cancelBooking);
router.get('/my', verifyToken, getMyBookings);
router.get('/owner', verifyToken, requireRole('owner'), getOwnerBookings);
router.get('/owner/drivers', verifyToken, requireRole('owner'), getActiveDriversForOwner);
router.get('/active', verifyToken, requireRole('user'), getActiveSession);
router.get('/:id/eta', verifyToken, getBookingETA);

export default router;
