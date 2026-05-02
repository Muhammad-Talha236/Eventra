const Registration = require('../models/Registration.model');
const Event = require('../models/Event.model');
const crypto = require('crypto');

// Unique ticket ID generate
const generateTicketId = () => {
  return 'TKT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// @POST /api/registrations — Register for event
exports.registerForEvent = async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  // Event exist karta hai?
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  // Capacity check
  if (event.registeredCount >= event.capacity) {
    return res.status(400).json({ success: false, message: 'Event is full!' });
  }

  // Already registered?
  const existing = await Registration.findOne({ user: userId, event: eventId });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Already registered!' });
  }

  // Registration banao
  const registration = await Registration.create({
    user: userId,
    event: eventId,
    ticketId: generateTicketId(),
    paymentStatus: event.isFree ? 'free' : 'pending',
  });

  // Event ka count update karo
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