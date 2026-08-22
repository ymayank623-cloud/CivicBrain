require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing users for a fresh seed (Optional: Uncomment if needed)
    // await User.deleteMany();

    const commissionerEmail = 'commissioner@nagar.gov.in';
    const existing = await User.findOne({ email: commissionerEmail });

    if (existing) {
      console.log('Commissioner account already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const commissioner = new User({
      name: 'City Commissioner',
      email: commissionerEmail,
      phone: '9999999999',
      password: hashedPassword,
      role: 'COMMISSIONER'
    });

    await commissioner.save();
    console.log('✅ Master Commissioner Account Created Successfully!');
    console.log(`Email: ${commissionerEmail}`);
    console.log(`Password: admin123`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
