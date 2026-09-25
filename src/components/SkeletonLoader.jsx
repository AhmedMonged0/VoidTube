import React from 'react';

export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col rounded-3xl bg-[#131319] border border-white/[0.04] overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.05] before:to-transparent">
      {/* 16:9 Thumbnail Skeleton */}
      <div className="w-full aspect-video bg-[#1a1a24]/50 relative">
        <div className="absolute bottom-2.5 right-2.5 w-12 h-4 rounded-md bg-[#232332]/60" />
      </div>

      {/* Metadata Skeleton */}
      <div className="p-4 flex items-start gap-3">
        {/* Avatar Skeleton */}
        <div className="w-10 h-10 rounded-full bg-[#20202e] shrink-0" />

        <div className="flex-1 flex flex-col gap-2.5">
          {/* Title Lines */}
          <div className="h-3.5 bg-[#232332] rounded-md w-11/12" />
          <div className="h-3 bg-[#232332]/60 rounded-md w-3/4" />

          {/* Channel & Stats */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-2.5 bg-[#1e1e2c] rounded-md w-1/3" />
            <div className="h-2 bg-[#1a1a26] rounded-md w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <VideoCardSkeleton key={index} />
      ))}
    </div>
  );
}
