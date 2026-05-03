import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { postFeed } from "../../lib/api";
import PostCard from "../Profile Components/PostCard";

const Feed = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["post-feed"],
    queryFn: ({ pageParam = 1 }) => postFeed(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-4 flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card bg-base-100 shadow-md p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-base-300" />
              <div className="flex flex-col gap-2">
                <div className="h-3 w-32 bg-base-300 rounded" />
                <div className="h-2 w-20 bg-base-300 rounded" />
              </div>
            </div>
            <div className="h-40 bg-base-300 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-60">
        <p className="text-sm">Something went wrong loading your feed.</p>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 opacity-50">
        <p className="text-base font-medium">No posts yet</p>
        <p className="text-sm">Add some friends to see their posts here.</p>
      </div>
    );
  }

  return (
    <div className="">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      {/* Load more */}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="btn btn-ghost btn-sm mx-auto mt-2 opacity-60"
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}

      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-xs opacity-30 mt-4">
          You're all caught up!
        </p>
      )}
    </div>
  );
};

export default Feed;
