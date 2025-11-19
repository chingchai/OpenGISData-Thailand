import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, stepsAPI } from '../services/api';
import Layout from '../components/Layout';
import GanttChart from '../components/GanttChart';
import ProjectSummary from '../components/ProjectSummary';
import ReportExportModal from '../components/ReportExportModal';
import {
  StatusPieChart,
  ProcurementMethodChart,
  DepartmentChart,
  BudgetRangeChart,
  MonthlyTrendChart,
  SummaryCard
} from '../components/DashboardCharts';

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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">ภาพรวมระบบจัดซื้อจัดจ้าง</p>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 shadow-sm font-semibold"
          >
            <i className="fas fa-download"></i>
            Export รายงาน
          </button>
        </div>

        {/* Summary Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            <SummaryCard
              title="โครงการทั้งหมด"
              value={stats.totalProjects || 0}
              icon="folder"
              color="gray"
            />
            <SummaryCard
              title="กำลังดำเนินการ"
              value={stats.inProgressProjects || 0}
              icon="spinner"
              color="blue"
            />
            <SummaryCard
              title="เสร็จสิ้น"
              value={stats.completedProjects || 0}
              icon="check-circle"
              color="green"
              subtitle={`อัตราความสำเร็จ ${stats.completionRate}%`}
            />
            <SummaryCard
              title="ล่าช้า"
              value={stats.delayedProjects || 0}
              icon="exclamation-triangle"
              color="red"
            />
            <SummaryCard
              title="งบประมาณรวม"
              value={`${(stats.total_budget / 1000000).toFixed(1)}M`}
              icon="coins"
              color="yellow"
              subtitle="ล้านบาท"
            />
          </div>
        )}

        {/* Charts Grid */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="fas fa-chart-pie text-blue-500"></i>
                การกระจายตามสถานะ
              </h3>
              <StatusPieChart stats={stats} />
            </div>

            {/* Procurement Method */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="fas fa-gavel text-green-500"></i>
                การกระจายตามวิธีจัดซื้อ
              </h3>
              <ProcurementMethodChart data={stats.by_method} />
            </div>

            {/* Department Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="fas fa-building text-purple-500"></i>
                การกระจายตามหน่วยงาน
              </h3>
              <DepartmentChart data={stats.by_department} />
            </div>

            {/* Budget Range */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="fas fa-money-bill-wave text-yellow-500"></i>
                การกระจายตามช่วงงบประมาณ
              </h3>
              <BudgetRangeChart data={stats.budget_ranges} />
            </div>
          </div>
        )}

        {/* Monthly Trend */}
        {stats && stats.monthly_trend && stats.monthly_trend.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <i className="fas fa-chart-line text-indigo-500"></i>
              แนวโน้มรายเดือน (6 เดือนล่าสุด)
            </h3>
            <MonthlyTrendChart data={stats.monthly_trend} />
          </div>
        )}

        {/* Project Summary with Filters */}
        <ProjectSummary
          projects={allProjects}
          onFilterChange={handleFilterChange}
        />

        {/* Active Filters Display */}
        {(activeFilters.status || activeFilters.procurementMethod) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-400/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-filter text-blue-500"></i>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  แสดงผลตามตัวกรอง: {filteredProjects.length} โครงการ
                </span>
              </div>
              <button
                onClick={() => handleFilterChange('reset', null)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        )}

        {/* Gantt Chart Timeline */}
        {(filteredProjects.length > 0 || allProjects.length > 0) && (
          <GanttChart projects={filteredProjects.length > 0 ? filteredProjects : allProjects} />
        )}

        {/* Recent Projects and Overdue Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">โครงการล่าสุด</h3>
            </div>
            <div className="p-6">
              {recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="block p-5 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-base">{project.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{project.department_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">รหัส: {project.project_code}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-medium gap-4">
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
                    className="block text-center text-blue-500 hover:text-blue-600 text-sm font-semibold py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    ดูทั้งหมด →
                  </Link>
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-12 font-medium">ไม่มีข้อมูลโครงการ</p>
              )}
            </div>
          </div>

          {/* Overdue Steps */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">ขั้นตอนที่ล่าช้า</h3>
            </div>
            <div className="p-6">
              {overdueSteps.length > 0 ? (
                <div className="space-y-3">
                  {overdueSteps.map((step) => (
                    <Link
                      key={step.id}
                      to={`/projects/${step.project_id}`}
                      className="block p-5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-base">{step.step_name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{step.project_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{step.department_name}</p>
                        </div>
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500 text-white shadow-sm whitespace-nowrap ml-2">
                          ล่าช้า {step.days_overdue} วัน
                        </span>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to="/overdue"
                    className="block text-center text-blue-500 hover:text-blue-600 text-sm font-semibold py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    ดูทั้งหมด →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">✅</div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">ไม่มีขั้นตอนล่าช้า</p>
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
