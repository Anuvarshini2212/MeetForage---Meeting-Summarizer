const mongoose = require('mongoose');
const fs = require('fs');
const Meeting = require('../models/Meeting');
const { transcribeAudio } = require('../services/transcriptionService');
const { summarizeTranscript } = require('../services/summarizationService');


async function createMeeting(req, res, next) {
  let meeting;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file was uploaded.' });
    }

    meeting = await Meeting.create({
      user: req.userId,
      title: req.file.originalname,
      originalFileName: req.file.originalname,
      audioFilePath: req.file.path,
      status: 'transcribing',
    });

    let transcript;
    try {
      transcript = await transcribeAudio(req.file.path);
    } catch (err) {
      meeting.status = 'failed';
      meeting.errorMessage = err.message;
      await meeting.save();
      return next(err);
    }

    meeting.transcript = transcript;
    meeting.status = 'summarizing';
    await meeting.save();

    let analysis;
    try {
      analysis = await summarizeTranscript(transcript);
    } catch (err) {
      meeting.status = 'failed';
      meeting.errorMessage = err.message;
      await meeting.save();
      return next(err);
    }

    meeting.title =
  analysis.title && analysis.title !== "Meeting Summary"
    ? analysis.title
    : req.file.originalname.replace(/\.[^/.]+$/, "");
    meeting.overview = analysis.overview;
    meeting.summary = analysis.summary;
    meeting.keyPoints = analysis.keyPoints;
    meeting.decisions = analysis.decisions;
    meeting.actionItems = analysis.actionItems;
    meeting.status = 'completed';
    await meeting.save();

    return res.status(201).json({
      success: true,
      message: 'Meeting processed successfully',
      data: meeting,
    });
  } catch (err) {
    if (meeting) {
      meeting.status = 'failed';
      meeting.errorMessage = 'Unexpected server error.';
      await meeting.save().catch(() => {});
    }
    next(err);
  }
}

async function getMeetings(req, res, next) {
  try {
    const meetings = await Meeting.find({ user: req.userId })
      .select('title status createdAt summary actionItems')
      .sort({ createdAt: -1 });

    res.json({ success: true, message: 'Meetings retrieved', data: meetings });
  } catch (err) {
    next(err);
  }
}


async function getMeetingById(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid meeting ID.' });
    }

    const meeting = await Meeting.findOne({ _id: req.params.id, user: req.userId });
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found.' });
    }

    res.json({ success: true, message: 'Meeting retrieved', data: meeting });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/meetings/:id — only if it belongs to the current user */
async function deleteMeeting(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid meeting ID.' });
    }

    const meeting = await Meeting.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found.' });
    }

    if (meeting.audioFilePath) {
      fs.unlink(meeting.audioFilePath, () => {});
    }

    res.json({ success: true, message: 'Meeting deleted', data: {} });
  } catch (err) {
    next(err);
  }
}

module.exports = { createMeeting, getMeetings, getMeetingById, deleteMeeting };
