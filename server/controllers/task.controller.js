const Task = require('../models/Task.model');
const Notification = require('../models/Notification.model');

// @GET /api/tasks — All tasks (admin/staff)
exports.getAllTasks = async (req, res) => {
  const tasks = await Task.find()
    .populate('assignedTo', 'name email role')
    .populate('assignedBy', 'name email')
    .populate('event', 'title date')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: tasks.length, tasks });
};

// @GET /api/tasks/my — My tasks (volunteer/co_head)
exports.getMyTasks = async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user.id })
    .populate('assignedBy', 'name email')
    .populate('event', 'title date venue')
    .sort({ deadline: 1 });

  res.json({ success: true, tasks });
};

// @POST /api/tasks — Create task
exports.createTask = async (req, res) => {
  const task = await Task.create({
    ...req.body,
    assignedBy: req.user.id,
  });

  // Notification bhejo
  await Notification.create({
    title: 'New Task Assigned',
    message: `You have been assigned: ${task.title}`,
    receiver: task.assignedTo,
    type: 'task',
  });

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'assignedBy', select: 'name email' },
  ]);

  res.status(201).json({ success: true, message: 'Task created!', task: populated });
};

// @PUT /api/tasks/:id/status — Update task status
exports.updateTaskStatus = async (req, res) => {
  const { status } = req.body;

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('assignedTo assignedBy', 'name email');

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  res.json({ success: true, message: 'Status updated!', task });
};

// @DELETE /api/tasks/:id — Delete task
exports.deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Task deleted!' });
};