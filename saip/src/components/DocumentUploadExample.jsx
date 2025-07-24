import React, { useState } from 'react';
import DocumentPreview from './DocumentPreview';

const DocumentUploadExample = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is an image or PDF
      if (
        file.type.startsWith('image/') ||
        file.type === 'application/pdf'
      ) {
        setSelectedFile(file);
      } else {
        alert('Please select an image or PDF file');
      }
    }
  };

  return (
    <div className="p-4">
      {/* Fixed size container for document preview */}
      <div className="w-full max-w-2xl mx-auto mb-3">
        <DocumentPreview
          file={selectedFile}
          containerClassName="w-full h-[700px] border border-gray-300 rounded-lg"
        />
      </div>

      {/* Compact upload section */}
      <div className="w-full max-w-xl mx-auto">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-3 file:py-1.5 file:px-3
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
    </div>
  );
};

export default DocumentUploadExample;