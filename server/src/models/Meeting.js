const mongoose = require('mongoose');

const ActionItemSchema = new mongoose.Schema(
  {
    task: { type: String, required: true },
    assignee: { type: String, default: 'Not specified' },
    deadline: { type: String, default: 'Not specified' },
    priority: { type: String, default: 'Not specified' },
  },
  { _id: false }
);

const MeetingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Untitled Meeting' },
    originalFileName: { type: String, required: true },
    audioFilePath: { type: String, required: true },

    transcript: { type: String, default: '' },
    overview: { type: String, default: '' },
    summary: { type: String, default: '' },
    keyPoints: { type: [String], default: [] },
    decisions: { type: [String], default: [] },
    actionItems: { type: [ActionItemSchema], default: [] },

    status: {
      type: String,
      enum: ['uploaded', 'transcribing', 'summarizing', 'completed', 'failed'],
      default: 'uploaded',
    },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', MeetingSchema);
