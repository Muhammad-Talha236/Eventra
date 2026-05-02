const Announcement = require('../models/Announcement.model');

// @GET /api/announcements — All announcements
exports.getAllAnnouncements = async (req, res) => {
  const announcements = await Announcement.find()
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, announcements });
};

// @POST /api/announcements — Create announcement (admin)
exports.createAnnouncement = async (req, res) => {
  const announcement = await Announcement.create({
    ...req.body,
    createdBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: 'Announcement created!',
    announcement,
  });
};

// @DELETE /api/announcements/:id
exports.deleteAnnouncement = async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Announcement deleted!' });
};