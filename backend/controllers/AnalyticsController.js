import AnalyticsService from '../services/AnalyticsService.js';

class AnalyticsController {
  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getRequirementsRadar = async (req, res) => {
    try {
      const sortedRequirements = await this.analyticsService.getRequirementCounts(req.userId);
      res.json(sortedRequirements);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
}

export default AnalyticsController;
