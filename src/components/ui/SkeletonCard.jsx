import React from 'react';

const SkeletonCard = ({ index }) => {
  return (
    <div
      className="relative overflow-hidden rounded-4xl bg-white shadow-premium"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: `fadeInUp 0.6s ease-out forwards, pulse-slow 2s infinite ${index * 100}ms`
      }}
    >
      {/* Image Skeleton */}
      <div className="h-56 bg-premium-gradient relative overflow-hidden">
        <div className="absolute inset-0 skeleton-premium" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-secondary-100/20" />

        {/* Top badges skeleton */}
        <div className="absolute top-5 left-5">
          <div className="w-8 h-8 rounded-full skeleton" />
        </div>
        <div className="absolute top-5 right-5">
          <div className="w-16 h-6 rounded-xl skeleton" />
        </div>
        <div className="absolute bottom-5 left-5">
          <div className="w-12 h-4 rounded-lg skeleton" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 skeleton rounded-lg w-3/4" />
          <div className="h-4 skeleton rounded w-1/2" />
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-5 skeleton rounded-lg w-16" />
          <div className="h-5 skeleton rounded-lg w-20" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 skeleton rounded w-full" />
          <div className="h-4 skeleton rounded w-4/5" />
        </div>

        {/* Author */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 skeleton rounded-full" />
          <div className="h-4 skeleton rounded w-24" />
        </div>

        {/* Meta info */}
        <div className="flex gap-3">
          <div className="h-8 skeleton rounded-xl w-20" />
          <div className="h-8 skeleton rounded-xl w-16" />
          <div className="h-8 skeleton rounded-xl w-14 ml-auto" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <div className="h-12 skeleton rounded-2xl flex-1" />
          <div className="h-12 w-12 skeleton rounded-2xl" />
        </div>

        {/* CTA Button */}
        <div className="h-14 skeleton rounded-2xl w-full" />
      </div>
    </div>
  );
};

export default SkeletonCard;