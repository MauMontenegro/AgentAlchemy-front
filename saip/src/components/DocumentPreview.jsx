import React, { useState, useEffect } from 'react';

const DocumentPreview = ({ file, containerClassName = '' }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPdf, setIsPdf] = useState(false);

  useEffect(() => {
    console.log('DocumentPreview received file:', file);
    
    if (!file) {
      setPreviewUrl('');
      setIsPdf(false);
      return;
    }

    let fileUrl = '';
    let isPdfFile = false;

    if (file instanceof File) {
      fileUrl = URL.createObjectURL(file);
      isPdfFile = file.type === 'application/pdf';
      console.log('File object - URL:', fileUrl, 'Type:', file.type, 'Name:', file.name);
    } else if (typeof file === 'string') {
      fileUrl = file;
      isPdfFile = file.toLowerCase().includes('.pdf');
      console.log('String file - URL:', fileUrl, 'Is PDF:', isPdfFile);
    } else {
      console.log('Unknown file format:', typeof file, file);
    }

    console.log('Setting preview URL:', fileUrl, 'Is PDF:', isPdfFile);
    setPreviewUrl(fileUrl);
    setIsPdf(isPdfFile);

    return () => {
      if (file instanceof File && fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [file]);

  const containerStyle = {
    width: '500px',
    height: '700px',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  if (!file) {
    return (
      <div style={containerStyle} className={containerClassName}>
        <p className="text-gray-500">No document selected</p>
      </div>
    );
  }

  if (isPdf) {
    return (
      <div style={containerStyle} className={containerClassName}>
        <iframe
          src={previewUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="PDF Preview"
        />
      </div>
    );
  }

  return (
    <div style={containerStyle} className={containerClassName}>
      <img
        src={previewUrl}
        alt="Document preview"
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
    </div>
  );
};

export default DocumentPreview;