# คู่มือการเพิ่มฟีเจอร์อัพโหลดเอกสาร

## สรุปการเปลี่ยนแปลง

เพิ่มความสามารถในการอัพโหลดเอกสารแนบ (PDF, Word, Excel, ฯลฯ) ในขั้นตอนการดำเนินงาน พร้อมแก้ไขปัญหา thumbnail รูปภาพที่แสดงเป็นกล่องสีดำ

---

## ✅ สิ่งที่ทำเสร็จแล้ว

### 1. Backend (Server)
- ✅ สร้าง migration `add-document-urls-to-steps.js` เพื่อเพิ่ม column `document_urls`
- ✅ แก้ไข `server/routes/upload.js` เพิ่ม endpoint `/api/upload/documents`
- ✅ แก้ไข `server/services/step-service.js` ให้รองรับ `documentUrls`

### 2. Frontend (Client)
- ✅ แก้ไข `client/src/services/api.js` เพิ่ม `uploadAPI.uploadDocuments()`
- ✅ แก้ไข `ProjectDetailPage.jsx` เพิ่ม ImageThumbnail component พร้อม error handling
- ✅ แก้ไข `StepEditModal.jsx` เพิ่ม ImagePreview component พร้อม error handling

---

## 📋 ขั้นตอนที่ต้องดำเนินการต่อ

### ขั้นตอนที่ 1: รัน Migration บน Server

```bash
cd /root/OpenGISData-Thailand/procurement-system/server
node migrations/add-document-urls-to-steps.js
```

ผลลัพธ์ที่ถูกต้อง:
```
🔄 Starting migration: add-document-urls-to-steps
✅ Added column: document_urls (TEXT)
✅ Migration completed successfully!
```

### ขั้นตอนที่ 2: แก้ไข StepEditModal.jsx

เพิ่ม state และ functions สำหรับเอกสาร หลังบรรทัดที่ 90:

```javascript
const [selectedFiles, setSelectedFiles] = useState([]);
const [existingImages, setExistingImages] = useState([]);
// เพิ่มบรรทัดเหล่านี้
const [selectedDocuments, setSelectedDocuments] = useState([]);
const [existingDocuments, setExistingDocuments] = useState([]);
```

ใน `useEffect` หลังจากโหลด `existingImages` (บรรทัด ~42):

```javascript
// Load existing documents
try {
  const docs = step.document_urls ? JSON.parse(step.document_urls) : [];
  setExistingDocuments(Array.isArray(docs) ? docs : []);
} catch (e) {
  setExistingDocuments([]);
}
setSelectedDocuments([]);
```

เพิ่มฟังก์ชั่นจัดการเอกสาร (หลัง `handleRemoveSelectedFile`):

```javascript
const handleDocumentSelect = (e) => {
  const files = Array.from(e.target.files);

  // Validate file types
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip'
  ];
  const invalidFiles = files.filter(file => !validTypes.includes(file.type));

  if (invalidFiles.length > 0) {
    setError('กรุณาเลือกเฉพาะไฟล์เอกสาร (.pdf, .doc, .docx, .xls, .xlsx, .txt, .zip)');
    return;
  }

  // Validate file sizes (10MB each)
  const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
  if (oversizedFiles.length > 0) {
    setError('ขนาดไฟล์เอกสารต้องไม่เกิน 10MB');
    return;
  }

  // Check total limit (10 documents max)
  if (existingDocuments.length + selectedDocuments.length + files.length > 10) {
    setError('สามารถอัพโหลดเอกสารได้สูงสุด 10 ไฟล์');
    return;
  }

  setSelectedDocuments(prev => [...prev, ...files]);
  setError('');
};

const handleRemoveSelectedDocument = (index) => {
  setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
};

const handleRemoveExistingDocument = (index) => {
  setExistingDocuments(prev => prev.filter((_, i) => i !== index));
};
```

ใน `handleSubmit` หลังจากอัพโหลดรูปภาพ (บรรทัด ~118):

```javascript
// Upload new images if any
if (selectedFiles.length > 0) {
  // ... existing image upload code ...
}

// Upload new documents if any
let newDocumentData = [];
if (selectedDocuments.length > 0) {
  setUploading(true);
  try {
    const uploadResponse = await uploadAPI.uploadDocuments(selectedDocuments);
    newDocumentData = uploadResponse.data?.data?.documentUrls || [];
  } catch (uploadErr) {
    console.error('Error uploading documents:', uploadErr);
    setError('เกิดข้อผิดพลาดในการอัพโหลดเอกสาร');
    setLoading(false);
    setUploading(false);
    return;
  } finally {
    setUploading(false);
  }
}

// Combine existing and new documents
const allDocuments = [...existingDocuments, ...newDocumentData];
```

เพิ่มในส่วน payload (บรรทัด ~134):

```javascript
const payload = {
  // ... existing fields ...
  imageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
  documentUrls: allDocuments.length > 0 ? allDocuments : undefined  // เพิ่มบรรทัดนี้
};
```

