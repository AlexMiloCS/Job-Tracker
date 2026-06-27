import Job from '../models/Job.js';
import Tag from '../models/Tag.js';

const FLASK_URL = process.env.FLASK_CLUSTER_URL || 'http://localhost:5001';

class JobService {
  async _processTags(tagsArray) {
    if (!tagsArray || !Array.isArray(tagsArray)) return [];
    
    const tagIds = [];
    for (const tagName of tagsArray) {
      if (!tagName || typeof tagName !== 'string') continue;
      
      const cleanedName = tagName.trim().toUpperCase();
      if (!cleanedName) continue;

      const tag = await Tag.findOneAndUpdate(
        { name: cleanedName },
        { name: cleanedName },
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
      );
      tagIds.push(tag._id);
    }
    return tagIds;
  }

  async createJob(userId, jobData) {
    if (jobData.tags) {
      jobData.tags = await this._processTags(jobData.tags);
    }

    const newJob = new Job({ ...jobData, userId });
    await newJob.save();

    if (newJob.title) {
      try {
        const flaskRes = await fetch(`${FLASK_URL}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newJob.title }),
        });

        if (flaskRes.ok) {
          const { clusterId, clusterLabel } = await flaskRes.json();
          newJob.clusterId = clusterId;
          
          const existingJobInCluster = await Job.findOne({ 
            userId, 
            clusterId: clusterId 
          });

          if (existingJobInCluster && existingJobInCluster.clusterLabel) {
            newJob.clusterLabel = existingJobInCluster.clusterLabel;
          } else {
            newJob.clusterLabel = clusterLabel;
          }
          
          await newJob.save();
        }
      } catch (e) {
        // Silently skip if clustering service is unreachable
      }
    }

    // Populate tags before returning
    await newJob.populate('tags');
    return newJob;
  }

  async getUserJobs(userId) {
    return await Job.find({ userId }).populate('tags').sort({ dateApplied: -1 });
  }

  async updateJob(userId, jobId, jobData) {
    if (jobData.tags) {
      jobData.tags = await this._processTags(jobData.tags);
    }

    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId, userId },
      jobData,
      { returnDocument: 'after' }
    ).populate('tags');

    if (!updatedJob) {
      throw new Error('Job not found or unauthorized');
    }
    return updatedJob;
  }

  async deleteJob(userId, jobId) {
    const deletedJob = await Job.findOneAndDelete({ _id: jobId, userId });
    if (!deletedJob) {
      throw new Error('Job not found or unauthorized');
    }
    return true;
  }
}

export default JobService;
