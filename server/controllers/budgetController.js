const Budget = require('../models/Budgets');
const Expense = require('../models/Expense');
const { createNotification } = require('../services/notificationService');

function parsePeriod(period) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return null;
    const [y, m] = period.split('-').map(Number);
    const from = new Date(y, m - 1, 1, 0, 0, 0, 0); // local midnight
    const to = new Date(y, m, 1, 0, 0, 0, 0);        // exclusive, local midnight
    return { from, to };
}
    
exports.listBudgets = async (req, res, next) => {
    try {
        const period = (req.query.period || '').trim();
        if (!period) return res.status(400).json({ message: 'period is required (YYYY-MM)' });
    
        const range = parsePeriod(period);
        if (!range) return res.status(400).json({ message: 'Invalid period. Use YYYY-MM.' });
    
        const budgets = await Budget.find({ user: req.user.id, period })
          .sort({ category: 1 })
          .lean()
          .exec();
    
        const includeSpent = String(req.query.includeSpent || '').toLowerCase() === 'true';
        if (!includeSpent) return res.json({ period, budgets });
    
        const expenses = await Expense.find({
          user: req.user.id,
          date: { $gte: range.from, $lt: range.to },
        })
          .select('category amount')
          .lean()
          .exec();
    
        const spentByCategory = {};
        for (const e of expenses) {
          const cat = e.category || 'Uncategorized';
          const amt = typeof e.amount === 'number' ? e.amount : Number(e.amount) || 0;
          spentByCategory[cat] = (spentByCategory[cat] || 0) + amt;
        }
    
        const budgetsWithSpent = budgets.map((b) => ({
          ...b,
          spent: spentByCategory[b.category] || 0,
          remaining: (b.amount || 0) - (spentByCategory[b.category] || 0),
        }));
    
        return res.json({ period, budgets: budgetsWithSpent });
      } catch (err) {
        next(err);
      }
    };
    
    // Upsert by (user, period, category)
    exports.upsertBudget = async (req, res, next) => {
      try {
        const { period, category, amount, currency } = req.body;
    
        const update = {
          $set: {
            amount: Number(amount),
            currency: currency || 'USD',
          },
          $setOnInsert: {
            user: req.user.id,
            period,
            category,
          },
        };
    
        const saved = await Budget.findOneAndUpdate(
          { user: req.user.id, period, category },
          update,
          { new: true, upsert: true, runValidators: true }
        ).lean();

        // Fire budget_alert if spend >= 80% — fire-and-forget
        const range = parsePeriod(period);
        if (range && saved.amount > 0) {
          Expense.find({
            user: req.user.id,
            category,
            date: { $gte: range.from, $lt: range.to },
          })
            .select('amount')
            .lean()
            .exec()
            .then((expenses) => {
              const spent = expenses.reduce((sum, e) => sum + (typeof e.amount === 'number' ? e.amount : Number(e.amount) || 0), 0);
              if (spent / saved.amount >= 0.8) {
                const pct = Math.round((spent / saved.amount) * 100);
                const over = spent > saved.amount;
                createNotification(req.user.id, {
                  type: 'budget_alert',
                  title: over ? `Over budget: ${category}` : `${category} at ${pct}%`,
                  message: over
                    ? `You've spent ${spent.toFixed(2)} against a ${saved.amount.toFixed(2)} budget for ${category} in ${period}.`
                    : `You've used ${pct}% of your ${category} budget for ${period}.`,
                  sourceType: 'budget',
                  sourceId: saved._id,
                }).catch(() => {});
              }
            })
            .catch(() => {});
        }

        return res.status(201).json(saved);
      } catch (err) {
        if (err?.code === 11000) {
          return res.status(409).json({ message: 'Budget already exists for that category and period.' });
        }
        next(err);
      }
    };
    
    exports.deleteBudget = async (req, res, next) => {
      try {
        const removed = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!removed) return res.status(404).json({ message: 'Budget not found' });
        return res.json({ message: 'Budget deleted' });
      } catch (err) {
        next(err);
      }
    };