const mongoose = require('mongoose');

const endorsementSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  description: String,
  institutionalSupport: {
    fundingSupport: {
      required: Boolean,
      details: String
    },
    timeAllocation: {
      required: Boolean,
      details: String
    },
    resourceAccess: {
      required: Boolean,
      details: String
    }
  },
  verificationDate: Date,
  expiryDate: Date,
  attachments: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Endorsement', endorsementSchema);