import Job from '../models/Job.js';

class AnalyticsService {
  /**
   * Counts the frequency of each tag across all of a user's jobs.
   * Returns a sorted array of { name, count } objects.
   */
  async getRequirementCounts(userId) {
    const jobs = await Job.find({
      userId,
      tags: { $exists: true, $ne: [] },
    }).populate('tags');

    const counts = {};

    for (const job of jobs) {
      if (!job.tags || !Array.isArray(job.tags)) continue;

      for (const tag of job.tags) {
        if (!tag || !tag.name) continue;
        counts[tag.name] = (counts[tag.name] || 0) + 1;
      }
    }

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export default AnalyticsService;
