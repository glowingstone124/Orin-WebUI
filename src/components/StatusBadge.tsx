import React from 'react';
import { JobStatusType } from '../types/orin';

interface StatusBadgeProps {
  status: JobStatusType | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase();

  let colorStyle = {
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--card-background)',
    borderColor: 'var(--split)',
  };

  if (normalized === 'SUCCESS') {
    colorStyle = {
      color: 'var(--success)',
      backgroundColor: 'color-mix(in srgb, var(--success) 10%, transparent)',
      borderColor: 'var(--success)',
    };
  } else if (normalized === 'FAILED') {
    colorStyle = {
      color: 'var(--error)',
      backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)',
      borderColor: 'var(--error)',
    };
  } else if (normalized === 'RUNNING') {
    colorStyle = {
      color: 'var(--primary)',
      backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
      borderColor: 'var(--primary)',
    };
  } else if (normalized === 'QUEUED') {
    colorStyle = {
      color: 'var(--warning)',
      backgroundColor: 'color-mix(in srgb, var(--warning) 10%, transparent)',
      borderColor: 'var(--warning)',
    };
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        border: `1px solid ${colorStyle.borderColor}`,
        backgroundColor: colorStyle.backgroundColor,
        color: colorStyle.color,
        fontFamily: 'var(--font-mono)',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          marginRight: '6px',
          backgroundColor: colorStyle.color,
        }}
      />
      {normalized}
    </span>
  );
};
