import React from 'react';

/**
 * Skeleton loader for unassigned appointment cards
 * Used in the "Awaiting Assignment" section
 */
export const UnassignedCardSkeleton: React.FC = () => (
  <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-5 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-zinc-700 rounded-lg"></div>
        <div>
          <div className="h-4 bg-zinc-700 rounded w-32 mb-2"></div>
          <div className="h-3 bg-zinc-700 rounded w-20"></div>
        </div>
      </div>
      <div className="h-6 w-20 bg-zinc-700 rounded-full"></div>
    </div>
    <div className="space-y-3 mb-4">
      <div>
        <div className="h-3 bg-zinc-700 rounded w-24 mb-1"></div>
        <div className="h-4 bg-zinc-700 rounded w-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="h-3 bg-zinc-700 rounded w-20 mb-1"></div>
          <div className="h-4 bg-zinc-700 rounded w-full"></div>
        </div>
        <div>
          <div className="h-3 bg-zinc-700 rounded w-16 mb-1"></div>
          <div className="h-4 bg-zinc-700 rounded w-full"></div>
        </div>
      </div>
      <div>
        <div className="h-3 bg-zinc-700 rounded w-28 mb-1"></div>
        <div className="h-4 bg-zinc-700 rounded w-full"></div>
      </div>
    </div>
    <div className="h-10 bg-zinc-700 rounded-lg w-full"></div>
  </div>
);

/**
 * Skeleton loader for appointment cards (upcoming and ongoing)
 * Used in the "Upcoming Appointments" and "Ongoing Appointments" sections
 */
export const AppointmentCardSkeleton: React.FC = () => (
  <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-800 animate-pulse">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-zinc-700 rounded"></div>
        <div className="h-4 bg-zinc-700 rounded w-32"></div>
      </div>
    </div>
    <div className="h-3 bg-zinc-700 rounded w-24 mb-1"></div>
    <div className="h-3 bg-zinc-700 rounded w-full mb-2"></div>
    <div className="h-3 bg-zinc-700 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-zinc-700 rounded w-2/3 mb-2"></div>
    <div className="h-3 bg-zinc-700 rounded w-1/2 mb-3"></div>
    <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
      <div className="h-3 bg-zinc-700 rounded w-16"></div>
      <div className="h-6 w-20 bg-zinc-700 rounded-full"></div>
    </div>
  </div>
);

/**
 * Skeleton loader for the awaiting assignment section
 * Displays 3 unassigned card skeletons in a grid
 */
export const UnassignedSectionSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <UnassignedCardSkeleton />
    <UnassignedCardSkeleton />
    <UnassignedCardSkeleton />
  </div>
);

/**
 * Skeleton loader for appointment list sections
 * Displays 3 appointment card skeletons
 */
export const AppointmentListSkeleton: React.FC = () => (
  <>
    <AppointmentCardSkeleton />
    <AppointmentCardSkeleton />
    <AppointmentCardSkeleton />
  </>
);
