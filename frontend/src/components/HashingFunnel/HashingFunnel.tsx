import React from 'react';
import './HashingFunnel.css';

const HashingFunnel = () => {
  return (
    <div className="container">
      <div className="funnel-outline"></div>
      <div className="funnel"></div>
      <div className="photo"></div>
      <div className="hash-output">
        <div className="hash-label">HASH</div>
      </div>
    </div>
  );
};

export default HashingFunnel;