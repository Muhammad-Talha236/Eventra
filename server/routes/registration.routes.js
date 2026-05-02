const express = require('express');
const router = express.Router();

const {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  updatePaymentStatus,
  cancelRegistration,
  markAttendance,
  scanTicket,
} = require('../controllers/registration.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, registerForEvent);
router.get('/my', protect, getMyRegistrations);
router.get('/scan/:ticketId', protect, authorize('admin', 'staff', 'volunteer'), scanTicket);
router.get('/event/:eventId', protect, authorize('admin', 'staff'), getEventRegistrations);
router.put('/:id/payment', protect, authorize('admin', 'staff'), updatePaymentStatus);
router.put('/:id/attend', protect, authorize('admin', 'staff', 'volunteer'), markAttendance);
router.delete('/:id', protect, cancelRegistration);

module.exports = router;
