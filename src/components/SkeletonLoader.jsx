import React from 'react';

export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-[#141419] border border-white/[0.04] overflow-hidden animate-pulse">
      {/* 16:9 Thumbnail Skeleton */}
      <div className="w-full aspect-video bg-[#1a1a24]/60 relative">
        <div className="absolute bottom-2.5 right-2.5 w-12 h-4 rounded bg-[#232332]/80" />
      </div>

      {/* Metadata Skeleton */}
      <div className="p-4 flex flex-col gap-3">
        {/* Title Lines */}
        <div className="space-y-2">
          <div className="h-4 bg-[#232332] rounded-md w-11/12" />
          <div className="h-4 bg-[#232332]/60 rounded-md w-3/4" />
        </div>

        {/* Channel & Stats */}
        <div className="space-y-1.5 pt-1">
          <div className="h-3 bg-[#1e1e2c] rounded-md w-1/2" />
          <div className="h-2.5 bg-[#1a1a26] rounded-md w-1/3" />
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
