import { blockUserQueue } from '@service/queues/block-user.queue';
import { FollowerCache } from '@service/redis/follower.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const followerCache: FollowerCache = new FollowerCache();

export class AddUser {
  public async block(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    AddUser.prototype.updateBlockedUser(followerId, req.currentUser!.userId, 'block');
    blockUserQueue.addBlockUserJob('addBlockUserToDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followerId}`,
      type: 'block'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User blocked' });
  }

  public async unblock(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    AddUser.prototype.updateBlockedUser(followerId, req.currentUser!.userId, 'unblock');
    blockUserQueue.addBlockUserJob('removeBlockUserFromDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followerId}`,
      type: 'unblock'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User unblocked' });
  }

  private async updateBlockedUser(followerId: string, userId: string, type: 'block' | 'unblock'): Promise<void> {
    const blocked: Promise<void> = followerCache.updateBlockUserPropInCache(`${userId}`, 'blocked', `${followerId}`, type);
    const blockedBy: Promise<void> = followerCache.updateBlockUserPropInCache(`${followerId}`, 'blockedBy', `${userId}`, type);
    await Promise.all([blocked, blockedBy]);
  }
}
