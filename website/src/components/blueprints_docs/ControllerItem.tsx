import React from 'react'
import Link from '@docusaurus/Link'
import { ChevronRight } from 'react-bootstrap-icons'
import { getBlueprintDocsPath } from '../../utils'

interface ControllerItemProps {
  id: string
  model: string
  manufacturer: string | string[]
  integrations: string[]
  image: string
  model_name: string
}

const cardStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.25rem',
  border: '1px solid var(--ifm-color-emphasis-200)',
  borderRadius: 'var(--ifm-global-radius)',
  backgroundColor: 'var(--ifm-background-surface-color)',
  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  textDecoration: 'none',
}

const cardHoverStyle: React.CSSProperties = {
  boxShadow: 'var(--ifm-global-shadow-md)',
  borderColor: 'var(--ifm-color-primary)',
}

const imageStyle: React.CSSProperties = {
  width: '84px',
  height: '84px',
  objectFit: 'contain',
  borderRadius: 'var(--ifm-global-radius)',
  backgroundColor: 'var(--ifm-color-emphasis-100)',
  padding: '0.5rem',
}

const contentStyle: React.CSSProperties = {
  flexGrow: 1,
  marginLeft: '1rem',
}

const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  color: 'var(--ifm-color-emphasis-700)',
}

const ControllerItem: React.FC<ControllerItemProps> = ({
  id,
  model,
  manufacturer,
  integrations,
  image,
  model_name,
}) => {
  const href = getBlueprintDocsPath('controllers', id)

  return (
    <Link
      to={href}
      className='controller-item-link'
      style={{ textDecoration: 'none' }}
    >
      <div
        className='card__container'
        style={cardStyle}
        onMouseEnter={(e) =>
          Object.assign(e.currentTarget.style, cardHoverStyle)
        }
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
      >
        <img src={image} alt={model} style={imageStyle} />
        <div style={contentStyle}>
          <h3 style={{ margin: '0 0 0.25rem 0' }}>{model_name}</h3>
          <p style={{ margin: '0 0 0.25rem 0' }}>
            <strong>Manufacturer:</strong>{' '}
            {Array.isArray(manufacturer)
              ? manufacturer.join(', ')
              : manufacturer}
          </p>
          <p style={{ margin: '0' }}>
            <strong>Integrations:</strong> {integrations.join(', ')}
          </p>
        </div>
        <div className='card__footer' style={footerStyle}>
          <ChevronRight size={20} />
        </div>
      </div>
    </Link>
  )
}

export default ControllerItem
