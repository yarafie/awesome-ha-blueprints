import React from 'react'
import Link from '@docusaurus/Link'
import { ChevronRight } from 'react-bootstrap-icons'

interface BlueprintItemProps {
  id: string
  title: string
  description: string
  category: string
  overrideUrl?: string
}

const BlueprintItem: React.FC<BlueprintItemProps> = ({
  id,
  title,
  description,
  category,
  overrideUrl,
}) => {
  const libUrl = `/awesome-ha-blueprints/library/${category}/${id}`

  // Use overrideUrl only when provided
  const finalUrl = overrideUrl ?? libUrl

  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
  }

  const footerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
  }

  return (
    <Link to={finalUrl} className='card margin-bottom--md'>
      <div style={cardStyle}>
        <div>
          <h3>{title}</h3>
        </div>

        <div className='card__body'>
          <p>{description}</p>
        </div>

        <div className='card__footer' style={footerStyle}>
          <ChevronRight size={20} />
        </div>
      </div>
    </Link>
  )
}

export default BlueprintItem
