import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationsAPI } from '../services/api';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll({ limit: 20 });

      if (response.data.success) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'supervisor_review':
        return 'fa-user-tie';
      case 'step_overdue':
        return 'fa-exclamation-triangle';
      case 'project_update':
        return 'fa-folder-open';
      case 'step_completed':
        return 'fa-check-circle';
      default:
        return 'fa-bell';
    }
  };

  const getNotificationColor = (type, isRead) => {
    const baseOpacity = isRead ? 'opacity-60' : '';
    switch (type) {
      case 'supervisor_review':
        return `bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 ${baseOpacity}`;
      case 'step_overdue':
        return `bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 ${baseOpacity}`;
      case 'project_update':
        return `bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 ${baseOpacity}`;
      case 'step_completed':
        return `bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 ${baseOpacity}`;
      default:
        return `bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 ${baseOpacity}`;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'supervisor_review':
        return 'text-purple-500';
      case 'step_overdue':
        return 'text-red-500';
      case 'project_update':
        return 'text-blue-500';
      case 'step_completed':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'เมื่อสักครู่';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;

    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
        title="การแจ้งเตือน"
      >
        <i className="fas fa-bell text-gray-700 dark:text-gray-300"></i>
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <i className="fas fa-bell text-blue-500"></i>
                  การแจ้งเตือน
                </h3>
                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 flex items-center gap-1"
                >
                  <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                  {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
                </button>
              </div>
              {unreadCount > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {unreadCount} รายการยังไม่ได้อ่าน
                  </p>
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    ทำเครื่องหมายอ่านทั้งหมด
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-3"></i>
                  <p className="text-sm text-gray-500 dark:text-gray-400">กำลังโหลดการแจ้งเตือน...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`relative ${getNotificationColor(notif.type, notif.is_read)}`}
                    >
                      {notif.link ? (
                        <Link
                          to={notif.link}
                          onClick={() => handleNotificationClick(notif)}
                          className="block p-4 border-l-4"
                        >
                          <NotificationContent
                            notif={notif}
                            getNotificationIcon={getNotificationIcon}
                            getIconColor={getIconColor}
                            formatTimeAgo={formatTimeAgo}
                          />
                        </Link>
                      ) : (
                        <div
                          onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                          className="p-4 border-l-4 cursor-pointer"
                        >
                          <NotificationContent
                            notif={notif}
                            getNotificationIcon={getNotificationIcon}
                            getIconColor={getIconColor}
                            formatTimeAgo={formatTimeAgo}
                          />
                        </div>
                      )}
                      {!notif.is_read && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <i className="fas fa-check-circle text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">ไม่มีการแจ้งเตือน</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">คุณอ่านทุกอย่างแล้ว</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  ปิด
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Separate component for notification content
const NotificationContent = ({ notif, getNotificationIcon, getIconColor, formatTimeAgo }) => (
  <div className="flex items-start gap-3">
    <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center ${getIconColor(notif.type)}`}>
      <i className={`fas ${getNotificationIcon(notif.type)}`}></i>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {notif.title}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
        {notif.message}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
        <i className="far fa-clock"></i>
        {formatTimeAgo(notif.created_at)}
      </p>
    </div>
    {notif.link && (
      <i className="fas fa-chevron-right text-gray-400 dark:text-gray-500 flex-shrink-0"></i>
    )}
  </div>
);

export default NotificationDropdown;
