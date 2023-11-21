import { reactionQueue } from '@service/queues/reaction.queue';
import { ReactionCache } from '@service/redis/reaction.cache.ts';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IReactionJob } from '../interfaces/reaction.interface';

const reactionCache: ReactionCache = new ReactionCache();

export class Remove {
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, postReactions, previousReaction } = req.params;

    await reactionCache.removePostReactionFromCache(postId, `${req.currentUser!.username}`, JSON.parse(postReactions));

    const databaseReactionData: IReactionJob = {
      postId,
      username: req.currentUser!.username,
      previousReaction
    };

    reactionQueue.addReactionJob('removeReactionFromDB', databaseReactionData);

    res.status(HTTP_STATUS.CREATED).json({ message: 'Reaction remove from post successfully!' });
  }
}
