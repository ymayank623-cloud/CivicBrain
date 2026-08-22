const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  aadhaar: { type: String, required: true },
  state: { type: String },
  city: { type: String },
  nagarNigam: { type: String },
  ward: { type: String, default: null }, // Applicable for citizens/officers mapped to wards
  address: { type: String },
  pincode: { type: String },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['CITIZEN', 'FIELD_OFFICER', 'DEPT_HEAD', 'COMMISSIONER'], 
    default: 'CITIZEN' 
  },
  karmaPoints: { type: Number, default: 0 },
  trustScore: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
