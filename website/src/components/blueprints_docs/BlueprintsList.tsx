import React from 'react'
import BlueprintItem from './BlueprintItem'
import { getBlueprintUrl } from '../../utils'

interface Blueprint {
  id: string
  title: string
  description: string
}

interface CategoryBlueprints {
  category: string
  blueprints: Blueprint[]
}

interface BlueprintsListProps {
  items: CategoryBlueprints
}

const BlueprintsList: React.FC<BlueprintsListProps> = ({ items }) => {
  const { category, blueprints } = items

  return (
    <div className='margin-bottom--lg'>
      <h2>{category}</h2>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {blueprints.map((bp) => {
          const url = getBlueprintUrl(category, bp.id)
          return (
            <li key={bp.id}>
              <BlueprintItem
                id={bp.id}
                title={bp.title}
                description={bp.description}
                category={category}
                overrideUrl={url}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default BlueprintsList
