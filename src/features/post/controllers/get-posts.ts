import { IPostDocument } from '@post/interfaces/post.interface';
import { postService } from '@service/db/post.service';
import { PostCache } from '@service/redis/post.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const postCache: PostCache = new PostCache();
const PAGE_SIZE = 10;

export class Get {
  public async posts(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;

    let posts: IPostDocument[] = [];

    let totalPosts = 0;
    const cachedPost: IPostDocument[] = await postCache.getPostsFromCache('posts', newSkip, limit);

    if (cachedPost.length) {
      posts = cachedPost;
      totalPosts = await postCache.getTotalPostsInCache();
    } else {
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
      totalPosts = await postService.postsCount();
    }

    res.status(HTTP_STATUS.OK).json({ message: 'All posts', posts, totalPosts });
  }

  public async postsWithImages(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;

    let posts: IPostDocument[] = [];

    const cachedPosts: IPostDocument[] = await postCache.getPostsWithImagesFromCache('posts', newSkip, limit);

    posts = cachedPosts.length ? cachedPosts : await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'All posts with images', posts });
  }
}
