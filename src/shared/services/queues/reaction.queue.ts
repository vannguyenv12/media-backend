import { IReactionJob } from '@root/features/reactions/interfaces/reaction.interface';
import { BaseQueue } from './base.queue';
import { reactionWorker } from '@worker/reaction.worker';

class ReactionQueue extends BaseQueue {
  constructor() {
    super('reaction');
    this.processJob('addReactionToDB', 5, reactionWorker.addReactionToDB);
    this.processJob('removeReactionFromDB', 5, reactionWorker.removeReactionFromDB);
  }

  public addReactionJob(name: string, data: IReactionJob): void {
    this.addJob(name, data);
  }
}

export const reactionQueue: ReactionQueue = new ReactionQueue();
