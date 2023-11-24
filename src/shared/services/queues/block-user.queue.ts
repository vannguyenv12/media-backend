import { IBlockedUserJobData } from '@follower/interfaces/follower.interface';
import { blockUserWorker } from '@worker/block.worker';
import { BaseQueue } from './base.queue';

class BlockUserQueue extends BaseQueue {
  constructor() {
    super('blockUser');
    this.processJob('addBlockUserToDB', 5, blockUserWorker.addBlockUserToDB);
    this.processJob('removeBlockUserFromDB', 5, blockUserWorker.addBlockUserToDB);
  }

  public addBlockUserJob(name: string, data: IBlockedUserJobData): void {
    this.addJob(name, data);
  }
}

export const blockUserQueue: BlockUserQueue = new BlockUserQueue();
