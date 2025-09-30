import React, { useRef } from 'react';

interface FileUploadProps {
  onDirectoryChange: (files: FileList | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDirectoryChange }) => {
  console.log('--- FileUpload FileUploadProps called---');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    console.log('--- FileUpload handleClick called---');
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('--- FileUpload handleChange called---');
    onDirectoryChange(event.target.files);
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleChange}
        style={{ display: 'none' }}
        ref={inputRef}
        {...{ webkitdirectory: "", directory: "", multiple: true }}
      />
      <button onClick={handleClick}>
        Select Directory to Scan
      </button>
    </div>
  );
};

export default FileUpload;

