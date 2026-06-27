import Job from '../models/Job.js';
import User from '../models/User.js';

class AnalyticsController {
  constructor() {
    this.getRequirementsRadar = this.getRequirementsRadar.bind(this);
  }

  async getRequirementsRadar(req, res) {
    try {
      // Fetch all jobs for the current user that have requirements
      const jobs = await Job.find({ 
        userId: req.userId,
        requirements: { $exists: true, $ne: '' }
      });
      
      const requirementCounts = {};

      jobs.forEach(job => {
        if (!job.requirements) return;
        
        // Split by comma, trim whitespace, and uppercase
        const reqs = job.requirements.split(',').map(r => r.trim().toUpperCase());
        
        reqs.forEach(reqName => {
          if (!reqName || reqName === '?' || reqName === '-') return;
          requirementCounts[reqName] = (requirementCounts[reqName] || 0) + 1;
        });
      });

      // Convert to array and sort
      const sortedRequirements = Object.entries(requirementCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      res.json(sortedRequirements);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
}

export default AnalyticsController;
