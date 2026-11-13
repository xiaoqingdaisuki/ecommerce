import 'server-only';
import { gql } from '@shopify/hydrogen';
import { cacheLife, cacheTag } from 'next/cache';
import { createCatalogClient } from '@/lib/shopify/client';
import { pageCursor, PAGE_SIZE } from '@/lib/utils/shopify-routes';

const BLOG_QUERY = gql(`
  query BlogPage($handle: String!, $first: Int!, $after: String) {
    blog(handle: $handle) {
      title handle seo { title description }
      articles(first: $first, after: $after) {
        nodes { id title handle excerpt publishedAt }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`);

const ARTICLE_QUERY = gql(`
  query BlogArticle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      title handle
      articleByHandle(handle: $articleHandle) { title handle contentHtml excerpt publishedAt seo { title description } }
    }
  }
`);

export async function getBlog(handle: string, page: number) {
  const client = createCatalogClient();
  const cursor = await pageCursor(page, async (first, after) => {
    const { data, errors } = await client.graphql(BLOG_QUERY, { variables: { handle, first, after } });
    if (errors?.length) throw new Error('Blog is temporarily unavailable.');
    return data?.blog?.articles.pageInfo ?? { hasNextPage: false, endCursor: null };
  });
  const { data, errors } = await client.graphql(BLOG_QUERY, {
    variables: { handle, first: PAGE_SIZE, after: cursor.after },
  });
  if (errors?.length || !data) throw new Error('Blog is temporarily unavailable.');
  if (data.blog && cursor.exhausted)
    data.blog.articles = { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
  return data.blog;
}

export async function getArticle(blogHandle: string, articleHandle: string) {
  'use cache: remote';
  cacheLife('minutes');
  cacheTag('content:blogs');
  const { data, errors } = await createCatalogClient().graphql(ARTICLE_QUERY, {
    variables: { blogHandle, articleHandle },
  });
  if (errors?.length || !data) throw new Error('Article is temporarily unavailable.');
  return data.blog?.articleByHandle
    ? { ...data.blog.articleByHandle, blog: { title: data.blog.title, handle: data.blog.handle } }
    : null;
}
