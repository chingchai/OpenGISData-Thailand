import { useMemo } from 'react';

const GanttChart = ({ projects }) => {
  // คำนวณช่วงเวลาทั้งหมด (min/max dates)
  const dateRange = useMemo(() => {
    if (!projects || projects.length === 0) return null;

    const dates = projects.flatMap(p => [
      new Date(p.start_date),
      new Date(p.expected_end_date || p.actual_end_date || p.start_date)
    ]);

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // เพิ่ม buffer 7 วันข้างหน้าและข้างหลัง
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    return { minDate, maxDate };
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
      width: `${(duration / totalDays) * 100}%`
    };
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
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'on_hold':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'เสร็จสิ้น';
      case 'in_progress':
        return 'กำลังดำเนินการ';
      case 'on_hold':
        return 'พักการดำเนินการ';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return 'รอดำเนินการ';
    }
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        ไม่มีข้อมูลโครงการ
      </div>
    );
  }

  const months = generateTimelineMonths();

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          📊 Timeline โครงการทั้งหมด
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          ภาพรวมความคืบหน้าโครงการ {projects.length} โครงการ
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Timeline Header */}
          <div className="flex border-b bg-gray-50">
            <div className="w-64 p-3 font-semibold text-gray-700 border-r">
              โครงการ
            </div>
            <div className="flex-1 relative">
              <div className="flex h-full">
                {months.map((month, index) => (
                  <div
                    key={index}
                    className="flex-1 p-3 text-center text-sm font-medium text-gray-600 border-r last:border-r-0"
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

              return (
                <div
                  key={project.id}
                  className={`flex border-b hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  {/* Project Info */}
                  <div className="w-64 p-3 border-r">
                    <div className="font-medium text-gray-900 text-sm truncate" title={project.name}>
                      {project.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full text-white ${statusColor}`}>
                        {getStatusText(project.status)}
                      </span>
                      <span className="text-xs text-gray-600">
                        {progressPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 relative p-3">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {months.map((_, idx) => (
                        <div
                          key={idx}
                          className="flex-1 border-r border-gray-200 last:border-r-0"
                        />
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-8">
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-6 ${statusColor} rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer group`}
                        style={{
                          left: barPosition.left,
                          width: barPosition.width,
                          minWidth: '8px'
                        }}
                      >
                        {/* Progress Fill */}
                        {progressPercent > 0 && (
                          <div
                            className="h-full bg-white bg-opacity-30 rounded"
                            style={{ width: `${progressPercent}%` }}
                          />
                        )}

                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            {new Date(project.start_date).toLocaleDateString('th-TH')} -{' '}
                            {new Date(endDate).toLocaleDateString('th-TH')}
                          </div>
                        </div>
                      </div>

                      {/* Today Line */}
                      {dateRange && (() => {
                        const today = new Date();
                        if (today >= dateRange.minDate && today <= dateRange.maxDate) {
                          const totalDays = (dateRange.maxDate - dateRange.minDate) / (1000 * 60 * 60 * 24);
                          const todayOffset = (today - dateRange.minDate) / (1000 * 60 * 60 * 24);
                          const todayPosition = `${(todayOffset / totalDays) * 100}%`;

                          return (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                              style={{ left: todayPosition }}
                              title="วันนี้"
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

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-gray-700">กำลังดำเนินการ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-gray-700">เสร็จสิ้น</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span className="text-gray-700">พักการดำเนินการ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-red-500" />
            <span className="text-gray-700">วันนี้</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
