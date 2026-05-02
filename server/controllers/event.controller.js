const Event = require('../models/Event.model');

// @GET /api/events — All events (public)
exports.getAllEvents = async (req, res) => {
  const { category, status, search } = req.query;

  let filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const events = await Event.find(filter)
    .populate('createdBy', 'name email')
    .sort({ date: 1 });

  res.json({ success: true, count: events.length, events });
};

// @GET /api/events/:id — Single event
exports.getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('createdBy', 'name email');

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  res.json({ success: true, event });
};

// @POST /api/events — Create event (admin/staff)
exports.createEvent = async (req, res) => {
  const event = await Event.create({
    ...req.body,
    createdBy: req.user.id,
    isFree: req.body.fee === 0 || !req.body.fee,
  });

  res.status(201).json({ success: true, message: 'Event created!', event });
};

// @PUT /api/events/:id — Update event
exports.updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { ...req.body, isFree: req.body.fee === 0 || !req.body.fee },
    { new: true, runValidators: true }
  );

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  res.json({ success: true, message: 'Event updated!', event });
};

// @DELETE /api/events/:id — Delete event
exports.deleteEvent = async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  res.json({ success: true, message: 'Event deleted!' });
};