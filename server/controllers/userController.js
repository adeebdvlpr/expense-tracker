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
    // Allow updating only these fields
    const {
      dateOfBirth, reason, monthlyIncome, currency, dashboardPrefs,
      selectedTheme, customCategories, incomeType, overallMonthlyBudget,
    } = req.body;

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

    // monthlyIncome: allow clearing
    if ('monthlyIncome' in req.body) {
        if (monthlyIncome === null || monthlyIncome === '') $unset.monthlyIncome = '';
        else $set.monthlyIncome = monthlyIncome;
    }

     // currency: do not allow clearing; normalize to USD if empty
    if ('currency' in req.body) {
      if (!currency) $set.currency = 'USD';
      else $set.currency = currency;
    }

    // dashboardPrefs: merge keys
    if ('dashboardPrefs' in req.body) {
      if (!dashboardPrefs) {
      // allow reset to defaults by unsetting
        $unset.dashboardPrefs = '';
      } else {
        for (const key of ['showExpenseChart', 'showBudgetWidget', 'showGoalsWidget', 'chartType']) {
          if (Object.prototype.hasOwnProperty.call(dashboardPrefs, key)) {
             $set[`dashboardPrefs.${key}`] = dashboardPrefs[key];
          }
        }
      }
    }

    // selectedTheme: set if present
    if ('selectedTheme' in req.body) {
      $set.selectedTheme = selectedTheme || 'misty-highlands';
    }

    // customCategories: replace array if present
    if ('customCategories' in req.body) {
      $set.customCategories = Array.isArray(customCategories) ? customCategories : [];
    }

    // incomeType: set if present
    if ('incomeType' in req.body) {
      $set.incomeType = incomeType || 'monthly';
    }

    // overallMonthlyBudget: allow clearing
    if ('overallMonthlyBudget' in req.body) {
      if (overallMonthlyBudget === null || overallMonthlyBudget === '') $unset.overallMonthlyBudget = '';
      else $set.overallMonthlyBudget = overallMonthlyBudget;
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
