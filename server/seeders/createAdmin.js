const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });  // ../.env ki jagah ./.env

const User = require('../models/User.model');

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'admin@eventra.com' });
  if (existing) {
    console.log('✅ Admin already exists!');
    process.exit();
  }

  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@eventra.com',
    password: 'Admin@1234',
    role: 'admin',
    isVerified: true,
  });

  console.log('✅ Admin created:', admin.email);
  process.exit();
};

createAdmin();