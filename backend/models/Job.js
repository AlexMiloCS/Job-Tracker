import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: String, default: 'Applied' },
  workModel: { type: String, default: 'Remote' },
  location: { type: String },
  city: { type: String },
  country: { type: String },
  dateApplied: { type: Date, default: Date.now },
  dateInterviewing: { type: Date },
  dateOffer: { type: Date },
  dateRejected: { type: Date },
  requirements: { type: String },
  notes: { type: String },
  link: { type: String },
  clusterId: { type: Number },
  clusterLabel: { type: String }
});

const Job = mongoose.model('Job', jobSchema);
export default Job;