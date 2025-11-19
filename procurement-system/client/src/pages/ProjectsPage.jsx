import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import Layout from '../components/Layout';
import CreateProjectModal from '../components/CreateProjectModal';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    departmentId: '',
    procurementMethod: ''
  });

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.procurementMethod) params.procurementMethod = filters.procurementMethod;

      const response = await projectsAPI.getAll(params);
      setProjects(response.data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    // Refresh projects list
    fetchProjects();
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

  const getMethodText = (method) => {
    const texts = {
      public_invitation: 'e-bidding',
      selection: 'คัดเลือก',
      specific: 'เฉพาะเจาะจง'
    };
    return texts[method] || method;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">โครงการทั้งหมด</h2>
            <p className="text-gray-600">จัดการและติดตามโครงการจัดซื้อจัดจ้าง</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">เพิ่มโครงการ</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สถานะ
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                <option value="draft">ร่าง</option>
                <option value="in_progress">ดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="delayed">ล่าช้า</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วิธีจัดซื้อ
              </label>
              <select
                value={filters.procurementMethod}
                onChange={(e) => setFilters({ ...filters, procurementMethod: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                <option value="public_invitation">e-bidding</option>
                <option value="selection">คัดเลือก</option>
                <option value="specific">เฉพาะเจาะจง</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', departmentId: '', procurementMethod: '' })}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : projects.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {project.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <p>รหัสโครงการ: {project.project_code}</p>
                        <p>หน่วยงาน: {project.department_name}</p>
                        <p>วิธีจัดซื้อ: {getMethodText(project.procurement_method)}</p>
                        {project.description && (
                          <p className="text-gray-500">{project.description}</p>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700">งบประมาณ:</span>
                          <span className="ml-2 text-blue-600 font-semibold">
                            {project.budget?.toLocaleString()} บาท
                          </span>
                        </div>

                        {project.total_steps > 0 && (
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700">ความคืบหน้า:</span>
                            <span className="ml-2">
                              {project.completed_steps}/{project.total_steps} ขั้นตอน
                            </span>
                            {project.overdue_steps > 0 && (
                              <span className="ml-2 text-red-600">
                                (ล่าช้า {project.overdue_steps})
                              </span>
                            )}
                          </div>
                        )}

                        {project.start_date && (
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700">วันที่เริ่ม:</span>
                            <span className="ml-2">{new Date(project.start_date).toLocaleDateString('th-TH')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-6">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">ไม่พบโครงการที่ตรงกับเงื่อนไข</p>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Layout>
  );
};

export default ProjectsPage;
