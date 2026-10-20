import type { CollectionEntry } from "astro:content";

/** Resolve editorial choices by stable URL; fail visibly on stale links. */
export function selectedPosts(
  paths: string[],
  posts: CollectionEntry<"blog">[],
) {
  return paths.map((path) => {
    const post = posts.find(
      (entry) => entry.data.legacyPath === path && !entry.data.draft,
    );
    if (!post) throw new Error(`精选文章不存在或尚未公开：${path}`);
    return post;
  });
}
