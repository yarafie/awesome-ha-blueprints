import React from 'react'
import Link from '@docusaurus/Link'
import { ChevronRight } from 'react-bootstrap-icons'

interface BlueprintItemProps {
  id: string
  title: string
  description: string
  category: string

  // NEW — allows external components to override routing
  overrideUrl?: string
}

const BlueprintItem: React.FC<BlueprintItemProps> = ({
  id,
  title,
  description,
  category,
  overrideUrl,
}) => {
  // Determine final link:
  // 1️⃣ If parent passed overrideUrl → use it
  // 2️⃣ Otherwise → compute fallback-aware URL automatically
  const finalUrl = resolveBlueprintSource(category, id)

  return (
    <Link to={finalUrl} className='card margin-bottom--md'>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
        }}
      >
        <div>
          <h3>{title}</h3>
        </div>

        <div className='card__body'>
          <p>{description}</p>
        </div>

        <div
          className='card__footer'
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <ChevronRight size={20} />
        </div>
      </div>
    </Link>
  )
}

export default BlueprintItem
