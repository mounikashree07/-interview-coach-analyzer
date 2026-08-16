const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  jobDescription: { type: String, required: true },
  matchScore: { type: Number },
  matchedSkills: [String],
  missingSkills: [String],
  suggestions: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
