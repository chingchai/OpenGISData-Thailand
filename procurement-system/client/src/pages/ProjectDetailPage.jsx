import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI, stepsAPI } from '../services/api';
import Layout from '../components/Layout';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [steps, setSteps] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const [projectRes, stepsRes, progressRes] = await Promise.all([
        projectsAPI.getById(id),
        stepsAPI.getByProject(id),
        stepsAPI.getProgress(id)
      ]);

      setProject(projectRes.data.data);
      setSteps(stepsRes.data.data);
      setProgress(progressRes.data.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">ไม่พบข้อมูลโครงการ</p>
          <Link to="/projects" className="text-blue-600 hover:underline mt-4 inline-block">
            กลับไปหน้ารายการโครงการ
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600">
          <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link to="/projects" className="hover:text-blue-600">โครงการทั้งหมด</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{project.name}</span>
        </nav>

        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-600">รหัสโครงการ</p>
              <p className="font-semibold">{project.project_code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">หน่วยงาน</p>
              <p className="font-semibold">{project.department_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">งบประมาณ</p>
              <p className="font-semibold text-blue-600">{project.budget?.toLocaleString()} บาท</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ผู้สร้าง</p>
              <p className="font-semibold">{project.created_by_name}</p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        {progress && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">ความคืบหน้า</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{progress.totalSteps}</p>
                <p className="text-sm text-gray-600">ทั้งหมด</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{progress.completedSteps}</p>
                <p className="text-sm text-gray-600">เสร็จสิ้น</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{progress.inProgressSteps}</p>
                <p className="text-sm text-gray-600">กำลังดำเนินการ</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{progress.pendingSteps}</p>
                <p className="text-sm text-gray-600">รอดำเนินการ</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{progress.overdueSteps}</p>
                <p className="text-sm text-gray-600">ล่าช้า</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>ความคืบหน้า</span>
                <span className="font-semibold">{progress.progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all"
                  style={{ width: `${progress.progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Steps Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">ขั้นตอนการดำเนินงาน</h2>
          {steps.length > 0 ? (
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step.status === 'completed' ? 'bg-green-100 text-green-600' :
                      step.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                      step.computed_status === 'overdue' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 my-2"></div>
                    )}
                  </div>

                  <div className="flex-1 pb-8">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{step.step_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          getStepStatusColor(step.computed_status || step.status)
                        }`}>
                          {step.computed_status === 'overdue' ? 'ล่าช้า' :
                           step.status === 'completed' ? 'เสร็จสิ้น' :
                           step.status === 'in_progress' ? 'กำลังดำเนินการ' :
                           'รอดำเนินการ'}
                        </span>
                      </div>
                      {step.description && (
                        <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">วันเริ่มตามแผน</p>
                          <p className="font-medium">{new Date(step.planned_start).toLocaleDateString('th-TH')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">วันสิ้นสุดตามแผน</p>
                          <p className="font-medium">{new Date(step.planned_end).toLocaleDateString('th-TH')}</p>
                        </div>
                        {step.actual_start && (
                          <div>
                            <p className="text-gray-600">วันเริ่มจริง</p>
                            <p className="font-medium">{new Date(step.actual_start).toLocaleDateString('th-TH')}</p>
                          </div>
                        )}
                        {step.actual_end && (
                          <div>
                            <p className="text-gray-600">วันสิ้นสุดจริง</p>
                            <p className="font-medium">{new Date(step.actual_end).toLocaleDateString('th-TH')}</p>
                          </div>
                        )}
                      </div>
                      {step.delay_days_computed > 0 && (
                        <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
                          ⚠️ ล่าช้า {step.delay_days_computed} วัน
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">ยังไม่มีขั้นตอนในโครงการนี้</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetailPage;
