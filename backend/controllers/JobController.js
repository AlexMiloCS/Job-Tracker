import JobService from '../services/JobService.js';

class JobController {
  constructor() {
    this.jobService = new JobService();

    this.createJob = this.createJob.bind(this);
    this.getJobs = this.getJobs.bind(this);
    this.updateJob = this.updateJob.bind(this);
    this.deleteJob = this.deleteJob.bind(this);
  }

  async createJob(req, res) {
    try {
      const newJob = await this.jobService.createJob(req.userId, req.body);
      res.status(201).json(newJob);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getJobs(req, res) {
    try {
      const jobs = await this.jobService.getUserJobs(req.userId);
      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({ error: 'Server Error: Could not fetch jobs' });
    }
  }

  async updateJob(req, res) {
    try {
      const updatedJob = await this.jobService.updateJob(req.userId, req.params.id, req.body);
      res.status(200).json(updatedJob);
    } catch (error) {
      if (error.message === 'Job not found or unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async deleteJob(req, res) {
    try {
      await this.jobService.deleteJob(req.userId, req.params.id);
      res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
      if (error.message === 'Job not found or unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }
}

export default JobController;
