const mongoose = require('mongoose');

const resolutionProofSchema = new mongoose.Schema({
  masterTicketId: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterTicket', required: true },
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  beforeImageUrl: { type: String, required: true }, // Ideally fetched from the first complaint in MasterTicket
  afterImageUrl: { type: String, required: true },
  officerGpsLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  similarityScore: { type: Number, default: 0 }, // AI calculated score
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ResolutionProof', resolutionProofSchema);
