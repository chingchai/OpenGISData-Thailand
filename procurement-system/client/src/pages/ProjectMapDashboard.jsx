import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { projectsAPI, departmentsAPI } from '../services/api';
import Layout from '../components/Layout';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// สร้าง custom marker สำหรับแต่ละสถานะ
const getMarkerIcon = (status) => {
  const colors = {
    draft: '#9CA3AF',
    pending: '#F59E0B',
    in_progress: '#3B82F6',
    completed: '#10B981',
    delayed: '#EF4444',
    cancelled: '#6B7280'
  };

  const color = colors[status] || colors.pending;

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

const ProjectMapDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    departmentId: '',
    search: ''
  });
  const [mapCenter] = useState([14.9753, 102.0983]); // Default center - สำนักงานเทศบาล
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, deptRes] = await Promise.all([
        projectsAPI.getAll(filters),
        departmentsAPI.getAll()
      ]);

      setProjects(projectsRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Filter projects that have location data
  const projectsWithLocation = projects.filter(project => {
    try {
      if (project.location) {
        const loc = typeof project.location === 'string' ? JSON.parse(project.location) : project.location;
        return loc && loc.coordinates && loc.coordinates.length === 2;
      }
      return false;
    } catch (e) {
      return false;
    }
  });

  const getProjectPosition = (project) => {
    try {
      const loc = typeof project.location === 'string' ? JSON.parse(project.location) : project.location;
      if (loc && loc.coordinates) {
        const [lng, lat] = loc.coordinates;
        return [lat, lng];
      }
    } catch (e) {
      console.error('Error parsing location:', e);
    }
    return null;
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      delayed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return badges[status] || badges.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'ร่าง',
      pending: 'รอดำเนินการ',
      in_progress: 'กำลังดำเนินการ',
      completed: 'เสร็จสิ้น',
      delayed: 'ล่าช้า',
      cancelled: 'ยกเลิก'
    };
    return texts[status] || status;
  };

  const stats = {
    total: projects.length,
    withLocation: projectsWithLocation.length,
    withoutLocation: projects.length - projectsWithLocation.length,
    byStatus: projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {})
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-map-marked-alt text-blue-500"></i>
              แผนที่โครงการ
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              แสดงตำแหน่งโครงการทั้งหมดบนแผนที่
            </p>
          </div>
          <Link
            to="/projects"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <i className="fas fa-list mr-2"></i>
            รายการโครงการ
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">โครงการทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <i className="fas fa-folder text-3xl text-gray-400"></i>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">มีตำแหน่ง</p>
                <p className="text-2xl font-bold text-green-600">{stats.withLocation}</p>
              </div>
              <i className="fas fa-map-marker-alt text-3xl text-green-400"></i>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ไม่มีตำแหน่ง</p>
                <p className="text-2xl font-bold text-orange-600">{stats.withoutLocation}</p>
              </div>
              <i className="fas fa-exclamation-triangle text-3xl text-orange-400"></i>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">กำลังดำเนินการ</p>
                <p className="text-2xl font-bold text-blue-600">{stats.byStatus.in_progress || 0}</p>
              </div>
              <i className="fas fa-tasks text-3xl text-blue-400"></i>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ค้นหา
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="ชื่อโครงการ..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                สถานะ
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">ทุกสถานะ</option>
                <option value="pending">รอดำเนินการ</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="delayed">ล่าช้า</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                กอง/สำนัก
              </label>
              <select
                name="departmentId"
                value={filters.departmentId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">ทุกกอง/สำนัก</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="h-[600px] flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
            </div>
          ) : projectsWithLocation.length === 0 ? (
            <div className="h-[600px] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <i className="fas fa-map-marker-slash text-6xl mb-4"></i>
              <p className="text-lg font-medium">ไม่พบโครงการที่มีตำแหน่งบนแผนที่</p>
              <p className="text-sm mt-2">กรุณาเพิ่มตำแหน่งให้กับโครงการก่อน</p>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '600px', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {projectsWithLocation.map(project => {
                const position = getProjectPosition(project);
                if (!position) return null;

                return (
                  <Marker
                    key={project.id}
                    position={position}
                    icon={getMarkerIcon(project.status)}
                    eventHandlers={{
                      click: () => setSelectedProject(project),
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[250px]">
                        <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(project.status)}`}>
                              {getStatusText(project.status)}
                            </span>
                          </div>
                          <p className="text-gray-600">
                            <i className="fas fa-building mr-2"></i>
                            {project.department_name}
                          </p>
                          <p className="text-gray-600">
                            <i className="fas fa-money-bill mr-2"></i>
                            {project.budget?.toLocaleString()} บาท
                          </p>
                          <Link
                            to={`/projects/${project.id}`}
                            className="block mt-2 text-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            ดูรายละเอียด
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            <i className="fas fa-info-circle mr-2"></i>
            คำอธิบายสัญลักษณ์
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { status: 'draft', label: 'ร่าง', color: '#9CA3AF' },
              { status: 'pending', label: 'รอดำเนินการ', color: '#F59E0B' },
              { status: 'in_progress', label: 'กำลังดำเนินการ', color: '#3B82F6' },
              { status: 'completed', label: 'เสร็จสิ้น', color: '#10B981' },
              { status: 'delayed', label: 'ล่าช้า', color: '#EF4444' },
              { status: 'cancelled', label: 'ยกเลิก', color: '#6B7280' }
            ].map(item => (
              <div key={item.status} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectMapDashboard;
