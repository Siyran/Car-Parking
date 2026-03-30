import ParkingSpot from '../models/ParkingSpot.js';
import Review from '../models/Review.js';

export const createSpot = async (req, res, next) => {
  try {
    const { title, description, address, latitude, longitude, pricePerHour, totalSlots, availability, amenities, vehicleTypes } = req.body;

    const photos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const spot = await ParkingSpot.create({
      owner: req.user._id,
      title, description, address,
      location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
      photos,
      pricePerHour: parseFloat(pricePerHour),
      totalSlots: parseInt(totalSlots),
      availableSlots: parseInt(totalSlots),
      availability: availability ? JSON.parse(availability) : undefined,
      amenities: amenities ? JSON.parse(amenities) : [],
      vehicleTypes: vehicleTypes ? JSON.parse(vehicleTypes) : ['car']
    });

    res.status(201).json({ spot });
  } catch (error) {
    next(error);
  }
};

export const getNearbySpots = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000, minPrice, maxPrice, vehicleType } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    const query = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      },
      status: 'approved',
      isActive: true
    };

    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerHour.$lte = parseFloat(maxPrice);
    }

    if (vehicleType) {
      query.vehicleTypes = vehicleType;
    }

    const spots = await ParkingSpot.find(query)
      .populate('owner', 'name phone')
      .limit(50);

    res.json({ spots });
  } catch (error) {
    next(error);
  }
};

export const getSpotById = async (req, res, next) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id).populate('owner', 'name phone email');
    if (!spot) return res.status(404).json({ error: 'Spot not found' });

    const reviews = await Review.find({ spot: spot._id })
      .populate('driver', 'name avatar')
      .sort('-createdAt')
      .limit(20);

    res.json({ spot, reviews });
  } catch (error) {
    next(error);
  }
};

export const getMySpots = async (req, res, next) => {
  try {
    const spots = await ParkingSpot.find({ owner: req.user._id }).sort('-createdAt');
    res.json({ spots });
  } catch (error) {
    next(error);
  }
};

export const updateSpot = async (req, res, next) => {
  try {
    const spot = await ParkingSpot.findOne({ _id: req.params.id, owner: req.user._id });
    if (!spot) return res.status(404).json({ error: 'Spot not found or not authorized' });

    const { title, description, address, pricePerHour, totalSlots, availability, amenities, vehicleTypes, isActive } = req.body;
    if (title) spot.title = title;
    if (description) spot.description = description;
    if (address) spot.address = address;
    if (pricePerHour) spot.pricePerHour = parseFloat(pricePerHour);
    if (totalSlots) {
      const diff = parseInt(totalSlots) - spot.totalSlots;
      spot.totalSlots = parseInt(totalSlots);
      spot.availableSlots = Math.max(0, spot.availableSlots + diff);
    }
    if (availability) spot.availability = JSON.parse(availability);
    if (amenities) spot.amenities = JSON.parse(amenities);
    if (vehicleTypes) spot.vehicleTypes = JSON.parse(vehicleTypes);
    if (typeof isActive === 'boolean') spot.isActive = isActive;

    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(f => `/uploads/${f.filename}`);
      spot.photos.push(...newPhotos);
    }

    await spot.save();
    res.json({ spot });
  } catch (error) {
    next(error);
  }
};

export const deleteSpot = async (req, res, next) => {
  try {
    const spot = await ParkingSpot.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!spot) return res.status(404).json({ error: 'Spot not found or not authorized' });
    res.json({ message: 'Spot deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const spotId = req.params.id;

    const review = await Review.create({
      driver: req.user._id,
      spot: spotId,
      rating: parseInt(rating),
      comment
    });

    // Update average rating
    const stats = await Review.aggregate([
      { $match: { spot: review.spot } },
      { $group: { _id: '$spot', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      await ParkingSpot.findByIdAndUpdate(spotId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].count
      });
    }

    await review.populate('driver', 'name avatar');
    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
};
