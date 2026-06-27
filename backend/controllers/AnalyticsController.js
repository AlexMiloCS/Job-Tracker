import Job from '../models/Job.js';
import User from '../models/User.js';

class AnalyticsController {
  constructor() {
    this.getRequirementsRadar = this.getRequirementsRadar.bind(this);
  }

  async getRequirementsRadar(req, res) {
    try {
      // Fetch all jobs for the current user that have tags
      const jobs = await Job.find({ 
        userId: req.userId,
        tags: { $exists: true, $ne: [] }
      }).populate('tags');
      
      const requirementCounts = {};

      jobs.forEach(job => {
        if (!job.tags || !Array.isArray(job.tags)) return;
        
        job.tags.forEach(tag => {
          if (!tag || !tag.name) return;
          const reqName = tag.name;
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
