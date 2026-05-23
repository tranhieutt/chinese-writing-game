'use client';

import React from 'react';

interface Group {
  id: string;
  label: string;
  icon: string;
  chars: Array<any>;
}

interface GroupTabsProps {
  groups: Group[];
  activeGroupId: string;
  onSelectGroup: (id: string) => void;
  disabled?: boolean;
}

export const GroupTabs: React.FC<GroupTabsProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  disabled = false,
}) => {
  return (
    <div className="group-tabs" id="group-tabs">
      {groups.map((g) => (
        <button
          key={g.id}
          type="button"
          className={`group-tab${g.id === activeGroupId ? ' active' : ''}`}
          onClick={() => onSelectGroup(g.id)}
          disabled={disabled}
        >
          {g.icon} {g.label} <span className="tab-count">{g.chars.length}</span>
        </button>
      ))}
    </div>
  );
};
