import { useMemo, useState } from 'react';

const GanttChart = ({ projects }) => {
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'list'
  const [expandedProjects, setExpandedProjects] = useState(new Set());

  // คำนวณช่วงเวลาทั้งหมด (min/max dates)
  const dateRange = useMemo(() => {
    if (!projects || projects.length === 0) return null;

    try {
      const dates = projects.flatMap(p => {
        const startDate = new Date(p.start_date);
        const endDate = new Date(p.expected_end_date || p.actual_end_date || p.start_date);
        return [startDate, endDate];
      });

      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));

      // เพิ่ม buffer 7 วันข้างหน้าและข้างหลัง
      minDate.setDate(minDate.getDate() - 7);
      maxDate.setDate(maxDate.getDate() + 7);

      return { minDate, maxDate };
    } catch (error) {
      console.error('Error calculating date range:', error);
      return null;
    }
  }, [projects]);

  // คำนวณ position และ width ของแต่ละโครงการ
  const calculateBar = (startDate, endDate) => {
    if (!dateRange) return { left: 0, width: 0 };

    const { minDate, maxDate } = dateRange;
    const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
    const startOffset = (new Date(startDate) - minDate) / (1000 * 60 * 60 * 24);
    const duration = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${Math.max((duration / totalDays) * 100, 1)}%`
    };
  };

  // คำนวณจำนวนวันคงเหลือ
  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // สร้าง timeline header (เดือน)
  const generateTimelineMonths = () => {
    if (!dateRange) return [];

    const { minDate, maxDate } = dateRange;
    const months = [];
    const current = new Date(minDate);

    while (current <= maxDate) {
      months.push({
        label: current.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }),
        date: new Date(current)
      });
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  // กำหนดสีตามสถานะ
  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-500',
      in_progress: 'bg-blue-500',
      on_hold: 'bg-yellow-500',
      cancelled: 'bg-gray-400',
      delayed: 'bg-red-500',
      draft: 'bg-gray-300'
    };
    return colors[status] || 'bg-gray-300';
  };

  const getStatusText = (status) => {
    const texts = {
      completed: 'เสร็จสิ้น',
      in_progress: 'กำลังดำเนินการ',
      on_hold: 'พักดำเนินการ',
      cancelled: 'ยกเลิก',
      delayed: 'ล่าช้า',
      draft: 'ร่าง'
    };
    return texts[status] || 'ไม่ระบุ';
  };

  const toggleExpand = (projectId) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-12">
          <i className="fas fa-chart-gantt text-gray-400 dark:text-gray-600 text-5xl mb-4"></i>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">ไม่มีข้อมูลโครงการสำหรับแสดง Gantt Chart</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">กรุณาเพิ่มโครงการเพื่อดู timeline</p>
        </div>
      </div>
    );
  }

  if (!dateRange) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-12">
          <i className="fas fa-exclamation-triangle text-red-400 text-5xl mb-4"></i>
          <p className="text-red-500 text-lg font-medium">ไม่สามารถคำนวณช่วงเวลาได้</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">โครงการอาจขาดข้อมูลวันที่</p>
        </div>
      </div>
    );
  }

  const months = generateTimelineMonths();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-chart-gantt text-purple-500"></i>
              Timeline โครงการทั้งหมด
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              ภาพรวมความคืบหน้า {projects.length} โครงการ
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <i className="fas fa-chart-bar mr-2"></i>
              Timeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <i className="fas fa-list mr-2"></i>
              รายการ
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Timeline Header */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="w-80 lg:w-96 p-4 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                โครงการ
              </div>
              <div className="flex-1 relative">
                <div className="flex h-full">
                  {months.map((month, index) => (
                    <div
                      key={index}
                      className="flex-1 p-4 text-center text-sm font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                    >
                      {month.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gantt Rows */}
            <div>
              {projects.map((project, index) => {
                const endDate = project.expected_end_date || project.actual_end_date || project.start_date;
                const barPosition = calculateBar(project.start_date, endDate);
                const statusColor = getStatusColor(project.status);
                const progressPercent = project.progress_percentage || 0;
                const daysRemaining = getDaysRemaining(endDate);
                const isExpanded = expandedProjects.has(project.id);

                return (
                  <div
                    key={project.id}
                    className={`flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                    }`}
                  >
                    {/* Project Info */}
                    <div className="w-80 lg:w-96 p-4 border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleExpand(project.id)}
                          className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-xs`}></i>
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate" title={project.name}>
                            {project.name}
                          </h4>

                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`px-2 py-1 text-xs rounded-full text-white ${statusColor} font-medium`}>
                              {getStatusText(project.status)}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-medium">
                              {progressPercent}%
                            </span>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <i className="fas fa-building w-4"></i>
                                <span>{project.department_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <i className="fas fa-coins w-4"></i>
                                <span>{project.budget?.toLocaleString()} บาท</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <i className="fas fa-calendar w-4"></i>
                                <span>
                                  {new Date(project.start_date).toLocaleDateString('th-TH', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: '2-digit'
                                  })}
                                  {' → '}
                                  {new Date(endDate).toLocaleDateString('th-TH', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: '2-digit'
                                  })}
                                </span>
                              </div>
                              {daysRemaining > 0 && (
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                  <i className="fas fa-clock w-4"></i>
                                  <span>เหลืออีก {daysRemaining} วัน</span>
                                </div>
                              )}
                              {daysRemaining < 0 && project.status !== 'completed' && (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                  <i className="fas fa-exclamation-triangle w-4"></i>
                                  <span>เกินกำหนด {Math.abs(daysRemaining)} วัน</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Bar */}
                    <div className="flex-1 relative p-4">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {months.map((_, idx) => (
                          <div
                            key={idx}
                            className="flex-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                          />
                        ))}
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-10 flex items-center">
                        <div
                          className={`absolute h-8 ${statusColor} rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group`}
                          style={{
                            left: barPosition.left,
                            width: barPosition.width,
                            minWidth: '20px'
                          }}
                        >
                          {/* Progress Fill */}
                          <div className="relative h-full overflow-hidden rounded-lg">
                            {progressPercent > 0 && (
                              <div
                                className="h-full bg-white/30 transition-all"
                                style={{ width: `${progressPercent}%` }}
                              />
                            )}

                            {/* Progress Text */}
                            {barPosition.width && parseFloat(barPosition.width) > 5 && (
                              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                                {progressPercent}%
                              </span>
                            )}
                          </div>

                          {/* Tooltip on Hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                            <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                              <div className="font-semibold mb-1">{project.name}</div>
                              <div>เริ่ม: {new Date(project.start_date).toLocaleDateString('th-TH')}</div>
                              <div>สิ้นสุด: {new Date(endDate).toLocaleDateString('th-TH')}</div>
                              <div>ความคืบหน้า: {progressPercent}%</div>
                              {daysRemaining > 0 && <div className="text-blue-300">เหลืออีก {daysRemaining} วัน</div>}
                              {daysRemaining < 0 && <div className="text-red-300">เกินกำหนด {Math.abs(daysRemaining)} วัน</div>}
                            </div>
                          </div>
                        </div>

                        {/* Today Line */}
                        {(() => {
                          const today = new Date();
                          if (today >= dateRange.minDate && today <= dateRange.maxDate) {
                            const totalDays = (dateRange.maxDate - dateRange.minDate) / (1000 * 60 * 60 * 24);
                            const todayOffset = (today - dateRange.minDate) / (1000 * 60 * 60 * 24);
                            const todayPosition = `${(todayOffset / totalDays) * 100}%`;

                            return (
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                                style={{ left: todayPosition }}
                              >
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="p-6 space-y-4">
          {projects.map((project) => {
            const endDate = project.expected_end_date || project.actual_end_date || project.start_date;
            const statusColor = getStatusColor(project.status);
            const progressPercent = project.progress_percentage || 0;
            const daysRemaining = getDaysRemaining(endDate);

            return (
              <div
                key={project.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 hover:shadow-md transition-all border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-2">
                      {project.name}
                    </h4>
                    <div className="flex items-center gap-3 flex-wrap text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-building"></i>
                        {project.department_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-coins"></i>
                        {project.budget?.toLocaleString()} บาท
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 text-xs rounded-full text-white ${statusColor} font-semibold whitespace-nowrap`}>
                    {getStatusText(project.status)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">ความคืบหน้า</span>
                    <span className="text-gray-900 dark:text-white font-bold">{progressPercent}%</span>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${statusColor} transition-all duration-500`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Timeline Info */}
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span>
                      เริ่ม: {new Date(project.start_date).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span>
                      สิ้นสุด: {new Date(endDate).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {daysRemaining > 0 && (
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      เหลืออีก {daysRemaining} วัน
                    </span>
                  )}
                  {daysRemaining < 0 && project.status !== 'completed' && (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      เกินกำหนด {Math.abs(daysRemaining)} วัน
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">กำลังดำเนินการ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">เสร็จสิ้น</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">พักดำเนินการ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">ล่าช้า</span>
          </div>
          {viewMode === 'timeline' && (
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-4 bg-red-500"></div>
              <span className="text-gray-700 dark:text-gray-300">วันนี้</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
