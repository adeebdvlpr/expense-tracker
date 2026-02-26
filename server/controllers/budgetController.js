const Budget = require('../models/Budgets');
const Expense = require('../models/Expense');

function parsePeriod(period) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return null;
    const [y, m] = period.split('-').map(Number);
    const from = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    const to = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0)); // exclusive
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