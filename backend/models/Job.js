import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  company: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: String, default: 'Applied' },
  workModel: { type: String, default: 'Remote' },
  location: { type: String },
  dateApplied: { type: Date, default: Date.now },
  requirements: { type: String },
  notes: { type: String },
  link: { type: String }
});

const Job = mongoose.model('Job', jobSchema);
export default Job;