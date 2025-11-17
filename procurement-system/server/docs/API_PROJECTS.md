# Project Management API Documentation

## Base URL
```
http://localhost:3001/api/projects
```

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Get All Projects
**GET** `/api/projects`

Get a paginated list of projects with optional filtering.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| departmentId | integer | No | Filter by department (1-7) |
| status | string | No | Filter by status (draft, in_progress, completed, cancelled, on_hold) |
| budgetYear | integer | No | Filter by budget year (2020-2100) |
| procurementMethod | string | No | Filter by method (public_invitation, selection, specific) |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20, max: 100) |

**Access Control:**
- **Staff**: Can only see their own department's projects
- **Admin/Executive**: Can see all projects, can filter by department

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "project_code": "ENG-2024-0001",
      "name": "โครงการก่อสร้างถนน...",
      "description": "รายละเอียดโครงการ...",
      "department_id": 2,
      "department_name": "กองช่าง",
      "department_code": "ENGINEERING",
      "procurement_method": "public_invitation",
      "budget_amount": 5000000,
      "budget_year": 2024,
      "status": "in_progress",
      "planned_start_date": "2024-01-15",
      "actual_start_date": "2024-01-20",
      "created_by": 1,
      "created_by_name": "นายสมชาย ใจดี",
      "created_at": "2024-01-10T08:00:00.000Z",
      "total_steps": 7,
      "completed_steps": 3,
      "overdue_steps": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Example:**
```bash
# Get all projects (staff user - filtered by their department)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/projects

# Get projects with filters (admin/executive)
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/projects?departmentId=2&status=in_progress&page=1&limit=10"
```

---

### 2. Get Project by ID
**GET** `/api/projects/:id`

Get detailed information about a specific project including all steps.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Project ID |

**Access Control:**
- **Staff**: Can only view projects from their department
- **Admin/Executive**: Can view all projects

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_code": "ENG-2024-0001",
    "name": "โครงการก่อสร้างถนน...",
    "description": "รายละเอียดโครงการ...",
    "department_id": 2,
    "department_name": "กองช่าง",
    "department_code": "ENGINEERING",
    "procurement_method": "public_invitation",
    "budget_amount": 5000000,
    "budget_year": 2024,
    "status": "in_progress",
    "planned_start_date": "2024-01-15",
    "actual_start_date": "2024-01-20",
    "actual_end_date": null,
    "winner_vendor": null,
    "contract_number": null,
    "contract_date": null,
    "remarks": null,
    "created_by": 1,
    "created_by_name": "นายสมชาย ใจดี",
    "created_at": "2024-01-10T08:00:00.000Z",
    "updated_at": null,
    "steps": [
      {
        "id": 1,
        "project_id": 1,
        "step_number": 1,
        "step_name": "จัดทำร่างขอบเขตงาน (TOR)",
        "step_description": "จัดทำเอกสารรายละเอียด...",
        "planned_start_date": "2024-01-15",
        "planned_end_date": "2024-01-22",
        "actual_start_date": "2024-01-20",
        "actual_end_date": "2024-01-23",
        "sla_days": 7,
        "status": "completed",
        "is_critical": false,
        "allow_weekends": false
      }
    ],
    "comment_count": 5
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "error": "Access denied. You can only view projects from your department."
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/projects/1
```

---

### 3. Create Project
**POST** `/api/projects`

Create a new project with auto-generated steps based on procurement method.

**Access Control:**
- **Staff**: Can only create projects for their own department
- **Admin**: Can create projects for any department
- **Executive**: Cannot create projects (403)

**Request Body:**
```json
{
  "name": "โครงการก่อสร้างถนนคอนกรีตเสริมเหล็ก",
  "description": "ก่อสร้างถนนคอนกรีต ขนาด 6x200 เมตร",
  "departmentId": 2,
  "procurementMethod": "public_invitation",
  "budgetAmount": 5000000,
  "budgetYear": 2024,
  "startDate": "2024-01-15"
}
```

**Field Validation:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | 5-200 characters |
| description | string | No | Max 1000 characters |
| departmentId | integer | Yes | 1-7 |
| procurementMethod | string | Yes | public_invitation, selection, or specific |
| budgetAmount | number | Yes | 1 - 50,000,000 |
| budgetYear | integer | Yes | 2020-2100 |
| startDate | string | No | ISO 8601 date (YYYY-MM-DD) |

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "project_code": "ENG-2024-0015",
    "name": "โครงการก่อสร้างถนนคอนกรีตเสริมเหล็ก",
    "steps": [
      {
        "id": 105,
        "step_number": 1,
        "step_name": "จัดทำร่างขอบเขตงาน (TOR)",
        "status": "pending"
      }
    ]
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Project name must be between 5 and 200 characters"
    }
  ]
}
```

