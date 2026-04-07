import { Router } from 'express';
import { getBalance, getKeyId, verifyManual, createOrder, verifyPayment, createParkingOrder, getHistory } from '../controllers/wallet.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

router.get('/', verifyToken, requireRole('user'), getBalance);
router.get('/key', verifyToken, getKeyId);
router.post('/verify-manual', verifyToken, requireRole('user'), verifyManual);
router.post('/create-order', verifyToken, requireRole('user'), createOrder);
router.post('/verify-payment', verifyToken, requireRole('user'), verifyPayment);
router.post('/create-parking-order', verifyToken, requireRole('user'), createParkingOrder);
router.get('/history', verifyToken, requireRole('user'), getHistory);

export default router;
