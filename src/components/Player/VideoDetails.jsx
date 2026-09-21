import React, { useState } from 'react';
import {
  Bookmark,
  Check,
  Share2,
  ThumbsUp,
  Eye,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  Copy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatViews, formatTimeAgo } from '../../utils/formatters';

export default function VideoDetails({ videoData, videoId }) {
  const { isWatchLater, toggleWatchLater, navigateToSearch } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!videoData) return null;

  const bookmarked = isWatchLater(videoId);
  const views = formatViews(videoData.viewCount);
  const timeAgo = formatTimeAgo(videoData.published || videoData.publishedText);
  const likes = videoData.likeCount ? formatViews(videoData.likeCount).replace('views', 'likes') : null;

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleChannelClick = () => {
    if (videoData.author) {
      navigateToSearch(videoData.author);
    }
  };

  // Format description with URLs
  const descriptionText = videoData.description || 'No description provided.';

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Video Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
        {videoData.title}
      </h1>

      {/* Channel Bar & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/[0.06]">
        {/* Left: Channel Info */}
        <div className="flex items-center gap-3">
          {/* Channel Avatar */}
          <div
            onClick={handleChannelClick}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-900 to-indigo-700 flex items-center justify-center font-bold text-white text-base shadow-md cursor-pointer hover:opacity-90 transition-opacity shrink-0 overflow-hidden"
          >
            {videoData.authorThumbnails?.[0]?.url ? (
              <img
                src={videoData.authorThumbnails[0].url}
                alt={videoData.author}
                className="w-full h-full object-cover"
              />
            ) : (
              (videoData.author?.[0] || 'C').toUpperCase()
            )}
          </div>

          {/* Channel Name & Subs */}
          <div>
            <div
              onClick={handleChannelClick}
              className="flex items-center gap-1.5 font-bold text-sm text-white hover:text-neon-purple cursor-pointer transition-colors"
            >
              <span>{videoData.author}</span>
              {videoData.authorVerified && (
                <CheckCircle2 size={14} className="text-neon-purple" />
              )}
            </div>
            {videoData.subCountText && (
              <span className="text-xs text-void-400">
                {videoData.subCountText}
              </span>
            )}
          </div>

          <button
            onClick={handleChannelClick}
            className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-void-800 hover:bg-void-750 text-void-300 hover:text-white text-xs font-medium border border-white/5 transition-all"
          >
            <Search size={12} />
            Videos
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Like Count (if available) */}
          {likes && (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#141419] border border-white/5 text-xs text-void-300">
              <ThumbsUp size={14} className="text-void-400" />
              <span>{likes}</span>
            </div>
          )}

          {/* Bookmark (Watch Later) Button */}
          <button
            onClick={() => toggleWatchLater(videoData)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              bookmarked
                ? 'bg-neon-purple text-white shadow-neon-purple'
                : 'bg-[#141419] hover:bg-[#1a1a24] text-void-200 hover:text-white border border-white/5'
            }`}
          >
            {bookmarked ? <Check size={14} strokeWidth={2.8} /> : <Bookmark size={14} />}
            <span>{bookmarked ? 'Saved' : 'Watch Later'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#141419] hover:bg-[#1a1a24] text-void-200 hover:text-white border border-white/5 text-xs font-semibold transition-all"
            title="Copy video link"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Description Card */}
      <div className="p-4 rounded-2xl bg-[#131318] border border-white/[0.05] flex flex-col gap-2">
        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs font-semibold text-void-300 mb-1">
          {views && (
            <span className="flex items-center gap-1.5">
              <Eye size={14} className="text-void-500" />
              {views}
            </span>
          )}
          {timeAgo && (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-void-500" />
              {timeAgo}
            </span>
          )}
        </div>

        {/* Text Body */}
        <div
          className={`text-xs sm:text-sm text-void-300 leading-relaxed whitespace-pre-line font-normal overflow-hidden transition-all duration-200 ${
            expanded ? '' : 'line-clamp-3'
          }`}
        >
          {descriptionText}
        </div>

        {/* Toggle Expand */}
        {descriptionText.length > 180 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="self-start flex items-center gap-1 text-xs font-semibold text-neon-purple hover:text-purple-300 pt-1 transition-colors"
          >
            <span>{expanded ? 'Show less' : 'Show more'}</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
