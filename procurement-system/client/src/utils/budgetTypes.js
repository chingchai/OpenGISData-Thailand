/**
 * Budget Type Utilities
 * แปลงและจัดการข้อมูลประเภทงบประมาณ
 */

/**
 * Budget type definitions
 */
export const BUDGET_TYPES = {
  1: {
    id: 1,
    name: 'เงินงบประมาณตามเทศบัญญัติ งบประมาณรายจ่าย',
    shortName: 'งบประมาณตามเทศบัญญัติ',
    requiresFiscalYear: true,
    color: 'blue'
  },
  2: {
    id: 2,
    name: 'เงินอุดหนุนเฉพาะกิจ',
    shortName: 'อุดหนุนเฉพาะกิจ',
    requiresFiscalYear: false,
    color: 'green'
  },
  3: {
    id: 3,
    name: 'เงินสะสม',
    shortName: 'เงินสะสม',
    requiresFiscalYear: false,
    color: 'purple'
  },
  4: {
    id: 4,
    name: 'เงินรายจ่ายค้างจ่าย (เงินกัน)',
    shortName: 'เงินค้างจ่าย',
    requiresFiscalYear: true,
    color: 'orange'
  },
  5: {
    id: 5,
    name: 'อื่นๆ (เงินที่มีการยกเว้นระเบียบ)',
    shortName: 'อื่นๆ',
    requiresFiscalYear: true,
    color: 'gray'
  }
};

/**
 * Get budget type name
 * @param {number} budgetType - Budget type ID (1-5)
 * @param {boolean} short - Return short name
 * @returns {string} Budget type name
 */
export const getBudgetTypeName = (budgetType, short = false) => {
  if (!budgetType) return '-';
  const type = BUDGET_TYPES[budgetType];
  if (!type) return '-';
  return short ? type.shortName : type.name;
};

/**
 * Get budget type with fiscal year
 * @param {number} budgetType - Budget type ID (1-5)
 * @param {number} fiscalYear - Fiscal year in Buddhist calendar (พ.ศ.)
 * @param {boolean} short - Return short name
 * @returns {string} Budget type name with fiscal year
 */
export const getBudgetTypeWithYear = (budgetType, fiscalYear, short = false) => {
  if (!budgetType) return '-';
  const type = BUDGET_TYPES[budgetType];
  if (!type) return '-';

  const name = short ? type.shortName : type.name;

  if (type.requiresFiscalYear && fiscalYear) {
    return `${name} ประจำปีงบประมาณ พ.ศ. ${fiscalYear}`;
  }

  return name;
};

/**
 * Get budget type color for badge
 * @param {number} budgetType - Budget type ID (1-5)
 * @returns {string} Tailwind CSS class for badge
 */
export const getBudgetTypeColor = (budgetType) => {
  if (!budgetType) return 'bg-gray-100 text-gray-800';
  const type = BUDGET_TYPES[budgetType];
  if (!type) return 'bg-gray-100 text-gray-800';

  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return colors[type.color] || 'bg-gray-100 text-gray-800';
};

/**
 * Get all budget types as array for dropdown/select
 * @returns {Array} Array of budget types
 */
export const getBudgetTypeOptions = () => {
  return Object.values(BUDGET_TYPES);
};

/**
 * Check if budget type requires fiscal year
 * @param {number} budgetType - Budget type ID (1-5)
 * @returns {boolean} True if requires fiscal year
 */
export const requiresFiscalYear = (budgetType) => {
  if (!budgetType) return false;
  const type = BUDGET_TYPES[budgetType];
  return type ? type.requiresFiscalYear : false;
};

export default {
  BUDGET_TYPES,
  getBudgetTypeName,
  getBudgetTypeWithYear,
  getBudgetTypeColor,
  getBudgetTypeOptions,
  requiresFiscalYear
};
