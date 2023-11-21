import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { addReactionSchema } from '../schemes/reactions';
import { IReactionDocument, IReactionJob } from '../interfaces/reaction.interface';
import { ReactionCache } from '@service/redis/reaction.cache.ts';
import { reactionQueue } from '@service/queues/reaction.queue';

const reactionCache: ReactionCache = new ReactionCache();

export class Add {
  @joiValidation(addReactionSchema)
  public async reaction(req: Request, res: Response): Promise<void> {
    const { userTo, postId, type, previousReaction, postReactions, profilePicture } = req.body;
    const reactionObject: IReactionDocument = {
      _id: new ObjectId(),
      postId,
      type,
      avataColor: req.currentUser!.avatarColor,
      username: req.currentUser!.username,
      profilePicture
    } as IReactionDocument;

    await reactionCache.savePostReactionToCache(postId, reactionObject, postReactions, type, previousReaction);

    const databaseReactionData: IReactionJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      type,
      previousReaction,
      reactionObject
    };

    reactionQueue.addReactionJob('addReactionToDB', databaseReactionData);

    res.status(HTTP_STATUS.CREATED).json({ message: 'Reaction added successfully!' });
  }
}
