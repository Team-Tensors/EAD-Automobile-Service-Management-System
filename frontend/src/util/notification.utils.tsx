import type { NotificationType } from '../types/notification.types';
import type { LucideIcon } from 'lucide-react';
import {
  LogIn,
  Calendar,
  Wrench,
  Bell,
  Clock,
  Settings,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';

export const getNotificationIcon = (type: NotificationType): LucideIcon => {
  const icons: Record<NotificationType, LucideIcon> = {
    LOGIN_SUCCESS: LogIn,
    APPOINTMENT_CREATED: Calendar,
    APPOINTMENT_ASSIGNED: Calendar,
    TASK_ASSIGNED: Wrench,
    APPOINTMENT_STARTED: Clock,
    APPOINTMENT_COMPLETED: CheckCircle,
    VEHICLE_ADDED: Settings,
    VEHICLE_UPDATED: Settings,
    VEHICLE_DELETED: Settings,
    NEW_CHAT_MESSAGE: MessageCircle,
  };

  return icons[type] || Bell;
};

export const getNotificationColor = (type: NotificationType): string => {
  const colors: Record<string, string> = {
    LOGIN_SUCCESS: 'bg-blue-500/20 text-blue-400',
    APPOINTMENT_CREATED: 'bg-green-500/20 text-green-400',
    APPOINTMENT_ASSIGNED: 'bg-green-500/20 text-green-400',
    TASK_ASSIGNED: 'bg-orange-500/20 text-orange-400',
    APPOINTMENT_STARTED: 'bg-yellow-500/20 text-yellow-400',
    APPOINTMENT_COMPLETED: 'bg-emerald-500/20 text-emerald-400',
    VEHICLE_ADDED: 'bg-purple-500/20 text-purple-400',
    VEHICLE_UPDATED: 'bg-purple-500/20 text-purple-400',
    VEHICLE_DELETED: 'bg-red-500/20 text-red-400',
    NEW_CHAT_MESSAGE: 'bg-cyan-500/20 text-cyan-400',
  };
  return colors[type] || 'bg-gray-500/20 text-gray-400';
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