**Error Response (403):**
```json
{
  "success": false,
  "error": "Access denied. You can only create projects for your department."
}
```

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "โครงการก่อสร้างถนนคอนกรีตเสริมเหล็ก",
    "description": "ก่อสร้างถนนคอนกรีต ขนาด 6x200 เมตร",
    "departmentId": 2,
    "procurementMethod": "public_invitation",
    "budgetAmount": 5000000,
    "budgetYear": 2024,
    "startDate": "2024-01-15"
  }' \
  http://localhost:3001/api/projects
```

---

### 4. Update Project
**PUT** `/api/projects/:id`

Update project information.

**Access Control:**
- **Staff**: Can only update projects from their department
- **Admin**: Can update all projects
- **Executive**: Cannot update projects (403)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Project ID |

**Request Body (all fields optional):**
```json
{
  "name": "โครงการก่อสร้างถนน... (แก้ไข)",
  "description": "รายละเอียดที่แก้ไข...",
  "budgetAmount": 5500000,
  "status": "in_progress",
  "actualStartDate": "2024-01-20",
  "actualEndDate": "2024-03-15",
  "winnerVendor": "บริษัท ABC จำกัด",
  "contractNumber": "สัญญาที่ 123/2567",
  "contractDate": "2024-01-25",
  "remarks": "หมายเหตุเพิ่มเติม"
}
```

**Field Validation:**
| Field | Type | Validation |
|-------|------|------------|
| name | string | 5-200 characters |
| description | string | Max 1000 characters |
| budgetAmount | number | 1 - 50,000,000 |
| status | string | draft, in_progress, completed, cancelled, on_hold |
| actualStartDate | string | ISO 8601 date |
| actualEndDate | string | ISO 8601 date |
| winnerVendor | string | Max 200 characters |
| contractNumber | string | Max 100 characters |
| contractDate | string | ISO 8601 date |
| remarks | string | Max 500 characters |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_code": "ENG-2024-0001",
    "name": "โครงการก่อสร้างถนน... (แก้ไข)",
    "status": "in_progress",
    "updated_at": "2024-01-25T10:30:00.000Z"
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "error": "Access denied. You can only update projects from your department."
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

**Example:**
```bash
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "actualStartDate": "2024-01-20"
  }' \
  http://localhost:3001/api/projects/1
```

---

### 5. Delete Project
**DELETE** `/api/projects/:id`

Soft delete a project (marks as deleted but doesn't remove from database).

**Access Control:**
- **Staff**: Can only delete projects from their department
- **Admin**: Can delete projects (except completed ones)
- **Executive**: Cannot delete projects (403)

**Business Rules:**
- Cannot delete completed projects
- Soft delete only (deleted_at timestamp is set)
- Related steps are also soft deleted

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Project ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Cannot delete completed projects. Please contact an administrator."
}
```

**Error Response (403):**
```json
{
  "success": false,
  "error": "Access denied. You can only delete projects from your department."
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

**Example:**
```bash
curl -X DELETE \
  -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/projects/1
```

---

### 6. Get Project Statistics
**GET** `/api/projects/stats`

Get project statistics and summaries.

**Access Control:**
- **Staff**: Statistics for their department only
- **Admin/Executive**: Statistics for all departments

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total_projects": 45,
    "draft_count": 5,
    "in_progress_count": 25,
    "completed_count": 12,
    "cancelled_count": 3,
    "total_budget": 125000000,
    "average_budget": 2777777.78
  }
}
```

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/projects/stats
```

---

## Project Status Values

| Status | Description |
|--------|-------------|
| draft | โครงการร่าง (ยังไม่เริ่มดำเนินการ) |
| in_progress | กำลังดำเนินการ |
| completed | เสร็จสิ้นแล้ว |
| cancelled | ยกเลิก |
| on_hold | ระงับชั่วคราว |

---

## Procurement Methods

| Code | Name | Steps | Estimated Days |
|------|------|-------|----------------|
| public_invitation | วิธีประกาศเชิญชวนทั่วไป | 7 | 60 |
| selection | วิธีคัดเลือก | 8 | 50 |
| specific | วิธีเฉพาะเจาะจง | 10 | 70 |

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window per IP
- **Response**: 429 Too Many Requests

---

## Notes

1. **Auto-Generated Steps**: When creating a project, steps are automatically generated based on the procurement method
2. **Audit Logging**: All create, update, and delete operations are logged in the audit_logs table
3. **Soft Delete**: Deleted projects remain in database with deleted_at timestamp
4. **Department Filtering**: Staff users automatically see only their department's data
5. **Date Format**: All dates use ISO 8601 format (YYYY-MM-DD)
6. **Project Code Format**: DEPT-YEAR-XXXX (e.g., ENG-2024-0001)

---

**Last Updated**: January 2025
**API Version**: 1.0.0
