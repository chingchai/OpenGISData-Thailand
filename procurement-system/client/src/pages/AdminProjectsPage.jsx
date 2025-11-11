import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI } from '../services/api';
import Layout from '../components/Layout';
import ProjectFormModal from '../components/ProjectFormModal';
import ExcelUploadModal from '../components/ExcelUploadModal';

const AdminProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState({
    status: '',
    department: '',
    method: ''
  });

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch projects and departments
  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch projects
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.department) params.departmentId = filter.department;
      if (filter.method) params.procurementMethod = filter.method;

      const projectsRes = await projectsAPI.getAll(params);
      setProjects(projectsRes.data.projects || projectsRes.data || []);

      // Fetch departments (from first project or make separate API call)
      const uniqueDepts = [...new Map(
        (projectsRes.data.projects || projectsRes.data || [])
          .filter(p => p.department_name)
          .map(p => [p.department_id, { id: p.department_id, name: p.department_name }])
      ).values()];

      // Add hardcoded departments for form
      setDepartments([
        { id: 1, name: 'กองคลัง' },
        { id: 2, name: 'กองช่าง' },
        { id: 3, name: 'กองการศึกษา' },
        { id: 4, name: 'กองสาธารณสุขและสิ่งแวดล้อม' },
        { id: 5, name: 'สำนักปลัด' },
        { id: 6, name: 'กองวิชาการและแผนงาน' },
        { id: 7, name: 'กองธุรการ' }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`คุณต้องการลบโครงการ "${project.name}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      await projectsAPI.delete(project.id);
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('เกิดข้อผิดพลาดในการลบโครงการ');
    }
  };

  const handleModalSuccess = () => {
    fetchData(); // Refresh list
  };

  const handleExcelSuccess = (summary) => {
    alert(`นำเข้าสำเร็จ!\n\nนำเข้า: ${summary.imported} โครงการ\nอัปเดต: ${summary.updated} โครงการ\nข้าม: ${summary.skipped} โครงการ`);
    fetchData(); // Refresh list
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'ร่าง', color: 'bg-gray-100 text-gray-700' },
      in_progress: { label: 'กำลังดำเนินการ', color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'เสร็จสิ้น', color: 'bg-green-100 text-green-700' },
      delayed: { label: 'ล่าช้า', color: 'bg-red-100 text-red-700' },
      cancelled: { label: 'ยกเลิก', color: 'bg-gray-100 text-gray-500' },
      on_hold: { label: 'พักการดำเนินการ', color: 'bg-yellow-100 text-yellow-700' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getMethodBadge = (method) => {
    const methodConfig = {
      public_invitation: { label: 'ประกาศเชิญชวน', color: 'bg-purple-100 text-purple-700' },
      selection: { label: 'คัดเลือก', color: 'bg-blue-100 text-blue-700' },
      specific: { label: 'เฉพาะเจาะจง', color: 'bg-green-100 text-green-700' }
    };
    const config = methodConfig[method] || methodConfig.specific;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">จัดการโครงการ</h1>
            <p className="text-gray-600 mt-1">สำหรับผู้ดูแลระบบ - จัดการโครงการทั้งหมด</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              นำเข้าจาก Excel
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              สร้างโครงการใหม่
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">กรองตามสถานะ</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                <option value="draft">ร่าง</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="delayed">ล่าช้า</option>
                <option value="cancelled">ยกเลิก</option>
                <option value="on_hold">พักการดำเนินการ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">กรองตามหน่วยงาน</label>
              <select
                value={filter.department}
                onChange={(e) => setFilter({ ...filter, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">กรองตามวิธีจัดซื้อ</label>
              <select
                value={filter.method}
                onChange={(e) => setFilter({ ...filter, method: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                <option value="public_invitation">ประกาศเชิญชวน</option>
                <option value="selection">คัดเลือก</option>
                <option value="specific">เฉพาะเจาะจง</option>
              </select>
            </div>
          </div>

          {(filter.status || filter.department || filter.method) && (
            <button
              onClick={() => setFilter({ status: '', department: '', method: '' })}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-gray-500 text-lg">ไม่พบโครงการ</p>
              <button
                onClick={handleCreate}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                สร้างโครงการใหม่
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รหัส
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อโครงการ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      หน่วยงาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วิธีจัดซื้อ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      งบประมาณ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ระยะเวลา
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {project.project_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          <div className="font-medium">{project.name}</div>
                          {project.description && (
                            <div className="text-gray-500 text-xs mt-1 line-clamp-2">
                              {project.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {project.department_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getMethodBadge(project.procurement_method)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(project.budget)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(project.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="text-xs">
                          <div>{formatDate(project.start_date)}</div>
                          <div className="text-gray-400">ถึง</div>
                          <div>{formatDate(project.expected_end_date)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(project)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"
                            title="แก้ไข"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(project)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                            title="ลบ"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {!loading && projects.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  แสดง {projects.length} โครงการ
                </span>
                <span className="text-gray-600">
                  งบประมาณรวม: {formatCurrency(projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Project Form Modal */}
        <ProjectFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          project={selectedProject}
          departments={departments}
        />

        {/* Excel Upload Modal */}
        <ExcelUploadModal
          isOpen={isExcelModalOpen}
          onClose={() => setIsExcelModalOpen(false)}
          onSuccess={handleExcelSuccess}
        />
      </div>
    </Layout>
  );
};

export default AdminProjectsPage;
