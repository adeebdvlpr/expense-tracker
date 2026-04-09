const cron = require('node-cron');
const RecurringPayment = require('../models/RecurringPayment');
const Expense = require('../models/Expense');
const Asset = require('../models/Asset');
const { createNotification } = require('./notificationService');

/**
 * Advance a date by one interval step.
 */
function advanceByInterval(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'annual':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      break;
  }
  return next;
}

/**
 * Returns true if two dates fall on the same calendar day (UTC).
 */
function isSameCalendarDay(a, b) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

async function runScheduler() {
  const now = new Date();
  const timestamp = now.toISOString();

  let processed = 0;
  let skipped = 0;

  try {
    const due = await RecurringPayment.find({
      isActive: true,
      nextDueDate: { $lte: now },
    }).exec();

    for (const payment of due) {
      // Duplicate guard: skip if already logged today
      if (payment.lastLoggedDate && isSameCalendarDay(payment.lastLoggedDate, now)) {
        skipped++;
        continue;
      }

      const expense = new Expense({
        user: payment.user,
        description: payment.description,
        amount: payment.amount,
        category: payment.category,
        isRecurring: true,
        recurringPaymentId: payment._id,
      });

      await expense.save();

      payment.nextDueDate = advanceByInterval(payment.nextDueDate, payment.interval);
      payment.lastLoggedDate = now;
      await payment.save();

      processed++;
    }

    console.log(
      `[Scheduler] ${timestamp} — Recurring payments: ${processed} processed, ${skipped} skipped (already logged today).`
    );
  } catch (err) {
    console.error(`[Scheduler] ${timestamp} — Error during run:`, err.message || err);
  }
}

async function runWarrantyExpiryCheck() {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const timestamp = now.toISOString();

  try {
    const assets = await Asset.find({
      warrantyExpiryDate: { $gte: now, $lte: in30Days },
    }).exec();

    for (const asset of assets) {
      const expiryStr = asset.warrantyExpiryDate.toISOString().slice(0, 10);
      await createNotification(asset.user, {
        type: 'warranty_expiry',
        title: `Warranty expiring: ${asset.name}`,
        message: `The warranty for ${asset.name} expires on ${expiryStr}. Consider reviewing your coverage.`,
        sourceType: 'asset',
        sourceId: asset._id,
      });
    }

    console.log(`[Scheduler] ${timestamp} — Warranty check: ${assets.length} asset(s) expiring within 30 days.`);
  } catch (err) {
    console.error(`[Scheduler] ${timestamp} — Error during warranty check:`, err.message || err);
  }
}

/**
 * Start the recurring payment scheduler.
 * Runs daily at 00:05 server time.
 * Call this once after MongoDB is connected (in server.js), only in non-test environments.
 */
function startScheduler() {
  cron.schedule('4 5 * 2 1', runScheduler);
  console.log('[Scheduler] Recurring payment scheduler started (daily at 00:05).');

  cron.schedule('0 8 * * *', runWarrantyExpiryCheck);
  console.log('[Scheduler] Warranty expiry checker started (daily at 08:00).');
}

module.exports = { startScheduler };
