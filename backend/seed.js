require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const MasterTicket = require('./models/MasterTicket');
const bcrypt = require('bcryptjs');

// Database URI (Use local if not provided)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civicbrain';

const LUCKNOW_CENTER = [80.9462, 26.8467]; // [Lng, Lat]
const NOIDA_CENTER = [77.3910, 28.5355];

const categories = ['Pothole', 'Streetlight', 'Garbage', 'Water Leak', 'Open Manhole'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

function randomCoord(center, offset = 0.05) {
  return [
    center[0] + (Math.random() - 0.5) * offset,
    center[1] + (Math.random() - 0.5) * offset
  ];
}

async function seedDatabase() {
  try {
    console.log('[SEED] Connecting to Database...');
    await mongoose.connect(MONGO_URI);
    console.log('[SEED] Connected!');

    console.log('[SEED] Clearing old data...');
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await MasterTicket.deleteMany({});

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const users = [
      { name: 'Ramesh (Citizen)', email: 'citizen@demo.com', password: passwordHash, role: 'CITIZEN', karmaPoints: 120 },
      { name: 'Suresh (Citizen)', email: 'citizen2@demo.com', password: passwordHash, role: 'CITIZEN', karmaPoints: 45 },
      { name: 'Er. Rakesh (Field Officer)', email: 'officer@demo.com', password: passwordHash, role: 'FIELD_OFFICER' },
      { name: 'Mr. Sharma (Dept Head)', email: 'head@demo.com', password: passwordHash, role: 'DEPT_HEAD' },
      { name: 'Dr. A.K (Commissioner)', email: 'commissioner@demo.com', password: passwordHash, role: 'COMMISSIONER' }
    ];

    const insertedUsers = await User.insertMany(users);
    const citizenId = insertedUsers[0]._id;
    console.log('[SEED] Users seeded successfully!');

    // 2. Seed MasterTickets & Complaints (40-50 entries)
    console.log('[SEED] Generating realistic civic complaints...');
    
    let complaintsToInsert = [];
    let masterTicketsToInsert = [];

    for (let i = 1; i <= 45; i++) {
      const isLucknow = Math.random() > 0.3; // 70% in Lucknow
      const center = isLucknow ? LUCKNOW_CENTER : NOIDA_CENTER;
      const coord = randomCoord(center, 0.08);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Simulate created dates (from 1 to 72 hours ago)
      const hoursAgo = Math.floor(Math.random() * 72) + 1;
      const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      
      let priority = 'MEDIUM';
      if (hoursAgo > 48) priority = 'CRITICAL';
      else if (hoursAgo > 24) priority = 'HIGH';

      const masterTicketId = new mongoose.Types.ObjectId();
      
      masterTicketsToInsert.push({
        _id: masterTicketId,
        category,
        location: { type: 'Point', coordinates: coord },
        impactedCount: Math.floor(Math.random() * 5) + 1,
        priority,
        status,
        createdAt
      });

      complaintsToInsert.push({
        userId: citizenId,
        category,
        title: `Issue with ${category} near Sector ${Math.floor(Math.random() * 100)}`,
        description: `This is an auto-generated complaint for demo purposes regarding ${category}.`,
        location: { type: 'Point', coordinates: coord },
        masterTicketId,
        createdAt
      });
    }

    await MasterTicket.insertMany(masterTicketsToInsert);
    await Complaint.insertMany(complaintsToInsert);

    console.log(`[SEED] Added ${masterTicketsToInsert.length} MasterTickets and Complaints!`);
    console.log('[SEED] Database Seeding Complete! Ready for Demo 🚀');
    process.exit(0);
  } catch (error) {
    console.error('[SEED ERROR]', error);
    process.exit(1);
  }
}

seedDatabase();
