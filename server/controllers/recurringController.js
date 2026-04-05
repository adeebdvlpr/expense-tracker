const RecurringPayment = require('../models/RecurringPayment');
const Expense = require('../models/Expense');

/**
 * Advance a date by exactly one interval step using UTC components,
 * so the result is always timezone-independent.
 */
function advanceByInterval(date, interval) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  switch (interval) {
    case 'daily':   return new Date(Date.UTC(y, m, d + 1));
    case 'weekly':  return new Date(Date.UTC(y, m, d + 7));
    case 'monthly': return new Date(Date.UTC(y, m + 1, d));
    case 'annual':  return new Date(Date.UTC(y + 1, m, d));
    default:        return new Date(date);
  }
}

/**
 * Walk forward from startDate one interval step at a time using UTC.
 *
 * Returns:
 *   missedDates — every occurrence whose UTC date falls strictly before today (UTC midnight).
 *                 These are back-filled as Expense records on creation.
 *   nextDueDate — the first occurrence that is today (UTC) or in the future.
 *
 * Examples (interval = monthly, today UTC = 2026-04-03):
 *   startDate = 2026-04-01  →  missedDates: [Apr 1],   nextDueDate: May 1
 *   startDate = 2025-10-01  →  missedDates: [Oct…Apr],  nextDueDate: May 1
 *   startDate = 2026-04-03  →  missedDates: [],          nextDueDate: Apr 3
 *   startDate = 2026-05-01  →  missedDates: [],          nextDueDate: May 1
 */
function collectOccurrences(startDate, interval) {
  const now = new Date();
  // Midnight of today in UTC — occurrences strictly before this are "missed"
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const missedDates = [];
  let current = new Date(startDate); // "YYYY-MM-DD" from frontend parses as UTC midnight

  while (Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate()) < todayUTC) {
    // Store at UTC noon so the date displays correctly in all timezones (UTC midnight
    // would render as the prior calendar day in any negative UTC offset).
    missedDates.push(new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate(), 12)));
    current = advanceByInterval(current, interval);
  }

  return { missedDates, nextDueDate: current };
}

// GET /api/recurring
exports.listRecurring = async (req, res, next) => {
  try {
    const payments = await RecurringPayment.find({ user: req.user.id })
      .sort({ nextDueDate: 1 })
      .lean()
      .exec();
    res.status(200).json(payments);
  } catch (err) {
    next(err);
  }
};

// POST /api/recurring
exports.createRecurring = async (req, res, next) => {
  try {
    const { description, amount, category, interval, startDate, endDate } = req.body;

    const { missedDates, nextDueDate } = collectOccurrences(startDate, interval);

    const payment = new RecurringPayment({
      user: req.user.id,
      description: description.trim(),
      amount: parseFloat(amount),
      category: category.trim(),
      interval,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      nextDueDate,
      lastLoggedDate: missedDates.length > 0 ? missedDates[missedDates.length - 1] : null,
    });

    const saved = await payment.save();

    // Back-fill one Expense per missed occurrence, each dated at its scheduled UTC date
    if (missedDates.length > 0) {
      const expenses = missedDates.map((date) => ({
        user: saved.user,
        description: saved.description,
        amount: saved.amount,
        category: saved.category,
        date,
        isRecurring: true,
        recurringPaymentId: saved._id,
      }));
      await Expense.insertMany(expenses);
    }

    res.status(201).json({ ...saved.toObject(), backfilledCount: missedDates.length });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/recurring/:id
exports.updateRecurring = async (req, res, next) => {
  try {
    const payment = await RecurringPayment.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({ message: 'Recurring payment not found' });
    }

    const { description, amount, category, interval, startDate, endDate, isActive } = req.body;

    if (description !== undefined) payment.description = description.trim();
    if (amount !== undefined) payment.amount = parseFloat(amount);
    if (category !== undefined) payment.category = category.trim();
    if (isActive !== undefined) payment.isActive = isActive;
    if (endDate !== undefined) payment.endDate = endDate ? new Date(endDate) : null;

    // Recalculate nextDueDate if interval or startDate changed (no back-fill on edit)
    const intervalChanged = interval !== undefined && interval !== payment.interval;
    const startDateChanged = startDate !== undefined;

    if (intervalChanged) payment.interval = interval;
    if (startDateChanged) payment.startDate = new Date(startDate);

    if (intervalChanged || startDateChanged) {
      const { nextDueDate } = collectOccurrences(payment.startDate, payment.interval);
      payment.nextDueDate = nextDueDate;
    }

    const updated = await payment.save();
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/recurring/:id
exports.deleteRecurring = async (req, res, next) => {
  try {
    const result = await RecurringPayment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!result) {
      return res.status(404).json({ message: 'Recurring payment not found' });
    }

    // Detach all expenses that were generated by this recurring payment.
    // They remain in the expense list as standalone records — isRecurring is
    // cleared so they no longer reference a deleted pattern.
    await Expense.updateMany(
      { recurringPaymentId: result._id },
      { $set: { isRecurring: false }, $unset: { recurringPaymentId: '' } }
    );

    res.status(200).json({ message: 'Recurring payment deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/recurring/:id/trigger
exports.triggerRecurring = async (req, res, next) => {
  try {
    const payment = await RecurringPayment.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({ message: 'Recurring payment not found' });
    }

    // Date the expense at the actual moment the user clicked "Log Now" —
    // this is when the money left the account.
    const expense = new Expense({
      user: payment.user,
      description: payment.description,
      amount: payment.amount,
      category: payment.category,
      date: new Date(),
      isRecurring: true,
      recurringPaymentId: payment._id,
    });

    await expense.save();

    payment.nextDueDate = advanceByInterval(payment.nextDueDate, payment.interval);
    payment.lastLoggedDate = new Date();
    await payment.save();

    res.status(201).json({
      expense,
      nextDueDate: payment.nextDueDate,
    });
  } catch (err) {
    next(err);
  }
};
