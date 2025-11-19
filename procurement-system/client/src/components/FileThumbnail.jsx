import React from 'react';

/**
 * File Thumbnail Component
 * Displays thumbnail for images and icons for document files
 * Supports: Images (jpg, png, gif, webp), PDF, Word (doc, docx), Excel (xls, xlsx)
 */
const FileThumbnail = ({ fileUrl, fileName, fileType, onRemove, className = '' }) => {
  // Determine file type from URL or file type
  const getFileType = () => {
    if (fileType) {
      if (fileType.startsWith('image/')) return 'image';
      if (fileType.includes('pdf')) return 'pdf';
      if (fileType.includes('word') || fileType.includes('msword')) return 'word';
      if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'excel';
    }

    // Fallback to URL/filename detection
    const urlLower = (fileUrl || fileName || '').toLowerCase();
    if (urlLower.match(/\.(jpg|jpeg|png|gif|webp)/) || urlLower.startsWith('data:image/')) {
      return 'image';
    }
    if (urlLower.includes('.pdf') || urlLower.includes('application/pdf')) {
      return 'pdf';
    }
    if (urlLower.match(/\.(doc|docx)/)) {
      return 'word';
    }
    if (urlLower.match(/\.(xls|xlsx)/)) {
      return 'excel';
    }
    return 'unknown';
  };

  const type = getFileType();

  // Render image thumbnail
  if (type === 'image') {
    return (
      <div className={`relative group ${className}`}>
        <img
          src={fileUrl}
          alt={fileName || 'รูปภาพ'}
          className="w-full h-24 object-cover rounded border border-gray-300"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="ลบไฟล์"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {fileName && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate">
            {fileName}
          </div>
        )}
      </div>
    );
  }

  // Render document icon thumbnail
  const getDocumentIcon = () => {
    switch (type) {
      case 'pdf':
        return {
          icon: (
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
              <text x="10" y="14" fontSize="6" textAnchor="middle" fill="currentColor">PDF</text>
            </svg>
          ),
          color: 'text-red-600',
          bg: 'bg-red-50'
        };
      case 'word':
        return {
          icon: (
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
              <text x="10" y="14" fontSize="5" textAnchor="middle" fill="currentColor">DOC</text>
            </svg>
          ),
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        };
      case 'excel':
        return {
          icon: (
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
              <text x="10" y="14" fontSize="5" textAnchor="middle" fill="currentColor">XLS</text>
            </svg>
          ),
          color: 'text-green-600',
          bg: 'bg-green-50'
        };
      default:
        return {
          icon: (
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
            </svg>
          ),
          color: 'text-gray-600',
          bg: 'bg-gray-50'
        };
    }
  };

  const docIcon = getDocumentIcon();

  return (
    <div className={`relative group ${className}`}>
      <div className={`w-full h-24 ${docIcon.bg} rounded border border-gray-300 flex flex-col items-center justify-center p-2`}>
        <div className={docIcon.color}>
          {docIcon.icon}
        </div>
        {fileName && (
          <div className="text-xs text-gray-600 mt-1 truncate w-full text-center px-1" title={fileName}>
            {fileName.length > 15 ? fileName.substring(0, 12) + '...' : fileName}
          </div>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="ลบไฟล์"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Download link for documents */}
      {type !== 'image' && fileUrl && (
        <a
          href={fileUrl}
          download={fileName}
          className="absolute bottom-1 left-1 right-1 bg-blue-500 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <i className="fas fa-download mr-1"></i>
          ดาวน์โหลด
        </a>
      )}
    </div>
  );
};

export default FileThumbnail;
