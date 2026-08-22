const Complaint = require('../models/Complaint');
const MasterTicket = require('../models/MasterTicket');
const User = require('../models/User');

// Create a new complaint with 50m Spatial Deduplication
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, imageUrl, longitude, latitude } = req.body;
    const userId = req.user.userId;

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'GPS Location is required.' });
    }

    // 1. Search for an existing active MasterTicket in a 50m radius with the SAME category
    const nearbyMaster = await MasterTicket.findOne({
      category: category,
      status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: 50 // 50 meters radius
        }
      }
    });

    let masterTicketId;

    if (nearbyMaster) {
      // MATCH FOUND: Link to existing Master Ticket & increment impact
      nearbyMaster.impactedCount += 1;
      
      // Dynamic Priority Escalation based on Impact
      if (nearbyMaster.impactedCount > 10) nearbyMaster.priority = 'CRITICAL';
      else if (nearbyMaster.impactedCount > 5) nearbyMaster.priority = 'HIGH';
      
      await nearbyMaster.save();
      masterTicketId = nearbyMaster._id;
    } else {
      // NO MATCH: Create a new Master Ticket
      // Calculate dynamic SLA based on category
      let slaHours = 48; // Default
      let priority = 'MEDIUM';

      if (category === 'Open Manhole' || category === 'Water Leak') {
        slaHours = 4;
        priority = 'HIGH';
      } else if (category === 'Streetlight') {
        slaHours = 24;
      }

      const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

      const newMaster = new MasterTicket({
        title: `Cluster: ${category} Issue`,
        category,
        location: {
          type: "Point",
          coordinates: [longitude, latitude]
        },
        impactedCount: 1,
        priority,
        slaDeadline,
        status: 'OPEN'
      });

      await newMaster.save();
      masterTicketId = newMaster._id;
    }

    // 2. Save the actual user complaint and link to the Master Ticket
    const newComplaint = new Complaint({
      title,
      description,
      category,
      imageUrl,
      location: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      masterTicketId,
      userId
    });

    await newComplaint.save();

    // Reward Citizen with Civic Karma Points for reporting
    await User.findByIdAndUpdate(userId, { $inc: { karmaPoints: 10 } });

    if (req.io) {
      req.io.emit('new_complaint', {
        masterTicketId,
        isDuplicate: !!nearbyMaster,
        category,
        location: [longitude, latitude]
      });
    }

    res.status(201).json({ 
      message: nearbyMaster ? 'Complaint linked to an existing issue.' : 'New complaint registered successfully.',
      masterTicketId,
      isDuplicate: !!nearbyMaster
    });

  } catch (error) {
    console.error("Complaint creation error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Fetch Citizen's active complaints and Profile
exports.getCitizenDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Fetch user details for Karma Points
    const user = await User.findById(userId).select('-password');
    
    // Fetch all complaints made by this user, populated with Master Ticket status
    const complaints = await Complaint.find({ userId })
      .populate('masterTicketId', 'status priority slaDeadline')
      .sort({ createdAt: -1 });

    res.json({
      user,
      complaints
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
