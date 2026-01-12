import React from 'react'

interface BlueprintImageProps {
  children: React.ReactNode
}

const BlueprintImage: React.FC<BlueprintImageProps> = ({ children }) => {
  return <div style={{ width: 200 }}>{children}</div>
}

export default BlueprintImage
