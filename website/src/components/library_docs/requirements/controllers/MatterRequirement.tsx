import CustomRequirement from '../CustomRequirement'

interface MatterRequirementProps {
  required: boolean
  refers: string
  children: React.ReactNode
}

function MatterRequirement({
  required,
  refers,
  children,
}: MatterRequirementProps) {
  return (
    <CustomRequirement name='Matter Integration' required={required}>
      <p>
        If you plan to integrate the {refers} with Matter, you must have this
        integration set up. The Matter integration can be configured from the
        Home Assistant UI. Check the documentation for full details on the
        required hardware and how to set up Matter on your system.
      </p>
      <p>{children}</p>
      <a href='https://www.home-assistant.io/integrations/matter/'>
        Matter Integration Docs
      </a>
    </CustomRequirement>
  )
}

export default MatterRequirement
