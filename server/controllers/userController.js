const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    // Allow updating only these fields (for now)
    const { dateOfBirth, reason } = req.body;

    const $set = {};
    const $unset = {};

    // Support: set value OR clear it (send null or "")
    if ('dateOfBirth' in req.body) {
      if (!dateOfBirth) $unset.dateOfBirth = '';
      else $set.dateOfBirth = dateOfBirth;
    }

    if ('reason' in req.body) {
      if (!reason) $unset.reason = '';
      else $set.reason = reason;
    }

    const update = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      update,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
