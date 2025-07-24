import React, { useState, useEffect } from 'react';

// Fixed dimensions for the preview
const PREVIEW_WIDTH = 500;  // Fixed width in pixels
const PREVIEW_HEIGHT = 700; // Fixed height in pixels

const DocumentPreview = ({ file, containerClassName = '' }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPdf, setIsPdf] = useState(false);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT });

  // Determine file type and create object URL
  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }

    const fileUrl = file instanceof File ? URL.createObjectURL(file) : file;
    const isPdfFile = file.type === 'application/pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf'));
    
    setPreviewUrl(fileUrl);
    setIsPdf(isPdfFile);
    setError(null);

    // Calculate aspect ratio for images
    if (!isPdfFile) {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        let width = PREVIEW_WIDTH;
        let height = PREVIEW_HEIGHT;
        
        // Maintain aspect ratio while fitting within the fixed dimensions
        if (aspectRatio > 1) {
          // Landscape
          height = width / aspectRatio;
        } else {
          // Portrait or square
          width = height * aspectRatio;
        }
        
        setDimensions({ width, height });
      };
      img.src = fileUrl;
    }

    // Cleanup object URL on unmount
    return () => {
      if (file instanceof File && fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [file]);

  // Handle image load errors
  const handleImageError = () => {
    setError('Failed to load image preview');
  };

  // Handle iframe load errors
  const handleIframeError = () => {
    setError('Failed to load PDF preview');
  };

  // Fixed size container style
  const containerStyle = {
    width: `${PREVIEW_WIDTH}px`,
    height: `${PREVIEW_HEIGHT}px`,
    maxWidth: '100%',
    overflow: 'hidden',
    backgroundColor: '#f9fafb', // bg-gray-50
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e5e7eb', // border-gray-200
    borderRadius: '0.5rem', // rounded-lg
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' // shadow-sm
  };

  // If no file is provided, show a placeholder
  if (!file) {
    return (
      <div style={containerStyle} className={containerClassName}>
        <p className="text-gray-500">No document selected</p>
      </div>
    );
  }

  // If there was an error loading the preview
  if (error) {
    return (
      <div style={containerStyle} className={`flex-col p-4 ${containerClassName}`}>
        <p className="text-red-500 mb-2 text-center">{error}</p>
        <a 
          href={previewUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-500 hover:underline text-sm text-center block"
        >
          Open in new tab
        </a>
      </div>
    );
  }

  // Render PDF preview using iframe
  if (isPdf) {
    return (
      <div style={containerStyle} className={containerClassName}>
        <iframe
          src={`${previewUrl}#toolbar=0&navpanes=0`}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: 'white'
          }}
          title="PDF Preview"
          onError={handleIframeError}
        >
          <p>Your browser doesn't support iframes. <a href={previewUrl} className="text-blue-500 hover:underline">Download PDF</a></p>
        </iframe>
      </div>
    );
  }

  // Render image preview
  return (
    <div style={containerStyle} className={containerClassName}>
      <div style={{
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'white'
      }}>
        <img
          src={previewUrl}
          alt="Document preview"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            width: dimensions.width,
            height: dimensions.height
          }}
          onError={handleImageError}
        />
      </div>
    </div>
  );
};

export default DocumentPreview;