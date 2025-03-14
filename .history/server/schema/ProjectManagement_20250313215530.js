// models/ProjectCompany.js
const mongoose = require('mongoose');

const rowSchema = new mongoose.Schema({
  rowId: { type: String, required: true },
  rowName: { type: String },
  owner: { type: String },
  goal: { type: String },
  priority: { type: String },
  type: { type: String },
  budget: { type: Number },
  actual: { type: Number },
  remainingBudget: { type: Number },
  status: { type: String }
}, { _id: false });

const tabSchema = new mongoose.Schema({
  tabId: { type: String, required: true },
  tabName: { type: String },
  rows: [rowSchema]
}, { _id: false });

const projectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  projectName: { type: String },
  tabs: [tabSchema]
}, { _id: false });

const programSchema = new mongoose.Schema({
  programId: { type: String, required: true },
  programName: { type: String },
  description: { type: String },
  programManager: { type: String },
  participants: [{ userId: String, email: String }],
  otherInfo: { type: String },
  projects: [projectSchema]
}, { _id: false });

const projectCompanySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  description: { type: String },
  userId: { type: String },
  category: { type: String },
  pendingValidation: { type: Boolean, default: false },
  members: [{ userId: String, email: String }],
  programs: [programSchema]
}, { collection: 'datacompanies' });

module.exports = mongoose.model('ProjectCompany', projectCompanySchema);
