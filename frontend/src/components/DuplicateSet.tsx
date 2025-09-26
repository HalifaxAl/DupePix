import React from 'react';

interface Duplicate {
  id: string;
  url: string;
}

interface DuplicateSetProps {
  duplicates: Duplicate[];
  onSelect: (id: string, selected: boolean) => void;
}

const DuplicateSet: React.FC<DuplicateSetProps> = ({ duplicates, onSelect }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h3>Duplicate Set</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {duplicates.map((duplicate) => (
          <div key={duplicate.id}>
            <img
              src={duplicate.url}
              alt={`duplicate-${duplicate.id}`}
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
            <div>
              <input
                type="checkbox"
                onChange={(e) => onSelect(duplicate.id, e.target.checked)}
              />
              <label>Select to delete</label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DuplicateSet;
