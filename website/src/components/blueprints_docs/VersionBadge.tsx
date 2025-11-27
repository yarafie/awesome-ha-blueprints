import React from 'react'

interface VersionBadgeProps {
  version: string
  breaking?: boolean
}

const VersionBadge: React.FC<VersionBadgeProps> = ({ version, breaking }) => {
  const style: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 600,
    backgroundColor: breaking
      ? 'var(--ifm-color-danger)'
      : 'var(--ifm-color-success)',
    color: '#fff',
    marginLeft: '8px',
  }

  return (
    <span style={style}>{breaking ? `v${version} ⚠️` : `v${version}`}</span>
  )
}

export default VersionBadge
