import React from 'react';

interface ImageGalleryProps {
  imageUrls: string[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ imageUrls }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {imageUrls.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`image-${index}`}
          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
        />
      ))}
    </div>
  );
};

export default ImageGallery;
