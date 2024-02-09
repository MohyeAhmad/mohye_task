const mongoose = require('mongoose');

const joggingEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  distance: { type: Number, required: true },
  time: { type: Number, required: true },
  location: { type: String, required: true },
});

const JoggingEntry = mongoose.model('JoggingEntry', joggingEntrySchema);

module.exports = JoggingEntry;