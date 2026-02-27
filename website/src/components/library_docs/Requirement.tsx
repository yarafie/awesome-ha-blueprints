/**
 * Component: Requirement
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *   Dispatches and renders a single requirement entry by delegating
 *   to a specific requirement component under ./requirements.
 *
 * Authoring Model:
 *   - Used directly in MDX
 *   - Requirement behavior implemented per component
 *
 * LOCKED:
 *   - Component-based registry
 *   - No JSON-driven inference
 *   - Legacy behavior preserved
 *
 * ────────────────────────────────────────────────────────────────
 */
import React from 'react'

import Zigbee2MQTTRequirement from './requirements/controllers/Zigbee2MQTTRequirement'
import ZHARequirement from './requirements/controllers/ZHARequirement'
import DeCONZRequirement from './requirements/controllers/DeCONZRequirement'
import ShellyRequirement from './requirements/controllers/ShellyRequirement'
import MatterRequirement from './requirements/controllers/MatterRequirement'
import ControllerRequirement from './requirements/hooks/ControllerRequirement'
import CustomRequirement from './requirements/CustomRequirement'

const requirements: Record<string, React.FC<any>> = {
  zigbee2mqtt: Zigbee2MQTTRequirement,
  zha: ZHARequirement,
  deconz: DeCONZRequirement,
  shelly: ShellyRequirement,
  matter: MatterRequirement,
  controller: ControllerRequirement,
}

export interface RequirementProps {
  id?: string
  name?: string
  required?: boolean
  refers?: string
  children?: React.ReactNode
}

const Requirement: React.FC<RequirementProps> = ({
  id,
  required = false,
  name,
  refers,
  children,
}) => {
  const Component = id ? requirements[id] : CustomRequirement

  return (
    <Component name={name} required={required} refers={refers}>
      {children}
    </Component>
  )
}

export default Requirement
