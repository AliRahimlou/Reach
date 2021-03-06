const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  current_city: {
    type: String,
    required: true
  },
  from_city: {
    type: String
  },
  // birthday: {
  //   type: Date
  //   required: true
  // },
  interests: {
    type: [String]
  },
  about_me: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
