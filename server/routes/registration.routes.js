const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  updatePaymentStatus,
  cancelRegistration,
} = require('../controllers/registration.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, registerForEvent);
router.get('/my', protect, getMyRegistrations);
router.get('/event/:eventId', protect, authorize('admin', 'staff'), getEventRegistrations);
router.put('/:id/payment', protect, authorize('admin', 'staff'), updatePaymentStatus);
router.delete('/:id', protect, cancelRegistration);

module.exports = router;