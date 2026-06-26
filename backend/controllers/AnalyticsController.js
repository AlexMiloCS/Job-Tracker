import Job from '../models/Job.js';

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
          if (requirementCounts[reqName]) {
            requirementCounts[reqName]++;
          } else {
            requirementCounts[reqName] = 1;
          }
        });
      });

      // Convert to array and sort descending by count
      const sortedRequirements = Object.keys(requirementCounts)
        .map(key => ({ name: key, count: requirementCounts[key] }))
        .sort((a, b) => b.count - a.count);

      res.status(200).json(sortedRequirements);
    } catch (error) {
      console.error('Error fetching requirement radar data:', error);
      res.status(500).json({ error: 'Server error fetching requirement radar data' });
    }
  }
}

export default AnalyticsController;
