import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../services/api';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      const projects = response.data.data;

      const now = new Date();
      const notifs = [];

      projects.forEach(project => {
        if (!project.expected_end_date || project.status === 'completed' || project.status === 'cancelled') {
          return;
        }

        const endDate = new Date(project.expected_end_date);
        const daysUntilDeadline = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        // Overdue projects (เกินกำหนด)
        if (daysUntilDeadline < 0) {
          notifs.push({
            id: `overdue-${project.id}`,
            projectId: project.id,
            projectName: project.name,
            type: 'overdue',
            priority: 'high',
            message: `เกินกำหนด ${Math.abs(daysUntilDeadline)} วัน`,
            daysOverdue: Math.abs(daysUntilDeadline),
            timestamp: endDate
          });
        }
        // Approaching deadline - 7 days (ใกล้ถึงกำหนด)
        else if (daysUntilDeadline >= 0 && daysUntilDeadline <= 7) {
          notifs.push({
            id: `approaching-${project.id}`,
            projectId: project.id,
            projectName: project.name,
            type: 'approaching',
            priority: daysUntilDeadline <= 3 ? 'medium' : 'low',
            message: `เหลืออีก ${daysUntilDeadline} วัน`,
            daysRemaining: daysUntilDeadline,
            timestamp: endDate
          });
        }
        // Warning - 14 days (เตือนล่วงหน้า)
        else if (daysUntilDeadline > 7 && daysUntilDeadline <= 14) {
          notifs.push({
            id: `warning-${project.id}`,
            projectId: project.id,
            projectName: project.name,
            type: 'warning',
            priority: 'low',
            message: `ครบกำหนดในอีก ${daysUntilDeadline} วัน`,
            daysRemaining: daysUntilDeadline,
            timestamp: endDate
          });
        }
      });

      // Sort by priority and date
      notifs.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.timestamp) - new Date(b.timestamp);
      });

      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => n.type === 'overdue').length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'overdue':
        return '🔴';
      case 'approaching':
        return '⚠️';
      case 'warning':
        return '🔔';
      default:
        return '📌';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'overdue':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'approaching':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'warning':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
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
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[500px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  การแจ้งเตือน
                </h3>
                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
                </button>
              </div>
              {notifications.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  มี {notifications.length} รายการที่ต้องติดตาม
                </p>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">กำลังโหลด...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      to={`/projects/${notif.projectId}`}
                      onClick={() => setIsOpen(false)}
                      className={`block p-4 border-l-4 transition-colors ${getNotificationColor(notif.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getNotificationIcon(notif.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notif.projectName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            กำหนดเสร็จ: {new Date(notif.timestamp).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-4 text-gray-500">ไม่มีการแจ้งเตือน</p>
                  <p className="text-sm text-gray-400 mt-1">โครงการทั้งหมดเป็นไปตามแผน</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <Link
                  to="/projects"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  ดูโครงการทั้งหมด →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
