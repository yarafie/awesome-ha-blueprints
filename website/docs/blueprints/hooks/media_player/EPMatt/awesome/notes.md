## Requirements

### Media Player Integration

This integration provides the entity which represents a media player in Home Assistant. It should be activated by default so unless you tweaked the default configuration you're good to go.

[Media Player Integration Docs](https://www.home-assistant.io/integrations/media_player/)

## Additional Notes

Not all media players support the customization of the number of steps for volume control, due to the fact that some of them do not expose their current volume level to Home Assistant. In these situations, the automation will fallback to the `media_player.volume_up` and `media_player.volume_down` services.
