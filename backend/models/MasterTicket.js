const mongoose = require('mongoose');

const masterTicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  impactedCount: { type: Number, default: 1 },
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 
    default: 'MEDIUM' 
  },
  slaDeadline: { type: Date, required: true },
  assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { 
    type: String, 
    enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], 
    default: 'OPEN' 
  },
  createdAt: { type: Date, default: Date.now }
});

masterTicketSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('MasterTicket', masterTicketSchema);
