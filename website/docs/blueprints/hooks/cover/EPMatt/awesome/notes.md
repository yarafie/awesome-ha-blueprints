## Description

This Hook blueprint allows to build a controller-based automation to control a cover. Supports opening, closing and tilting the cover.

## Requirements

### Cover Integration

This integration provides the entity which represents a cover in Home Assistant. It should be activated by default so unless you tweaked the default configuration you're good to go.

[Cover Integration Docs](https://www.home-assistant.io/integrations/cover/)

## Additional Notes

If you want to link multiple covers to the same controller you can either use [Cover Groups](https://www.home-assistant.io/integrations/cover.group/) or build multiple Hooks linked to the same Controller.
