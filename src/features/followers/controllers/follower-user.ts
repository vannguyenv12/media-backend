import { IFollowerData } from '@follower/interfaces/follower.interface';
import { followerQueue } from '@service/queues/follower.queue';
import { FollowerCache } from '@service/redis/follower.cache';
import { UserCache } from '@service/redis/user.cache';
import { socketIOFollowerObject } from '@socket/follower';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();

// follower: người follow
// following: người được follow
// A follow B -> B có các follwers là [A]
//            -> A có followees là [B]

export class Add {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;

    const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', 1);
    const followeeCount: Promise<void> = followerCache.updateFollowersCountInCache(`${req.currentUser!.userId}`, 'followingCount', 1);

    await Promise.all([followersCount, followeeCount]);

    const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(followerId) as Promise<IUserDocument>;
    const cachedFollowee: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser!.userId}`) as Promise<IUserDocument>;

    const response: [IUserDocument, IUserDocument] = await Promise.all([cachedFollower, cachedFollowee]);

    const followerObjectId: ObjectId = new ObjectId();
    const addFolloweeData: IFollowerData = Add.prototype.userData(response[0]);

    // send to client socket io
    socketIOFollowerObject.emit('add follower', addFolloweeData);

    const addFollowerToCached: Promise<void> = followerCache.saveFollowerToCache(`following:${req.currentUser!.userId}`, `${followerId}`);
    const addFolloweeToCached: Promise<void> = followerCache.saveFollowerToCache(`followers:${followerId}`, `${req.currentUser!.userId}`);
    await Promise.all([addFollowerToCached, addFolloweeToCached]);

    followerQueue.addFollowerJob('addFollowerToDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followerId}`,
      username: req.currentUser!.username,
      followerDocumentId: followerObjectId
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Following user now' });
  }

  private userData(user: IUserDocument): IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
      userProfile: user
    };
  }
}
