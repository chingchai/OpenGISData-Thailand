import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, stepsAPI } from '../services/api';
import Layout from '../components/Layout';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [overdueSteps, setOverdueSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, projectsRes, overdueRes] = await Promise.all([
        projectsAPI.getStats(),
        projectsAPI.getAll({ limit: 5 }),
        stepsAPI.getOverdue({ limit: 5 })
      ]);

      setStats(statsRes.data.data);
      setRecentProjects(projectsRes.data.data);
      setOverdueSteps(overdueRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      delayed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'ร่าง',
      in_progress: 'ดำเนินการ',
      completed: 'เสร็จสิ้น',
      delayed: 'ล่าช้า',
      cancelled: 'ยกเลิก'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-600">ภาพรวมระบบจัดซื้อจัดจ้าง</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Projects */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">โครงการทั้งหมด</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalProjects || 0}</p>
                </div>
                <div className="text-4xl">📁</div>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">กำลังดำเนินการ</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.inProgressProjects || 0}</p>
                </div>
                <div className="text-4xl">🔄</div>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">เสร็จสิ้น</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedProjects || 0}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            {/* Delayed */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ล่าช้า</p>
                  <p className="text-3xl font-bold text-red-600">{stats.delayedProjects || 0}</p>
                </div>
                <div className="text-4xl">⚠️</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">โครงการล่าสุด</h3>
            </div>
            <div className="p-6">
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{project.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{project.department_name}</p>
                          <p className="text-xs text-gray-500 mt-1">รหัส: {project.project_code}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <span>งบประมาณ: {project.budget?.toLocaleString()} บาท</span>
                        {project.total_steps > 0 && (
                          <span className="ml-4">
                            ขั้นตอน: {project.completed_steps}/{project.total_steps}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  <Link
                    to="/projects"
                    className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ดูทั้งหมด →
                  </Link>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">ไม่มีข้อมูลโครงการ</p>
              )}
            </div>
          </div>

          {/* Overdue Steps */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">ขั้นตอนที่ล่าช้า</h3>
            </div>
            <div className="p-6">
              {overdueSteps.length > 0 ? (
                <div className="space-y-4">
                  {overdueSteps.map((step) => (
                    <Link
                      key={step.id}
                      to={`/projects/${step.project_id}`}
                      className="block p-4 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{step.step_name}</p>
                          <p className="text-sm text-gray-600 mt-1">{step.project_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{step.department_name}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ล่าช้า {step.days_overdue} วัน
                        </span>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to="/overdue"
                    className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ดูทั้งหมด →
                  </Link>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">ไม่มีขั้นตอนล่าช้า</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
