const mongoose = require('mongoose');

const RowSchema = new mongoose.Schema({
  rowId: { type: String, required: true },
  rowName: String,
  owner: String,
  goal: String,
  priority: { type: String, enum: ['Basse', 'Moyenne', 'Haute'], default: 'Moyenne' },
  type: String,
  budget: Number,
  actual: Number,
  remainingBudget: Number,
  status: { type: String, enum: ['En cours', 'Terminé', 'À venir'], default: 'À venir' },
});

const TabSchema = new mongoose.Schema({
  tabId: { type: String, required: true },
  tabName: String,
  rows: [RowSchema],
});

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  projectName: String,
  tabs: [TabSchema],
});

const ProgramSchema = new mongoose.Schema({
  programId: { type: String, required: true },
  programName: String,
  projects: [ProjectSchema],
});

const CompanySchema = new mongoose.Schema({
  id: { type: String, required: true },
  companyName: String,
  programs: [ProgramSchema],
});

const DataCompaniesSchema = new mongoose.Schema({
  companies: [CompanySchema],
}, { timestamps: true }, { collection: 'datacompanies' });

module.exports = mongoose.model('DataCompanies', DataCompaniesSchema);