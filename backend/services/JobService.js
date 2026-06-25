import Job from '../models/Job.js';

const FLASK_URL = process.env.FLASK_CLUSTER_URL || 'http://localhost:5001';

class JobService {
  async createJob(userId, jobData) {
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

    return newJob;
  }

  async getUserJobs(userId) {
    return await Job.find({ userId }).sort({ dateApplied: -1 });
  }

  async updateJob(userId, jobId, jobData) {
    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId, userId },
      jobData,
      { new: true }
    );

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
