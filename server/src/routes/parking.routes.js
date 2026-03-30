import { Router } from 'express';
import { createSpot, getNearbySpots, getSpotById, getMySpots, updateSpot, deleteSpot, addReview } from '../controllers/parking.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/nearby', getNearbySpots);
router.get('/my', verifyToken, requireRole('owner'), getMySpots);
router.get('/:id', getSpotById);
router.post('/', verifyToken, requireRole('owner'), upload.array('photos', 5), createSpot);
router.put('/:id', verifyToken, requireRole('owner'), upload.array('photos', 5), updateSpot);
router.delete('/:id', verifyToken, requireRole('owner'), deleteSpot);
router.post('/:id/reviews', verifyToken, requireRole('driver'), addReview);

export default router;
