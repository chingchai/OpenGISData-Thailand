import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI, stepsAPI } from '../services/api';
import Layout from '../components/Layout';
import StepEditModal from '../components/StepEditModal';

// ImageThumbnail component with error handling
const ImageThumbnail = ({ imageUrl, altText, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    console.error('Failed to load image:', imageUrl);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  if (imageError) {
    return (
      <div className="relative group">
        <div className="w-full h-32 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
          <div className="text-center text-gray-500 px-2">
            <svg className="w-12 h-12 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">ไม่สามารถโหลดรูปภาพ</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={altText}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`w-full h-32 object-cover rounded border border-gray-300 hover:border-blue-500 transition-all bg-gray-100 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ minHeight: '8rem' }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded transition-opacity flex items-center justify-center">
        <svg
          className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
          />
        </svg>
      </div>
    </div>
  );
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [steps, setSteps] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingStep, setEditingStep] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

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

  const handleEditStep = (step) => {
    setEditingStep(step);
    setIsEditModalOpen(true);
  };

  const handleQuickStatusChange = async (stepId, newStatus) => {
    try {
      await stepsAPI.updateStatus(stepId, newStatus);
      fetchProjectDetails(); // Refresh data
    } catch (error) {
      console.error('Error updating step status:', error);
      alert('เกิดข้อผิดพลาดในการอัพเดทสถานะ');
    }
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setEditingStep(null);
  };

  const handleModalSuccess = () => {
    fetchProjectDetails(); // Refresh data
  };

  const getStepStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      on_hold: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'รอดำเนินการ',
      in_progress: 'กำลังดำเนินการ',
      completed: 'เสร็จสิ้น',
      overdue: 'ล่าช้า',
      on_hold: 'พักชั่วคราว'
    };
    return texts[status] || status;
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">ขั้นตอนการดำเนินงาน</h2>
            <p className="text-sm text-gray-500">{steps.length} ขั้นตอน</p>
          </div>

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
                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{step.step_name}</h3>
                          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                            getStepStatusColor(step.computed_status || step.status)
                          }`}>
                            {getStatusText(step.computed_status || step.status)}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 ml-4">
                          {/* Quick Status Change Buttons */}
                          {step.status !== 'completed' && (
                            <div className="flex gap-1">
                              {step.status === 'pending' && (
                                <button
                                  onClick={() => handleQuickStatusChange(step.id, 'in_progress')}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-medium transition-colors"
                                  title="เริ่มดำเนินการ"
                                >
                                  เริ่ม
                                </button>
                              )}
                              {step.status === 'in_progress' && (
                                <button
                                  onClick={() => handleQuickStatusChange(step.id, 'completed')}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-medium transition-colors"
                                  title="ทำเสร็จแล้ว"
                                >
                                  เสร็จสิ้น
                                </button>
                              )}
                            </div>
                          )}

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditStep(step)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-medium transition-colors"
                            title="แก้ไขขั้นตอน"
                          >
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {step.description && (
                        <p className="text-sm text-gray-600 mb-3 mt-2">{step.description}</p>
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
                            <p className="font-medium text-blue-600">{new Date(step.actual_start).toLocaleDateString('th-TH')}</p>
                          </div>
                        )}
                        {step.actual_end && (
                          <div>
                            <p className="text-gray-600">วันสิ้นสุดจริง</p>
                            <p className="font-medium text-green-600">{new Date(step.actual_end).toLocaleDateString('th-TH')}</p>
                          </div>
                        )}
                      </div>

                      {step.notes && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                          <strong>หมายเหตุ:</strong> {step.notes}
                        </div>
                      )}

                      {/* Step Images */}
                      {(() => {
                        try {
                          const images = step.image_urls ? JSON.parse(step.image_urls) : [];
                          if (Array.isArray(images) && images.length > 0) {
                            return (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  รูปภาพประกอบ ({images.length} รูป)
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                  {images.map((imageUrl, imgIndex) => (
                                    <ImageThumbnail
                                      key={imgIndex}
                                      imageUrl={imageUrl}
                                      altText={`${step.step_name} - รูปที่ ${imgIndex + 1}`}
                                      onClick={() => setLightboxImage(imageUrl)}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          }
                        } catch (e) {
                          console.error('Error parsing image_urls:', e);
                        }
                        return null;
                      })()}

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

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            ×
          </button>
          <img
            src={lightboxImage}
            alt="รูปภาพขยาย"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Edit Step Modal */}
      <StepEditModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        step={editingStep}
      />
    </Layout>
  );
};

export default ProjectDetailPage;
