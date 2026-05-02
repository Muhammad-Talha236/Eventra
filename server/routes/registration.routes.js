const express = require('express');
const router = express.Router();

const { uploadPayment } = require('../config/cloudinary');
const {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  updatePaymentStatus,
  cancelRegistration,
  markAttendance,
  scanTicket,
  uploadPaymentScreenshot,
  getPendingPayments,
} = require('../controllers/registration.controller')

const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, registerForEvent);
router.get('/my', protect, getMyRegistrations);
router.get('/scan/:ticketId', protect, authorize('admin', 'staff', 'volunteer'), scanTicket);
router.get('/event/:eventId', protect, authorize('admin', 'staff'), getEventRegistrations);
router.put('/:id/payment', protect, authorize('admin', 'staff'), updatePaymentStatus);
router.put('/:id/attend', protect, authorize('admin', 'staff', 'volunteer'), markAttendance);
router.delete('/:id', protect, cancelRegistration);
router.get('/pending-payments', protect, authorize('admin', 'staff'), getPendingPayments);
router.post('/:id/payment-screenshot', protect, uploadPayment.single('screenshot'), uploadPaymentScreenshot);

module.exports = router;
