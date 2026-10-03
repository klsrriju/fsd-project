import { redisClient } from '../config/redis';

export type QueueJob = {
  id: string;
  type: 'resume_parse' | 'candidate_match' | 'notification';
  payload: Record<string, unknown>;
  status: 'pending' | 'done' | 'failed';
};

export async function enqueueJob(job: QueueJob) {
  if (!redisClient.isOpen) {
    return;
  }

  try {
    await redisClient.lPush('recruitment:queue', JSON.stringify(job));
  } catch (error) {
    console.warn('Redis queue enqueue failed:', error);
  }
}

export async function getQueueLength() {
  if (!redisClient.isOpen) {
    return 0;
  }

  try {
    return await redisClient.lLen('recruitment:queue');
  } catch (error) {
    return 0;
  }
}
