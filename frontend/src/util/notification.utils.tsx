import type { NotificationType } from '../types/notification.types';
import type { LucideIcon } from 'lucide-react';
import {
  LogIn,
  Calendar,
  CreditCard,
  Wrench,
  Bell,
  Clock,
  Settings,
} from 'lucide-react';

export const getNotificationIcon = (type: NotificationType): LucideIcon => {
  const icons: Record<NotificationType, LucideIcon> = {
    LOGIN: LogIn,
    BOOKING: Calendar,
    PAYMENT: CreditCard,
    SERVICE: Wrench,
    REMINDER: Clock,
    SYSTEM: Settings,
  };

  return icons[type] || Bell;
};

export const getNotificationColor = (type: NotificationType): string => {
  const colors: Record<string, string> = {
    LOGIN: 'bg-blue-100 text-blue-600',
    BOOKING: 'bg-green-100 text-green-600',
    PAYMENT: 'bg-purple-100 text-purple-600',
    SERVICE: 'bg-orange-100 text-orange-600',
    REMINDER: 'bg-yellow-100 text-yellow-600',
    SYSTEM: 'bg-gray-100 text-gray-600',
  };
  return colors[type] || 'bg-blue-100 text-blue-600';
};

export const formatNotificationTime = (timestamp: string): string => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};