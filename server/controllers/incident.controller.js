const Incident = require('../models/Incident.model');

// @GET /api/incidents — All incidents (admin/staff)
exports.getAllIncidents = async (req, res) => {
  const incidents = await Incident.find()
    .populate('reportedBy', 'name email role')
    .populate('event', 'title date')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: incidents.length, incidents });
};

// @GET /api/incidents/my — My reported incidents
exports.getMyIncidents = async (req, res) => {
  const incidents = await Incident.find({ reportedBy: req.user.id })
    .populate('event', 'title date')
    .sort({ createdAt: -1 });

  res.json({ success: true, incidents });
};

// @POST /api/incidents — Report incident
exports.reportIncident = async (req, res) => {
  const incident = await Incident.create({
    ...req.body,
    reportedBy: req.user.id,
  });

  const populated = await incident.populate([
    { path: 'reportedBy', select: 'name email' },
    { path: 'event', select: 'title' },
  ]);

  res.status(201).json({ success: true, message: 'Incident reported!', incident: populated });
};

// @PUT /api/incidents/:id/status — Update status (admin)
exports.updateIncidentStatus = async (req, res) => {
  const incident = await Incident.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  ).populate('reportedBy event', 'name title');

  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }

  res.json({ success: true, message: 'Status updated!', incident });
};

// @DELETE /api/incidents/:id
exports.deleteIncident = async (req, res) => {
  await Incident.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Incident deleted!' });
};