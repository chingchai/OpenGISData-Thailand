import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Color palette
const COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  pink: '#ec4899',
  gray: '#6b7280'
};

const STATUS_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];
const METHOD_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];
const DEPARTMENT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

/**
 * Status Distribution Pie Chart
 */
export const StatusPieChart = ({ stats }) => {
  if (!stats) return null;

  const data = [
    { name: 'ร่าง', value: stats.draft_count || 0 },
    { name: 'ดำเนินการ', value: stats.in_progress_count || 0 },
    { name: 'เสร็จสิ้น', value: stats.completed_count || 0 },
    { name: 'ล่าช้า', value: stats.delayed_count || 0 },
    { name: 'ยกเลิก', value: stats.cancelled_count || 0 }
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">ไม่มีข้อมูล</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * Procurement Method Distribution Chart
 */
export const ProcurementMethodChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">ไม่มีข้อมูล</div>;
  }

  const methodNames = {
    public_invitation: 'ประกวดราคา',
    selection: 'คัดเลือก',
    specific: 'เฉพาะเจาะจง'
  };

  const chartData = data.map(item => ({
    name: methodNames[item.procurement_method] || item.procurement_method,
    จำนวน: item.count,
    งบประมาณ: item.total_budget
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke={COLORS.blue} />
        <YAxis yAxisId="right" orientation="right" stroke={COLORS.green} />
        <Tooltip
          formatter={(value, name) => {
            if (name === 'งบประมาณ') {
              return value.toLocaleString() + ' บาท';
            }
            return value;
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="จำนวน" fill={COLORS.blue} />
        <Bar yAxisId="right" dataKey="งบประมาณ" fill={COLORS.green} />
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Department Distribution Chart
 */
export const DepartmentChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">ไม่มีข้อมูล</div>;
  }

  const chartData = data.map(item => ({
    name: item.department_name,
    โครงการทั้งหมด: item.count,
    เสร็จสิ้น: item.completed,
    ดำเนินการ: item.in_progress
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={150} />
        <Tooltip />
        <Legend />
        <Bar dataKey="โครงการทั้งหมด" fill={COLORS.blue} />
        <Bar dataKey="เสร็จสิ้น" fill={COLORS.green} />
        <Bar dataKey="ดำเนินการ" fill={COLORS.yellow} />
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Budget Range Distribution Chart
 */
export const BudgetRangeChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">ไม่มีข้อมูล</div>;
  }

  const chartData = data.map(item => ({
    range: item.range,
    count: item.count
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ range, count }) => `${range}: ${count}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * Monthly Trend Line Chart
 */
export const MonthlyTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">ไม่มีข้อมูล</div>;
  }

  const chartData = data.map(item => ({
    month: item.month,
    จำนวน: item.count,
    งบประมาณ: item.total_budget / 1000000 // Convert to millions
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" orientation="left" stroke={COLORS.blue} />
        <YAxis yAxisId="right" orientation="right" stroke={COLORS.green} />
        <Tooltip
          formatter={(value, name) => {
            if (name === 'งบประมาณ') {
              return value.toFixed(2) + ' ล้านบาท';
            }
            return value;
          }}
        />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="จำนวน" stroke={COLORS.blue} strokeWidth={2} />
        <Line yAxisId="right" type="monotone" dataKey="งบประมาณ" stroke={COLORS.green} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * Summary Card Component
 */
export const SummaryCard = ({ title, value, icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    red: 'from-red-500 to-red-700',
    yellow: 'from-yellow-500 to-yellow-700',
    purple: 'from-purple-500 to-purple-700',
    gray: 'from-gray-500 to-gray-700'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <i className={`fas fa-${icon} text-white text-2xl`}></i>
        </div>
      </div>
    </div>
  );
};

export default {
  StatusPieChart,
  ProcurementMethodChart,
  DepartmentChart,
  BudgetRangeChart,
  MonthlyTrendChart,
  SummaryCard
};
