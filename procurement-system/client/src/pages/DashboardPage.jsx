import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, stepsAPI } from '../services/api';
import Layout from '../components/Layout';
import GanttChart from '../components/GanttChart';
import ProjectSummary from '../components/ProjectSummary';
import ReportExportModal from '../components/ReportExportModal';

// Initialize Lucide icons after component renders
const initIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]); // For Gantt chart
  const [filteredProjects, setFilteredProjects] = useState([]); // For filtered display
  const [overdueSteps, setOverdueSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    status: null,
    procurementMethod: null
  });
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Apply filters when allProjects or activeFilters change
  useEffect(() => {
    applyFilters();
  }, [allProjects, activeFilters]);

  // Initialize Lucide icons when stats update
  useEffect(() => {
    initIcons();
  }, [stats, recentProjects, overdueSteps]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, projectsRes, allProjectsRes, overdueRes] = await Promise.all([
        projectsAPI.getStats(),
        projectsAPI.getAll({ limit: 5 }),
        projectsAPI.getAll(), // Get all projects for Gantt chart
        stepsAPI.getOverdue({ limit: 5 })
      ]);

      setStats(statsRes.data.data);
      setRecentProjects(projectsRes.data.data);
      setAllProjects(allProjectsRes.data.data);
      setOverdueSteps(overdueRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProjects];

    if (activeFilters.status) {
      filtered = filtered.filter(p => p.status === activeFilters.status);
    }

    if (activeFilters.procurementMethod) {
      filtered = filtered.filter(p => p.procurement_method === activeFilters.procurementMethod);
    }

    setFilteredProjects(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'reset') {
      setActiveFilters({ status: null, procurementMethod: null });
    } else {
      setActiveFilters(prev => ({
        ...prev,
        [filterType]: prev[filterType] === value ? null : value
      }));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-ios-gray-light text-ios-gray',
      in_progress: 'bg-ios-blue/10 text-ios-blue',
      completed: 'bg-ios-green/10 text-ios-green',
      delayed: 'bg-ios-red/10 text-ios-red',
      cancelled: 'bg-ios-gray-light text-ios-gray'
    };
    return colors[status] || 'bg-ios-gray-light text-ios-gray';
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
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-ios-gray-light border-t-ios-blue mx-auto"></div>
            <p className="mt-6 text-ios-gray font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* iOS Large Title Header with Export Button */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
            <p className="text-ios-gray font-medium mt-1">ภาพรวมระบบจัดซื้อจัดจ้าง</p>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-ios-green text-white rounded-full hover:bg-green-600 transition-all duration-200 shadow-ios active:scale-95 font-semibold border-2 border-ios-green"
          >
            <i data-lucide="download" className="w-5 h-5"></i>
            Export รายงาน
          </button>
        </div>

        {/* iOS Style Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Projects */}
            <div className="bg-white rounded-ios-xl shadow-ios p-6 hover:shadow-ios-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ios-gray font-medium">โครงการทั้งหมด</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalProjects || 0}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-700 rounded-ios-lg flex items-center justify-center shadow-ios">
                  <i data-lucide="folder" className="w-8 h-8 text-white"></i>
                </div>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-white rounded-ios-xl shadow-ios p-6 hover:shadow-ios-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ios-gray font-medium">กำลังดำเนินการ</p>
                  <p className="text-4xl font-bold text-ios-blue mt-2">{stats.inProgressProjects || 0}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-ios-blue to-ios-blue-dark rounded-ios-lg flex items-center justify-center shadow-ios">
                  <i data-lucide="loader" className="w-8 h-8 text-white"></i>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-ios-xl shadow-ios p-6 hover:shadow-ios-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ios-gray font-medium">เสร็จสิ้น</p>
                  <p className="text-4xl font-bold text-ios-green mt-2">{stats.completedProjects || 0}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-ios-green to-green-600 rounded-ios-lg flex items-center justify-center shadow-ios">
                  <i data-lucide="check-circle" className="w-8 h-8 text-white"></i>
                </div>
              </div>
            </div>

            {/* Delayed */}
            <div className="bg-white rounded-ios-xl shadow-ios p-6 hover:shadow-ios-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ios-gray font-medium">ล่าช้า</p>
                  <p className="text-4xl font-bold text-ios-red mt-2">{stats.delayedProjects || 0}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-ios-red to-red-600 rounded-ios-lg flex items-center justify-center shadow-ios">
                  <i data-lucide="alert-triangle" className="w-8 h-8 text-white"></i>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Summary with Filters */}
        <ProjectSummary
          projects={allProjects}
          onFilterChange={handleFilterChange}
        />

        {/* iOS Style Active Filters Display */}
        {(activeFilters.status || activeFilters.procurementMethod) && (
          <div className="bg-ios-blue/5 border border-ios-blue/20 rounded-ios-lg p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ios-blue/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-ios-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  แสดงผลตามตัวกรอง: {filteredProjects.length} โครงการ
                </span>
              </div>
              <button
                onClick={() => handleFilterChange('reset', null)}
                className="px-4 py-2 bg-ios-blue text-white rounded-full text-sm font-semibold hover:bg-ios-blue-dark transition-all active:scale-95"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        )}

        {/* Gantt Chart Timeline - แสดงตาม filter */}
        {(filteredProjects.length > 0 || allProjects.length > 0) && (
          <GanttChart projects={filteredProjects.length > 0 ? filteredProjects : allProjects} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* iOS Style Recent Projects */}
          <div className="bg-white rounded-ios-xl shadow-ios overflow-hidden">
            <div className="px-6 py-5 border-b border-ios-gray-light">
              <h3 className="text-xl font-bold text-gray-900">โครงการล่าสุด</h3>
            </div>
            <div className="p-6">
              {recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="block p-5 rounded-ios-lg bg-ios-gray-lighter hover:bg-ios-gray-light transition-all active:scale-98"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-base">{project.name}</p>
                          <p className="text-sm text-ios-gray mt-1 font-medium">{project.department_name}</p>
                          <p className="text-xs text-ios-gray mt-1">รหัส: {project.project_code}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-ios-gray font-medium gap-4">
                        <span>💰 {project.budget?.toLocaleString()} บาท</span>
                        {project.total_steps > 0 && (
                          <span>
                            📋 {project.completed_steps}/{project.total_steps}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  <Link
                    to="/projects"
                    className="block text-center text-ios-blue hover:text-ios-blue-dark text-sm font-semibold py-3 rounded-ios-lg hover:bg-ios-blue/5 transition-all"
                  >
                    ดูทั้งหมด →
                  </Link>
                </div>
              ) : (
                <p className="text-center text-ios-gray py-12 font-medium">ไม่มีข้อมูลโครงการ</p>
              )}
            </div>
          </div>

          {/* iOS Style Overdue Steps */}
          <div className="bg-white rounded-ios-xl shadow-ios overflow-hidden">
            <div className="px-6 py-5 border-b border-ios-gray-light">
              <h3 className="text-xl font-bold text-gray-900">ขั้นตอนที่ล่าช้า</h3>
            </div>
            <div className="p-6">
              {overdueSteps.length > 0 ? (
                <div className="space-y-3">
                  {overdueSteps.map((step) => (
                    <Link
                      key={step.id}
                      to={`/projects/${step.project_id}`}
                      className="block p-5 rounded-ios-lg bg-ios-red/5 border border-ios-red/20 hover:bg-ios-red/10 transition-all active:scale-98"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-base">{step.step_name}</p>
                          <p className="text-sm text-ios-gray mt-1 font-medium">{step.project_name}</p>
                          <p className="text-xs text-ios-gray mt-1">{step.department_name}</p>
                        </div>
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-ios-red text-white shadow-ios-card whitespace-nowrap ml-2">
                          ล่าช้า {step.days_overdue} วัน
                        </span>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to="/overdue"
                    className="block text-center text-ios-blue hover:text-ios-blue-dark text-sm font-semibold py-3 rounded-ios-lg hover:bg-ios-blue/5 transition-all"
                  >
                    ดูทั้งหมด →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">✅</div>
                  <p className="text-ios-gray font-medium">ไม่มีขั้นตอนล่าช้า</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Export Modal */}
      <ReportExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </Layout>
  );
};

export default DashboardPage;
