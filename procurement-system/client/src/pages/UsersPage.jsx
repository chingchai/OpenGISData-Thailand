import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import Layout from '../components/Layout';
import UserFormModal from '../components/UserFormModal';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([
    { id: 1, name: 'สำนักปลัด' },
    { id: 2, name: 'กองคลัง' },
    { id: 3, name: 'กองช่าง' },
    { id: 4, name: 'กองสาธารณสุขและสิ่งแวดล้อม' },
    { id: 5, name: 'กองการศึกษา' },
    { id: 6, name: 'กองสวัสดิการสังคม' },
    { id: 7, name: 'หน่วยตรวจสอบภายใน' }
  ]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    active: '',
    departmentId: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.role) params.role = filters.role;
      if (filters.active !== '') params.active = filters.active;
      if (filters.departmentId) params.departmentId = filters.departmentId;

      const response = await usersAPI.getAll(params);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status !== 403) {
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`คุณต้องการลบผู้ใช้ \"${user.full_name}\" ใช่หรือไม่?`)) {
      return;
    }

    try {
      await usersAPI.delete(user.id);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  const handleModalSuccess = () => {
    fetchUsers();
  };

  const getRoleName = (role) => {
    const roles = {
      staff: 'เจ้าหน้าที่',
      admin: 'ผู้ดูแลระบบ',
      executive: 'ผู้บริหาร'
    };
    return roles[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      staff: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-blue-700',
      admin: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-2 border-purple-700',
      executive: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-green-700'
    };
    return colors[role] || 'bg-gray-200 text-gray-800 border-2 border-gray-400';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Gradient Background */}
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              <i className="fas fa-users mr-3"></i>
              จัดการผู้ใช้
            </h1>
            <p className="text-gray-600 mt-2 font-semibold">จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึงระบบ</p>
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-blue-700 font-bold text-base active:scale-95"
          >
            <i className="fas fa-user-plus text-xl"></i>
            เพิ่มผู้ใช้ใหม่
          </button>
        </div>

        {/* Filters with Modern Style */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <i className="fas fa-user-tag mr-2 text-blue-600"></i>
                ตำแหน่ง
              </label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold bg-white hover:border-blue-400 transition-all"
              >
                <option value="">ทั้งหมด</option>
                <option value="staff">เจ้าหน้าที่</option>
                <option value="admin">ผู้ดูแลระบบ</option>
                <option value="executive">ผู้บริหาร</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <i className="fas fa-toggle-on mr-2 text-green-600"></i>
                สถานะ
              </label>
              <select
                value={filters.active}
                onChange={(e) => setFilters({ ...filters, active: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold bg-white hover:border-blue-400 transition-all"
              >
                <option value="">ทั้งหมด</option>
                <option value="true">ใช้งาน</option>
                <option value="false">ปิดการใช้งาน</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <i className="fas fa-building mr-2 text-purple-600"></i>
                หน่วยงาน
              </label>
              <select
                value={filters.departmentId}
                onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold bg-white hover:border-blue-400 transition-all"
              >
                <option value="">ทั้งหมด</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ role: '', active: '', departmentId: '' })}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl text-gray-700 font-bold hover:bg-gray-100 hover:border-gray-600 transition-all duration-200 bg-white shadow-md hover:shadow-lg"
              >
                <i className="fas fa-filter-circle-xmark mr-2"></i>
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Users Table with Modern Design */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200">
          <table className="min-w-full divide-y-2 divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  <i className="fas fa-user mr-2"></i>ผู้ใช้
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  <i className="fas fa-user-tag mr-2"></i>ตำแหน่ง
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  <i className="fas fa-building mr-2"></i>หน่วยงาน
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  <i className="fas fa-toggle-on mr-2"></i>สถานะ
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  <i className="fas fa-clock mr-2"></i>เข้าสู่ระบบล่าสุด
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-white uppercase tracking-wider">
                  <i className="fas fa-cog mr-2"></i>จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-semibold">
                    <i className="fas fa-inbox text-6xl text-gray-300 mb-4 block"></i>
                    ไม่พบข้อมูลผู้ใช้
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          <i className="fas fa-user-circle text-blue-600 mr-2"></i>
                          {user.full_name}
                        </div>
                        <div className="text-sm text-gray-600 font-semibold">@{user.username}</div>
                        {user.email && (
                          <div className="text-xs text-gray-500 font-medium">
                            <i className="fas fa-envelope mr-1"></i>
                            {user.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-xl shadow-md ${getRoleBadgeColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {user.department_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-xl shadow-md border-2 ${
                        user.active
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-700'
                          : 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-700'
                      }`}>
                        <i className={`fas ${user.active ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                        {user.active ? 'ใช้งาน' : 'ปิดการใช้งาน'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                      {user.last_login ? new Date(user.last_login).toLocaleString('th-TH') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg border-2 border-blue-800 active:scale-95"
                          title="แก้ไข"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg border-2 border-red-800 active:scale-95"
                          title="ลบ"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary with Modern Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
          <p className="text-base text-gray-800 font-bold">
            <i className="fas fa-chart-bar text-blue-600 mr-2"></i>
            แสดง {users.length} ผู้ใช้
          </p>
        </div>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        user={editingUser}
        departments={departments}
      />
    </Layout>
  );
};

export default UsersPage;
