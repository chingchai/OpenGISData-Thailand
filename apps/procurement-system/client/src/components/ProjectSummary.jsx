import { useMemo } from 'react';

const ProjectSummary = ({ projects, onFilterChange }) => {
  // คำนวณสรุปต่างๆ พร้อม metrics สำคัญสำหรับผู้บริหาร
  const summary = useMemo(() => {
    if (!projects || projects.length === 0) {
      return {
        total: 0,
        byStatus: {},
        byMethod: {},
        byDepartment: {},
        totalBudget: 0,
        completedBudget: 0,
        inProgressBudget: 0,
        avgProgress: 0,
        onTimeProjects: 0,
        delayedProjects: 0
      };
    }

    const byStatus = {};
    const byMethod = {};
    const byDepartment = {};
    let totalBudget = 0;
    let completedBudget = 0;
    let inProgressBudget = 0;
    let totalProgress = 0;
    let onTimeProjects = 0;
    let delayedProjects = 0;

    const today = new Date();

    projects.forEach(project => {
      const budget = parseFloat(project.budget || 0);

      // Group by status
      byStatus[project.status] = (byStatus[project.status] || 0) + 1;

      // Group by procurement method
      byMethod[project.procurement_method] = (byMethod[project.procurement_method] || 0) + 1;

      // Group by department
      const deptName = project.department_name || 'ไม่ระบุ';
      if (!byDepartment[deptName]) {
        byDepartment[deptName] = {
          count: 0,
          budget: 0,
          completed: 0,
          inProgress: 0,
          delayed: 0
        };
      }
      byDepartment[deptName].count++;
      byDepartment[deptName].budget += budget;

      if (project.status === 'completed') {
        byDepartment[deptName].completed++;
        completedBudget += budget;
      } else if (project.status === 'in_progress') {
        byDepartment[deptName].inProgress++;
        inProgressBudget += budget;
      }

      if (project.status === 'delayed') {
        byDepartment[deptName].delayed++;
        delayedProjects++;
      }

      // Sum budget
      totalBudget += budget;

      // Calculate average progress
      totalProgress += (project.progress_percentage || 0);

      // Check if on time
      const endDate = new Date(project.expected_end_date || project.actual_end_date || project.start_date);
      if (project.status === 'completed' || (project.status === 'in_progress' && endDate >= today)) {
        onTimeProjects++;
      }
    });

    const avgProgress = projects.length > 0 ? (totalProgress / projects.length).toFixed(1) : 0;

    return {
      total: projects.length,
      byStatus,
      byMethod,
      byDepartment,
      totalBudget,
      completedBudget,
      inProgressBudget,
      avgProgress,
      onTimeProjects,
      delayedProjects,
      budgetUtilization: totalBudget > 0 ? ((completedBudget / totalBudget) * 100).toFixed(1) : 0
    };
  }, [projects]);

  const statusLabels = {
    draft: 'ร่าง',
    in_progress: 'ดำเนินการ',
    completed: 'เสร็จสิ้น',
    delayed: 'ล่าช้า',
    cancelled: 'ยกเลิก',
    on_hold: 'พักดำเนินการ'
  };

  const statusColors = {
    draft: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
    delayed: 'bg-red-500',
    cancelled: 'bg-gray-400',
    on_hold: 'bg-yellow-500'
  };

  const methodLabels = {
    public_invitation: 'ประกาศเชิญชวน',
    selection: 'คัดเลือก',
    specific: 'เฉพาะเจาะจง'
  };

  const methodColors = {
    public_invitation: 'bg-purple-500',
    selection: 'bg-indigo-500',
    specific: 'bg-pink-500'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <i className="fas fa-chart-bar text-green-500"></i>
          สรุปภาพรวมโครงการ
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          ข้อมูลสำคัญสำหรับผู้บริหาร - รวม {summary.total} โครงการ
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Budget */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">งบประมาณรวม</span>
              <i className="fas fa-coins text-blue-500 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {(summary.totalBudget / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">ล้านบาท</div>
          </div>

          {/* Completed Budget */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">งบที่ใช้แล้ว</span>
              <i className="fas fa-check-circle text-green-500 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {(summary.completedBudget / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              {summary.budgetUtilization}% ของทั้งหมด
            </div>
          </div>

          {/* Average Progress */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">ความคืบหน้าเฉลี่ย</span>
              <i className="fas fa-tasks text-purple-500 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {summary.avgProgress}%
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">ของโครงการทั้งหมด</div>
          </div>

          {/* On-Time Projects */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">ตรงเวลา</span>
              <i className="fas fa-clock text-indigo-500 text-xl"></i>
            </div>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {summary.onTimeProjects}/{summary.total}
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
              {summary.total > 0 ? ((summary.onTimeProjects / summary.total) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <i className="fas fa-chart-pie text-blue-500"></i>
            การจำแนกตามสถานะ
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(summary.byStatus).map(([status, count]) => {
              const percentage = ((count / summary.total) * 100).toFixed(1);
              return (
                <button
                  key={status}
                  onClick={() => onFilterChange('status', status)}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="p-4 text-center">
                    <div className={`w-14 h-14 ${statusColors[status]} rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                      {count}
                    </div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {statusLabels[status]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</p>
                  </div>
                  <div className={`absolute inset-x-0 bottom-0 h-1 ${statusColors[status]} transform scale-x-0 group-hover:scale-x-100 transition-transform`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Procurement Method Distribution */}
        <div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <i className="fas fa-gavel text-purple-500"></i>
            การจำแนกตามวิธีจัดซื้อจัดจ้าง
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(summary.byMethod).map(([method, count]) => {
              const percentage = ((count / summary.total) * 100).toFixed(1);
              return (
                <button
                  key={method}
                  onClick={() => onFilterChange('procurementMethod', method)}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg bg-white dark:bg-gray-750"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {methodLabels[method]}
                      </span>
                      <div className={`w-14 h-14 ${methodColors[method]} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                        {count}
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                        <div
                          className={`${methodColors[method]} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{percentage}% ของทั้งหมด</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{count} โครงการ</span>
                      </div>
                    </div>
                  </div>
                  <div className={`absolute inset-x-0 bottom-0 h-1 ${methodColors[method]} transform scale-x-0 group-hover:scale-x-100 transition-transform`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Department Performance */}
        <div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <i className="fas fa-building text-indigo-500"></i>
            ผลการดำเนินงานตามหน่วยงาน
          </h4>
          <div className="space-y-3">
            {Object.entries(summary.byDepartment)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 7)
              .map(([dept, data]) => {
                const percentage = ((data.count / summary.total) * 100).toFixed(1);
                const completionRate = data.count > 0 ? ((data.completed / data.count) * 100).toFixed(1) : 0;

                return (
                  <div
                    key={dept}
                    className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white">{dept}</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {data.count} โครงการ • {(data.budget / 1000000).toFixed(2)} ล้านบาท
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{percentage}%</div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          เสร็จ {completionRate}%
                        </div>
                      </div>
                    </div>

                    {/* Multi-progress Bar */}
                    <div className="flex h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      {data.completed > 0 && (
                        <div
                          className="bg-green-500 flex items-center justify-center text-white text-xs"
                          style={{ width: `${(data.completed / data.count) * 100}%` }}
                          title={`เสร็จสิ้น: ${data.completed}`}
                        />
                      )}
                      {data.inProgress > 0 && (
                        <div
                          className="bg-blue-500 flex items-center justify-center text-white text-xs"
                          style={{ width: `${(data.inProgress / data.count) * 100}%` }}
                          title={`ดำเนินการ: ${data.inProgress}`}
                        />
                      )}
                      {data.delayed > 0 && (
                        <div
                          className="bg-red-500 flex items-center justify-center text-white text-xs"
                          style={{ width: `${(data.delayed / data.count) * 100}%` }}
                          title={`ล่าช้า: ${data.delayed}`}
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <i className="fas fa-check-circle"></i>
                        {data.completed} เสร็จ
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <i className="fas fa-spinner"></i>
                        {data.inProgress} ดำเนินการ
                      </span>
                      {data.delayed > 0 && (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <i className="fas fa-exclamation-triangle"></i>
                          {data.delayed} ล่าช้า
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Reset Filter Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onFilterChange('reset', null)}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            ล้างตัวกรอง - แสดงทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummary;