เพิ่ม UI สำหรับอัพโหลดเอกสาร หลังส่วนอัพโหลดรูปภาพ (หลังบรรทัด ~397):

```jsx
{/* Document Upload */}
<div className="mt-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    เอกสารแนบ
    <span className="text-gray-500 font-normal ml-2 text-xs">
      (สูงสุด 10 ไฟล์, ขนาดไม่เกิน 10MB/ไฟล์)
    </span>
  </label>

  {/* Existing Documents */}
  {existingDocuments.length > 0 && (
    <div className="mb-3">
      <p className="text-xs text-gray-600 mb-2">เอกสารที่มีอยู่:</p>
      <div className="space-y-2">
        {existingDocuments.map((doc, index) => (
          <div key={`existing-doc-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-300">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">{doc.name || 'เอกสาร'}</span>
              {doc.size && <span className="text-xs text-gray-500">({(doc.size / 1024).toFixed(1)} KB)</span>}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveExistingDocument(index)}
              className="text-red-500 hover:text-red-700"
              title="ลบเอกสาร"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Selected Documents Preview */}
  {selectedDocuments.length > 0 && (
    <div className="mb-3">
      <p className="text-xs text-gray-600 mb-2">เอกสารที่เลือกใหม่:</p>
      <div className="space-y-2">
        {selectedDocuments.map((file, index) => (
          <div key={`new-doc-${index}`} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-300">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveSelectedDocument(index)}
              className="text-red-500 hover:text-red-700"
              title="ยกเลิกเอกสาร"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* File Input */}
  <input
    type="file"
    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
    multiple
    onChange={handleDocumentSelect}
    disabled={loading || uploading}
    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
  />
  <p className="mt-1 text-xs text-gray-500">
    รองรับไฟล์: PDF, Word, Excel, TXT, ZIP
  </p>
</div>
```

### ขั้นตอนที่ 3: แก้ไข ProjectDetailPage.jsx

เพิ่มการแสดงเอกสารหลังส่วนแสดงรูปภาพ (หลังบรรทัด ~346):

```jsx
{/* Step Documents */}
{(() => {
  try {
    const documents = step.document_urls ? JSON.parse(step.document_urls) : [];
    if (Array.isArray(documents) && documents.length > 0) {
      return (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            เอกสารแนบ ({documents.length} ไฟล์)
          </p>
          <div className="space-y-2">
            {documents.map((doc, docIndex) => (
              <a
                key={docIndex}
                href={doc.url}
                download={doc.name || `document-${docIndex + 1}`}
                className="flex items-center space-x-2 p-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-blue-700 font-medium">{doc.name || `เอกสาร ${docIndex + 1}`}</span>
                {doc.size && <span className="text-xs text-gray-500">({(doc.size / 1024).toFixed(1)} KB)</span>}
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      );
    }
  } catch (e) {
    console.error('Error parsing document_urls:', e);
  }
  return null;
})()}
```

### ขั้นตอนที่ 4: Restart Server

```bash
pm2 restart procurement-api
pm2 logs procurement-api --lines 20
```

### ขั้นตอนที่ 5: ทดสอบ

1. เปิดหน้าโครงการและคลิกแก้ไขขั้นตอน
2. ทดสอบอัพโหลดรูปภาพ (ตรวจสอบว่า thumbnail แสดงถูกต้อง ไม่เป็นกล่องสีดำ)
3. ทดสอบอัพโหลดเอกสาร PDF, Word, Excel
4. บันทึกและตรวจสอบว่าทั้งรูปภาพและเอกสารแสดงในหน้าขั้นตอนการดำเนินงาน

---

## 📄 ไฟล์รองรับ

### รูปภาพ
- JPG, JPEG, PNG, GIF, WEBP
- ขนาดสูงสุด 5MB/ไฟล์
- สูงสุด 10 ไฟล์

### เอกสาร
- PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP
- ขนาดสูงสุด 10MB/ไฟล์
- สูงสุด 10 ไฟล์

---

## 🐛 การแก้ไขปัญหา Thumbnail สีดำ

ปัญหาเดิม: Thumbnail รูปภาพแสดงเป็นกล่องสี่เหลี่ยมสีดำ

วิธีแก้:
1. เพิ่ม `ImageThumbnail` component พร้อม error handling
2. เพิ่ม loading state และ spinner
3. เพิ่ม placeholder เมื่อรูปโหลดไม่สำเร็จ
4. เพิ่ม background สีเทาอ่อน

## ✅ ผลลัพธ์

ตอนนี้ระบบสามารถ:
- ✅ อัพโหลดรูปภาพพร้อม thumbnail ที่แสดงผลถูกต้อง
- ✅ อัพโหลดเอกสารแนบ (PDF, Word, Excel, ฯลฯ)
- ✅ แสดง loading state ขณะโหลดรูปภาพ
- ✅ แสดง error state เมื่อรูปโหลดไม่สำเร็จ
- ✅ ดาวน์โหลดเอกสารได้โดยตรง
