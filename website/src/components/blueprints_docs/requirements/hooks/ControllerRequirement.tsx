import React from 'react'
import CustomRequirement from '../CustomRequirement'

interface ControllerRequirementProps {
  required: boolean
  children: React.ReactNode
}

const ControllerRequirement: React.FC<ControllerRequirementProps> = ({
  required,
  children,
}) => {
  return (
    <CustomRequirement name='Controller Automation' required={required}>
      <p>
        To use this blueprint you need to first create an automation with a
        Controller blueprint. You can then create an automation with this Hook,{' '}
        <b>
          making sure that you provide the same controller device used in the
          corresponding Controller blueprint
        </b>
        . This key step will link the two automations and ensure the Hook will
        respond to events fired by the Controller.
      </p>
      <p>{children}</p>
      <a href='#supported-controllers'>List of Supported Controllers</a> -{' '}
      <a href='https://yarafie.github.io/awesome-ha-blueprints/blueprints/controllers'>
        Controllers Docs
      </a>
    </CustomRequirement>
  )
}

export default ControllerRequirement
