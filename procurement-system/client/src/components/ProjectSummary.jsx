import { useMemo } from 'react';

const ProjectSummary = ({ projects, onFilterChange }) => {
  // คำนวณสรุปต่างๆ
  const summary = useMemo(() => {
    if (!projects || projects.length === 0) {
      return {
        total: 0,
        byStatus: {},
        byMethod: {},
        byDepartment: {},
        totalBudget: 0
      };
    }

    const byStatus = {};
    const byMethod = {};
    const byDepartment = {};
    let totalBudget = 0;

    projects.forEach(project => {
      // Group by status
      byStatus[project.status] = (byStatus[project.status] || 0) + 1;

      // Group by procurement method
      byMethod[project.procurement_method] = (byMethod[project.procurement_method] || 0) + 1;

      // Group by department
      const deptName = project.department_name || 'ไม่ระบุ';
      byDepartment[deptName] = (byDepartment[deptName] || 0) + 1;

      // Sum budget
      totalBudget += parseFloat(project.budget || 0);
    });

    return {
      total: projects.length,
      byStatus,
      byMethod,
      byDepartment,
      totalBudget
    };
  }, [projects]);

  const statusLabels = {
    draft: 'ร่าง',
    in_progress: 'ดำเนินการ',
    completed: 'เสร็จสิ้น',
    delayed: 'ล่าช้า',
    cancelled: 'ยกเลิก',
    on_hold: 'พักการดำเนินการ'
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
    public_invitation: 'ประกาศเชิญชวน (e-bidding)',
    selection: 'คัดเลือก',
    specific: 'เฉพาะเจาะจง'
  };

  const methodColors = {
    public_invitation: 'bg-purple-500',
    selection: 'bg-indigo-500',
    specific: 'bg-pink-500'
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          📈 สรุปโครงการทั้งหมด
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          รวมทั้งสิ้น {summary.total} โครงการ | งบประมาณรวม {summary.totalBudget.toLocaleString()} บาท
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* สรุปตามสถานะ */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>📊</span>
            <span>จำแนกตามสถานะ</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(summary.byStatus).map(([status, count]) => (
              <button
                key={status}
                onClick={() => onFilterChange('status', status)}
                className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all hover:shadow-md"
              >
                <div className="p-4 text-center">
                  <div className={`w-10 h-10 ${statusColors[status]} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                    {count}
                  </div>
                  <p className="text-xs font-medium text-gray-700">
                    {statusLabels[status]}
                  </p>
                </div>
                <div className={`absolute inset-x-0 bottom-0 h-1 ${statusColors[status]} transform scale-x-0 group-hover:scale-x-100 transition-transform`} />
              </button>
            ))}
          </div>
        </div>

        {/* สรุปตามวิธีจัดซื้อ */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🛒</span>
            <span>จำแนกตามวิธีจัดซื้อจัดจ้าง</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(summary.byMethod).map(([method, count]) => (
              <button
                key={method}
                onClick={() => onFilterChange('procurementMethod', method)}
                className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all hover:shadow-md"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {methodLabels[method]}
                    </span>
                    <div className={`w-12 h-12 ${methodColors[method]} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                      {count}
                    </div>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${methodColors[method]} h-2 rounded-full transition-all`}
                      style={{ width: `${(count / summary.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {((count / summary.total) * 100).toFixed(1)}% ของทั้งหมด
                  </p>
                </div>
                <div className={`absolute inset-x-0 bottom-0 h-1 ${methodColors[method]} transform scale-x-0 group-hover:scale-x-100 transition-transform`} />
              </button>
            ))}
          </div>
        </div>

        {/* สรุปตามหน่วยงาน */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🏢</span>
            <span>จำแนกตามหน่วยงาน</span>
          </h4>
          <div className="space-y-2">
            {Object.entries(summary.byDepartment)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 7)
              .map(([dept, count]) => (
                <div key={dept} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{dept}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-200 rounded-full h-2 w-24">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / summary.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Reset Filter Button */}
        <div className="pt-4 border-t">
          <button
            onClick={() => onFilterChange('reset', null)}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            ล้างตัวกรอง - แสดงทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummary;
