// HashingAnimation.tsx
import React from 'react';
import './HashingAnimation.css';

const HashingAnimation = () => {
  // Create the correct path to the image in the public folder
  const characterStyle = {
    backgroundImage: `url(${process.env.PUBLIC_URL}/cat_character.png)`
  };

  return (
    <div className="animation-container">
      <div className="photo-booth">
        <div className="photo-booth-curtain"></div>
      </div>
      {/* Apply the style directly to the element */}
      <div className="photo-character" style={characterStyle}></div>
      <div className="flash"></div>
      <div className="hash-output">0x...a1b2c3d4</div>
    </div>
  );
};

export default HashingAnimation;
