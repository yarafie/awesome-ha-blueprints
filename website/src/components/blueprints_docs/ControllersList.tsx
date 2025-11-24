import React from 'react'
import BlueprintItem from './BlueprintItem'
import { resolveBlueprintSource } from '../../utils'

const ControllersList = ({ items }) => {
  if (!items || items.length === 0) {
    return <p>No controllers found.</p>
  }

  return (
    <div className='row'>
      {items.map((item) => {
        const { id, title, description, category } = item

        // Determine resolved path + optional override URL for new library system
        const resolved = resolveBlueprintSource(category, id)

        return (
          <div key={id} className='col col--4 margin-bottom--lg'>
            <BlueprintItem
              id={id}
              title={title}
              description={description}
              category={category}
              overrideUrl={resolved.overrideUrl}
            />
          </div>
        )
      })}
    </div>
  )
}

export default ControllersList
