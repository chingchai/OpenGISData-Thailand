import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { stepsAPI } from '../services/api';
import Layout from '../components/Layout';

const OverduePage = () => {
  const [overdueSteps, setOverdueSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverdueSteps();
  }, []);

  const fetchOverdueSteps = async () => {
    try {
      const response = await stepsAPI.getOverdue();
      setOverdueSteps(response.data.data);
    } catch (error) {
      console.error('Error fetching overdue steps:', error);
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-bold text-gray-800">ขั้นตอนที่ล่าช้า</h2>
          <p className="text-gray-600">รายการขั้นตอนที่เกินกำหนดเวลาตามแผน</p>
        </div>

        {/* Statistics Card */}
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="text-3xl mr-4">⚠️</div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                พบขั้นตอนล่าช้าทั้งหมด {overdueSteps.length} รายการ
              </h3>
              <p className="text-red-600 text-sm">
                ต้องการการดำเนินการเร่งด่วน
              </p>
            </div>
          </div>
        </div>

        {/* Overdue Steps List */}
        {overdueSteps.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {overdueSteps.map((step) => (
                <Link
                  key={step.id}
                  to={`/projects/${step.project_id}`}
                  className="block p-6 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Step Info */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                          ล่าช้า {step.days_overdue} วัน
                        </span>
                        {step.is_critical === 1 && (
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                            🔥 Critical
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        ขั้นตอนที่ {step.step_number}: {step.step_name}
                      </h3>

                      {/* Project Info */}
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <p className="font-medium text-gray-800">{step.project_name}</p>
                        <p>รหัสโครงการ: {step.project_code}</p>
                        <p>หน่วยงาน: {step.department_name}</p>
                        {step.description && (
                          <p className="text-gray-500 mt-2">{step.description}</p>
                        )}
                      </div>

                      {/* Timeline */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">กำหนดเสร็จ</p>
                          <p className="font-medium">
                            {new Date(step.planned_end).toLocaleDateString('th-TH')}
                          </p>
                        </div>

                        {step.actual_start && (
                          <div>
                            <p className="text-gray-600">เริ่มดำเนินการ</p>
                            <p className="font-medium">
                              {new Date(step.actual_start).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-gray-600">สถานะ</p>
                          <p className="font-medium">
                            {step.status === 'in_progress' && 'กำลังดำเนินการ'}
                            {step.status === 'pending' && 'รอดำเนินการ'}
                            {step.status === 'completed' && 'เสร็จสิ้น'}
                          </p>
                        </div>
                      </div>

                      {/* Contact */}
                      {step.created_by_name && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            ผู้รับผิดชอบ: <span className="font-medium text-gray-800">{step.created_by_name}</span>
                            {step.created_by_email && (
                              <span className="ml-2">({step.created_by_email})</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Arrow Icon */}
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
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              ยอดเยี่ยม! ไม่มีขั้นตอนล่าช้า
            </h3>
            <p className="text-gray-600">
              โครงการทั้งหมดดำเนินการตามกำหนดเวลา
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OverduePage;
