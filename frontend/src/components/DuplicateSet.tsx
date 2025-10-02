import React from 'react';

// Define the shape of a single duplicate file
interface Duplicate {
    id: string;
    url: string;
}

// Define the shape of the props this component will receive
interface DuplicateSetProps {
    // RENAMED: 'set' is now 'duplicateSet' for better clarity
    duplicateSet: {
        id: string;
        duplicates: Duplicate[];
    };
    selectedFiles: string[];
    onSelectionChange: (filePath: string) => void;
}

// UPDATED: Destructure the new prop name
const DuplicateSet: React.FC<DuplicateSetProps> = ({ duplicateSet, selectedFiles, onSelectionChange }) => {
    return (
        <div className="duplicate-set">
            {/* UPDATED: Use the new prop name to access the data */}
            {duplicateSet.duplicates.map((duplicate, index) => (
                <div key={duplicate.id} className="duplicate-item">
                    <img 
                        src={`file://${duplicate.url}`} 
                        alt={duplicate.url} 
                        className="thumbnail"
                    />
                    <div className="file-info">
                        <p className="file-path">{duplicate.url}</p>
                        {index > 0 && (
                            <div className="delete-checkbox">
                                <input 
                                    type="checkbox" 
                                    id={`delete-${duplicate.id}`}
                                    checked={selectedFiles.includes(duplicate.url)}
                                    onChange={() => onSelectionChange(duplicate.url)}
                                />
                                <label htmlFor={`delete-${duplicate.id}`}>Select to delete</label>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DuplicateSet;
