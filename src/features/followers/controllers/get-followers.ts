import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { FollowerCache } from '@service/redis/follower.cache';
import { IFollower, IFollowerData } from '@follower/interfaces/follower.interface';
import { followerService } from '@service/db/follower.service';

const followerCache: FollowerCache = new FollowerCache();

export class Get {
  // Mình đang follow ai???
  public async userFollowing(req: Request, res: Response) {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);
    const cachedFollowees: IFollowerData[] = await followerCache.getFollowersInCache(`following:${req.currentUser!.userId}`);

    const following: IFollower[] | IFollowerData[] = cachedFollowees.length
      ? cachedFollowees
      : await followerService.getFolloweeData(userObjectId);

    res.status(HTTP_STATUS.OK).json({ message: 'User following', following });
  }

  public async userFollowers(req: Request, res: Response) {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.params.userId);
    const cachedFollowers: IFollowerData[] = await followerCache.getFollowersInCache(`following:${req.params.userId}`);

    const followers: IFollower[] | IFollowerData[] = cachedFollowers.length
      ? cachedFollowers
      : await followerService.getFolloweeData(userObjectId);

    res.status(HTTP_STATUS.OK).json({ message: 'User followers', followers });
  }
}
