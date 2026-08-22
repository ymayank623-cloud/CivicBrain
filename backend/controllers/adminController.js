const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Admin only: Create staff accounts
exports.createStaff = async (req, res) => {
  try {
    // Check if the requester is an Admin/Commissioner (Should be handled by middleware, but double check)
    if (req.user.role !== 'COMMISSIONER') {
      return res.status(403).json({ message: 'Access denied: Commissioner privileges required' });
    }

    const { name, email, phone, password, role, ward } = req.body;

    // Validate allowed roles to create
    if (!['FIELD_OFFICER', 'DEPT_HEAD'].includes(role)) {
       return res.status(400).json({ message: 'Invalid staff role assignment' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStaff = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      ward
    });

    await newStaff.save();
    res.status(201).json({ message: `${role} account created successfully`, data: { id: newStaff._id, email: newStaff.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
