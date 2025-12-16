import React from 'react';

// Simple skeleton block
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="animate-pulse h-3 bg-gray-200 rounded" />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="h-5 w-40 mb-4 animate-pulse bg-gray-200 rounded" />
    <div className="h-40 animate-pulse bg-gray-200 rounded" />
  </div>
);

export default Skeleton;
