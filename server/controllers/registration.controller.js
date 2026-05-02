const Registration = require('../models/Registration.model');
const Event = require('../models/Event.model');
const crypto = require('crypto');
const QRCode = require('qrcode');
// Unique ticket ID generate
const generateTicketId = () => {
  return 'TKT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// @POST /api/registrations — Register for event
exports.registerForEvent = async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (event.registeredCount >= event.capacity) {
    return res.status(400).json({ success: false, message: 'Event is full!' });
  }

  const existing = await Registration.findOne({ user: userId, event: eventId });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Already registered!' });
  }

  const ticketId = generateTicketId();

  // QR Code generate karo
  const qrData = JSON.stringify({
    ticketId,
    eventId,
    userId,
    eventTitle: event.title,
  });
  const qrCode = await QRCode.toDataURL(qrData);

  const registration = await Registration.create({
    user: userId,
    event: eventId,
    ticketId,
    qrCode,
    paymentStatus: event.isFree ? 'free' : 'pending',
  });

  await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

  res.status(201).json({
    success: true,
    message: 'Registered successfully!',
    registration,
  });
};
// @GET /api/registrations/my — My registrations
exports.getMyRegistrations = async (req, res) => {
  const registrations = await Registration.find({ user: req.user.id })
    .populate('event', 'title date venue startTime endTime category fee isFree status')
    .sort({ createdAt: -1 });

  res.json({ success: true, registrations });
};

// @GET /api/registrations/event/:eventId — Event ki registrations (admin)
exports.getEventRegistrations = async (req, res) => {
  const registrations = await Registration.find({ event: req.params.eventId })
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: registrations.length, registrations });
};

// @PUT /api/registrations/:id/payment — Payment verify (admin/staff)
exports.updatePaymentStatus = async (req, res) => {
  const { paymentStatus } = req.body;

  const registration = await Registration.findByIdAndUpdate(
    req.params.id,
    { paymentStatus },
    { new: true }
  ).populate('user event');

  if (!registration) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  res.json({ success: true, message: 'Payment status updated!', registration });
};

// @DELETE /api/registrations/:id — Cancel registration
exports.cancelRegistration = async (req, res) => {
  const registration = await Registration.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!registration) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  await Event.findByIdAndUpdate(registration.event, { $inc: { registeredCount: -1 } });
  await registration.deleteOne();

  res.json({ success: true, message: 'Registration cancelled!' });
};

// @PUT /api/registrations/:id/attend — Mark attendance
exports.markAttendance = async (req, res) => {
  const registration = await Registration.findByIdAndUpdate(
    req.params.id,
    { attended: true },
    { new: true }
  ).populate('user', 'name email')
   .populate('event', 'title date');

  if (!registration) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  res.json({ success: true, message: 'Attendance marked!', registration });
};

// @GET /api/registrations/scan/:ticketId — Scan QR & get registration
exports.scanTicket = async (req, res) => {
  const registration = await Registration.findOne({ ticketId: req.params.ticketId })
    .populate('user', 'name email role studentInfo')
    .populate('event', 'title date venue startTime');

  if (!registration) {
    return res.status(404).json({ success: false, message: 'Invalid ticket!' });
  }

  res.json({ success: true, registration });
};