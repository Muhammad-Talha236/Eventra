const User = require('../models/User.model');

// @GET /api/users — All users (admin)
exports.getAllUsers = async (req, res) => {
  const { role, search } = req.query;

  let filter = {};
  if (role) filter.role = role;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: users.length, users });
};

// @GET /api/users/:id — Single user
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user });
};

// @POST /api/users/add-staff — Admin adds staff/volunteer/head
exports.addStaffMember = async (req, res) => {
  const { name, email, password, role } = req.body;

  const allowedRoles = ['staff', 'main_head', 'co_head', 'volunteer'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    isVerified: true,
  });

  res.status(201).json({
    success: true,
    message: `${role} added successfully!`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// @PUT /api/users/:id/role — Update user role
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({ success: true, message: 'Role updated!', user });
};

// @PUT /api/users/:id/toggle — Activate/Deactivate user
exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'}!`,
    user,
  });
};

// @DELETE /api/users/:id — Delete user
exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, message: 'User deleted!' });
};