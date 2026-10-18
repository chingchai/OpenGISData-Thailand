import React from 'react';
import { Link } from 'react-router-dom';

const CredentialsPage = () => {
  const credentials = {
    staff: [
      {
        username: 'staff_treasury',
        password: 'password123',
        fullName: 'นางสาวสมหญิง ใจดี',
        department: 'กองคลัง',
        email: 'treasury@huatalay.go.th'
      },
      {
        username: 'staff_engineering',
        password: 'password123',
        fullName: 'นายสมชาย ช่างคิด',
        department: 'กองช่าง',
        email: 'engineering@huatalay.go.th'
      },
      {
        username: 'staff_education',
        password: 'password123',
        fullName: 'นางสมศรี รักการศึกษา',
        department: 'กองการศึกษา',
        email: 'education@huatalay.go.th'
      },
      {
        username: 'staff_health',
        password: 'password123',
        fullName: 'นายแพทย์สมศักดิ์ รักษา',
        department: 'กองสาธารณสุขและสิ่งแวดล้อม',
        email: 'health@huatalay.go.th'
      },
      {
        username: 'staff_municipal',
        password: 'password123',
        fullName: 'นายสมพร บริหาร',
        department: 'สำนักปลัด',
        email: 'municipal@huatalay.go.th'
      },
      {
        username: 'staff_strategy',
        password: 'password123',
        fullName: 'นางสาวสมฤทัย วางแผน',
        department: 'กองวิชาการและแผนงาน',
        email: 'strategy@huatalay.go.th'
      },
      {
        username: 'staff_clerk',
        password: 'password123',
        fullName: 'นายสมบูรณ์ จัดการ',
        department: 'กองธุรการ',
        email: 'clerk@huatalay.go.th'
      }
    ],
    admin: [
      {
        username: 'admin',
        password: 'password123',
        fullName: 'นายผู้ดูแลระบบ',
        department: 'ทุกหน่วยงาน',
        email: 'admin@huatalay.go.th'
      },
      {
        username: 'admin_treasury',
        password: 'password123',
        fullName: 'นางสาวผู้ช่วยผู้ดูแล',
        department: 'กองคลัง',
        email: 'admin2@huatalay.go.th'
      }
    ],
    executive: [
      {
        username: 'executive',
        password: 'password123',
        fullName: 'นายปลัดเทศบาล',
        department: 'ทุกหน่วยงาน',
        email: 'executive@huatalay.go.th'
      },
      {
        username: 'executive_mayor',
        password: 'password123',
        fullName: 'นายกเทศมนตรี',
        department: 'ทุกหน่วยงาน',
        email: 'mayor@huatalay.go.th'
      }
    ]
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    alert(`คัดลอก${type}แล้ว: ${text}`);
  };

  const UserCard = ({ user, roleColor, roleIcon }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border-l-4" style={{ borderLeftColor: roleColor }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{roleIcon}</span>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{user.fullName}</h3>
            <p className="text-sm text-gray-500">{user.department}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="bg-gray-50 rounded p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Username</p>
              <p className="font-mono text-sm font-medium text-gray-800">{user.username}</p>
            </div>
            <button
              onClick={() => copyToClipboard(user.username, 'Username')}
              className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 rounded hover:bg-blue-50"
            >
              คัดลอก
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Password</p>
              <p className="font-mono text-sm font-medium text-gray-800">{user.password}</p>
            </div>
            <button
              onClick={() => copyToClipboard(user.password, 'Password')}
              className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 rounded hover:bg-blue-50"
            >
              คัดลอก
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-400 mt-2">
          <span className="font-medium">Email:</span> {user.email}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ข้อมูลบัญชีผู้ใช้งาน
          </h1>
          <p className="text-gray-600 mb-4">ระบบจัดซื้อจัดจ้าง - เทศบาลตำบลหัวทะเล</p>
          <div className="inline-block bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded text-sm">
            <strong>คำเตือน:</strong> ข้อมูลนี้สำหรับทดสอบระบบเท่านั้น อย่าใช้ในสภาพแวดล้อมจริง
          </div>
        </div>

        {/* Back to Login Button */}
        <div className="text-center mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg shadow-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>

        {/* Staff Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500 w-1 h-8 rounded"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              เจ้าหน้าที่ (Staff) - {credentials.staff.length} บัญชี
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {credentials.staff.map((user, index) => (
              <UserCard key={index} user={user} roleColor="#10b981" roleIcon="👷" />
            ))}
          </div>
        </div>

        {/* Admin Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 w-1 h-8 rounded"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              ผู้ดูแลระบบ (Admin) - {credentials.admin.length} บัญชี
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {credentials.admin.map((user, index) => (
              <UserCard key={index} user={user} roleColor="#8b5cf6" roleIcon="👨‍💼" />
            ))}
          </div>
        </div>

        {/* Executive Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 w-1 h-8 rounded"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              ผู้บริหาร (Executive) - {credentials.executive.length} บัญชี
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {credentials.executive.map((user, index) => (
              <UserCard key={index} user={user} roleColor="#3b82f6" roleIcon="🎯" />
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">สรุปบัญชีผู้ใช้ทั้งหมด</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-3xl font-bold text-green-600">{credentials.staff.length}</p>
              <p className="text-sm text-gray-600">เจ้าหน้าที่</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-3xl font-bold text-purple-600">{credentials.admin.length}</p>
              <p className="text-sm text-gray-600">ผู้ดูแลระบบ</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-3xl font-bold text-blue-600">{credentials.executive.length}</p>
              <p className="text-sm text-gray-600">ผู้บริหาร</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-lg font-semibold text-gray-800">
              รวมทั้งหมด: {credentials.staff.length + credentials.admin.length + credentials.executive.length} บัญชี
            </p>
            <p className="text-sm text-gray-500 mt-2">รหัสผ่านทั้งหมด: password123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>© 2024 เทศบาลตำบลหัวทะเล | ระบบจัดซื้อจัดจ้าง</p>
        </div>
      </div>
    </div>
  );
};

export default CredentialsPage;
