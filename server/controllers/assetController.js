const Asset = require('../models/Asset');

exports.listAssets = async (req, res, next) => {
  try {
    const assets = await Asset.find({ user: req.user.id }).sort({ createdAt: -1 }).lean().exec();
    res.json(assets);
  } catch (err) {
    next(err);
  }
};

exports.createAsset = async (req, res, next) => {
  try {
    const {
      name, type, brand, purchaseYear, purchasePrice,
      warrantyLengthYears, warrantyExpiryDate, condition,
      subtype, materialType, mileage, make, vehicleModel,
      estimatedCurrentValue, annualOwnershipCost, depreciationModel,
      annualDepreciationRate, generatesIncome, monthlyIncomeAmount,
      expectedReplacementYear, notes,
    } = req.body;

    const created = await Asset.create({
      user: req.user.id,
      name,
      type,
      brand:               brand               || undefined,
      purchaseYear:        purchaseYear        != null ? purchaseYear        : undefined,
      purchasePrice:       purchasePrice       != null ? purchasePrice       : undefined,
      warrantyLengthYears: warrantyLengthYears != null ? warrantyLengthYears : undefined,
      warrantyExpiryDate:  warrantyExpiryDate  || undefined,
      condition:           condition           || undefined,
      subtype:             subtype             || undefined,
      materialType:        materialType        || undefined,
      mileage:             mileage             != null ? mileage             : undefined,
      make:                make                || undefined,
      vehicleModel:        vehicleModel        || undefined,
      estimatedCurrentValue:   estimatedCurrentValue   != null ? estimatedCurrentValue   : undefined,
      annualOwnershipCost:     annualOwnershipCost      != null ? annualOwnershipCost     : undefined,
      depreciationModel:       depreciationModel        || undefined,
      annualDepreciationRate:  annualDepreciationRate   != null ? annualDepreciationRate  : undefined,
      generatesIncome:         generatesIncome          !== undefined ? generatesIncome   : undefined,
      monthlyIncomeAmount:     monthlyIncomeAmount      != null ? monthlyIncomeAmount     : undefined,
      expectedReplacementYear: expectedReplacementYear  != null ? expectedReplacementYear : undefined,
      notes:                   notes                   || undefined,
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.updateAsset = async (req, res, next) => {
  try {
    const update = {};
    const fields = [
      'name', 'type', 'brand', 'purchaseYear', 'purchasePrice',
      'warrantyLengthYears', 'warrantyExpiryDate', 'condition',
      'subtype', 'materialType', 'mileage', 'make', 'vehicleModel',
      'estimatedCurrentValue', 'annualOwnershipCost', 'depreciationModel',
      'annualDepreciationRate', 'generatesIncome', 'monthlyIncomeAmount',
      'expectedReplacementYear', 'notes',
    ];
    for (const field of fields) {
      if (field in req.body) update[field] = req.body[field];
    }

    const updated = await Asset.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: 'Asset not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteAsset = async (req, res, next) => {
  try {
    const removed = await Asset.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!removed) return res.status(404).json({ message: 'Asset not found' });
    res.json({ message: 'Asset deleted' });
  } catch (err) {
    next(err);
  }
};
