import React from 'react';

export const Skeleton: React.FC<{
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}> = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', style }) => {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export const PalaCardSkeleton: React.FC = () => {
  return (
    <div className="card-skeuomorphic" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Skeleton height="180px" borderRadius="var(--radius-md)" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="40%" height="16px" />
        <Skeleton width="20%" height="20px" borderRadius="var(--radius-full)" />
      </div>
      <Skeleton width="80%" height="22px" />
      <Skeleton width="100%" height="12px" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        <Skeleton width="30%" height="18px" />
        <Skeleton width="30%" height="18px" />
      </div>
    </div>
  );
};
