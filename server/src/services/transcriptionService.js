const Groq = require("groq-sdk");
const fs = require("fs");

const transcribeAudio = async (audioPath) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      const err = new Error(
        "GROQ_API_KEY is not configured on the server."
      );
      err.statusCode = 500;
      throw err;
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-large-v3-turbo",
      response_format: "json",
    });

    return transcription.text;
  } catch (err) {
    console.error(
      "Transcription error:",
      err.response?.data || err.message
    );

    if (err.statusCode) {
      throw err;
    }

    const wrapped = new Error(
      err.response?.data?.error?.message ||
        err.message ||
        "Transcription failed"
    );

    wrapped.statusCode = err.response?.status || 500;
    throw wrapped;
  }
};

module.exports = { transcribeAudio };