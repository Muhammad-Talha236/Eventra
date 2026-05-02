const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/event.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', protect, authorize('admin', 'staff'), createEvent);
router.put('/:id', protect, authorize('admin', 'staff'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

module.exports = router;