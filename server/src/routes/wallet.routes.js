import { Router } from 'express';
import { getBalance, topUp, getHistory } from '../controllers/wallet.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

router.get('/', verifyToken, requireRole('user'), getBalance);
router.post('/topup', verifyToken, requireRole('user'), topUp);
router.get('/history', verifyToken, requireRole('user'), getHistory);

export default router;
