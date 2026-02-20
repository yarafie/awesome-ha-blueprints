# Awesome HA Blueprints – Library Report

## _Generated on 2026-02-20_

## Summary

- **Controllers:** 30 blueprints, 37 versions
- **Automations:** 4 blueprints, 4 versions
- **Hooks:** 3 blueprints, 8 versions
- **Breaking versions:** 9

---

## 🚨 Breaking Changes Summary (by Category)

### Controllers

- **aqara_wxkg11lm** – EPMatt / awesome / 2025.12.22
  - Device Name and Model was corrected to Aqara WXKG11LM as it is a different device from the Xiaomi WXKG01LM. Blueprint will need to be redownloaded and setup again.
- **ikea_e1812** – EPMatt / awesome / 2025.04.12
  - Add native double press triggers and refactor the blueprint to use triggers and trigger IDs. The integration selector input is removed, and `helper_last_controller_event` is no longer required. Re-download the blueprint and reconfigure existing automations to apply the changes. (Thanks [@yarafie](https://github.com/yarafie))
- **ikea_e2001_e2002** – EPMatt / awesome / 2025.11.16
  - Blueprint was refactored to add back `helper_last_controller_event` in order to fix Long Press/Release Logic for both hooks and custom actions. This will close ([EPMatt-issue#949](https://github.com/EPMatt/awesome-ha-blueprints/issues/949)). See note at top regarding **Helper - Last Controller Event** input. ([@yarafie](https://github.com/yarafie))
- **ikea_e2001_e2002_e2313** – EPMatt / awesome / 2025.11.16
  - Blueprint was refactored to add back `helper_last_controller_event` in order to fix Long Press/Release Logic for both hooks and custom actions. This will close ([EPMatt-issue#949](https://github.com/EPMatt/awesome-ha-blueprints/issues/949)). See note at top regarding **Helper - Last Controller Event** input. ([@yarafie](https://github.com/yarafie))
- **ikea_e2001_e2002_e2313** – EPMatt / awesome / 2026.02.18
  - [Update] Added the IKEA Styrbar Model E2313. If you download this version of the blueprint you may need to and set up your automations again.
- **xiaomi_wxkg01lm** – EPMatt / awesome / 2025.12.22
  - Device Name and Model was corrected to Xiaomi WXKG01LM as it is a different device from the Aqara WXKG11LM. Blueprint will need to be redownloaded and setup again.

### Hooks

- **cover** – EPMatt / awesome / 2025.12.22
  - Device Name and Model was corrected for both Aqara WXKG11LM and Xiaomi WXKG01LM. Blueprints integrated with these two devices will need to be redownloaded and setup again.
- **light** – EPMatt / awesome / 2025.12.22
  - Device Name and Model was corrected for both Aqara WXKG11LM and Xiaomi WXKG01LM. Blueprints integrated with these two devices will need to be redownloaded and setup again.
- **media_player** – EPMatt / awesome / 2025.12.22
  - Device Name and Model was corrected for both Aqara WXKG11LM and Xiaomi WXKG01LM. Blueprints integrated with these two devices will need to be redownloaded and setup again.

## Controllers

### aqara_djt11lm

- **Title:** Controller - Aqara DJT11LM Vibration Sensor
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.10.30
- **Tags:** zigbee, sensor, vibration
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.10.30 | no       |

</details>

### aqara_wxkg11lm

- **Title:** Controller - Aqara WXKG11LM Wireless Mini Switch
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.12.22 (**🚨 Breaking Change**)
- **Tags:** zigbee, button, remote
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking               |
| ------- | ------- | ---------- | ---------------------- |
| EPMatt  | awesome | 2025.12.22 | **🚨 Breaking Change** |

**Breaking change reasons:**

- Device Name and Model was corrected to Aqara WXKG11LM as it is a different device from the Xiaomi WXKG01LM. Blueprint will need to be redownloaded and setup again.

</details>

### aqara_wxkg13lm

- **Title:** Controller - Aqara WXKG13LM Wireless Mini Switch T1
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.04.12
- **Tags:** zigbee, button, remote
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.04.12 | no       |

</details>

### ikea_e1524_e1810

- **Title:** Controller - IKEA E1524/E1810 TRÅDFRI Wireless 5-Button Remote
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2026.01.25
- **Tags:** zigbee, button, remote, 5-button
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.04.19 | no       |
| EPMatt  | awesome | 2026.01.25 | no       |

</details>

### ikea_e1743

- **Title:** Controller - IKEA E1743 TRÅDFRI On/Off Switch & Dimmer
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.10.12
- **Tags:** zigbee, dimmer, light
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.10.12 | no       |

</details>

### ikea_e1744

- **Title:** Controller - IKEA E1744 SYMFONISK Rotary Remote
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.04.19
- **Tags:** zigbee, knob, rotary, media
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.04.19 | no       |

</details>

### ikea_e1766

- **Title:** Controller - IKEA E1766 TRÅDFRI Open/Close Remote
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.04.19
- **Tags:** zigbee, remote, open-close
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.04.19 | no       |

</details>

### ikea_e1812

- **Title:** Controller - IKEA E1812 TRÅDFRI Shortcut button
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.04.12 (**🚨 Breaking Change**)
- **Tags:** zigbee, button, shortcut
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking               |
| ------- | ------- | ---------- | ---------------------- |
| EPMatt  | awesome | 2025.04.12 | **🚨 Breaking Change** |

**Breaking change reasons:**

- Add native double press triggers and refactor the blueprint to use triggers and trigger IDs. The integration selector input is removed, and `helper_last_controller_event` is no longer required. Re-download the blueprint and reconfigure existing automations to apply the changes. (Thanks [@yarafie](https://github.com/yarafie))

</details>

### ikea_e2001_e2002

- **Title:** Controller - IKEA E2001/E2002 STYRBAR Remote control
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.11.16 (**🚨 Breaking Change**)
- **Tags:** zigbee, button, remote, 4-button
<details>
<summary>Versions</summary>

| Library | Release  | Version    | Breaking               |
| ------- | -------- | ---------- | ---------------------- |
| yarafie | anything | 2025.01.06 | no                     |
| yarafie | anything | 2025.04.19 | no                     |
| EPMatt  | awesome  | 2025.11.16 | **🚨 Breaking Change** |

**Breaking change reasons:**

- Blueprint was refactored to add back `helper_last_controller_event` in order to fix Long Press/Release Logic for both hooks and custom actions. This will close ([EPMatt-issue#949](https://github.com/EPMatt/awesome-ha-blueprints/issues/949)). See note at top regarding **Helper - Last Controller Event** input. ([@yarafie](https://github.com/yarafie))

</details>

### ikea_e2001_e2002_e2313

- **Title:** Controller - IKEA E2001/E2002/E2313 STYRBAR Remote control
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2026.02.18 (**🚨 Breaking Change**)
- **Tags:** zigbee, button, remote, 4-button
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking               |
| ------- | ------- | ---------- | ---------------------- |
| EPMatt  | awesome | 2025.11.16 | **🚨 Breaking Change** |

**Breaking change reasons:**

- Blueprint was refactored to add back `helper_last_controller_event` in order to fix Long Press/Release Logic for both hooks and custom actions. This will close ([EPMatt-issue#949](https://github.com/EPMatt/awesome-ha-blueprints/issues/949)). See note at top regarding **Helper - Last Controller Event** input. ([@yarafie](https://github.com/yarafie))

| EPMatt | awesome | 2026.02.18 | **🚨 Breaking Change** |

**Breaking change reasons:**

- [Update] Added the IKEA Styrbar Model E2313. If you download this version of the blueprint you may need to and set up your automations again.

</details>

### ikea_e2123

- **Title:** Controller - IKEA E2123 SYMFONISK sound remote, gen 2
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.03.28
- **Tags:** zigbee, remote, media
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.03.28 | no       |

</details>

### ikea_e2201

- **Title:** Controller - IKEA E2201 RODRET Dimmer
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2026.02.17
- **Tags:** zigbee, dimmer, light
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.10.01 | no       |
| EPMatt  | awesome | 2026.01.28 | no       |
| EPMatt  | awesome | 2026.02.17 | no       |

</details>

### ikea_e2213

- **Title:** Controller - IKEA E2213 SOMRIG shortcut button
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.05.08
- **Tags:** zigbee, button, shortcut
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.05.08 | no       |

</details>

### ikea_ictc_g_1

- **Title:** Controller - IKEA ICTC-G-1 TRÅDFRI wireless dimmer
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.04.19
- **Tags:** zigbee, dimmer, wall
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.04.19 | no       |

</details>

### osram_ac025xx00nj

- **Title:** Controller - OSRAM AC025XX00NJ SMART+ Switch Mini
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.04.19
- **Tags:** zigbee, switch
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.04.19 | no       |

</details>

### philips_324131092621

- **Title:** Controller - Philips 324131092621 Hue Dimmer switch
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.10.16
- **Tags:** zigbee, dimmer, light
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.10.16 | no       |

</details>

### philips_8718699693985

- **Title:** Controller - Philips 8718699693985 Hue Smart Button
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.04.19
- **Tags:** zigbee, button
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.04.19 | no       |

</details>

### philips_8719514440937_8719514440999

- **Title:** Controller - Philips 8719514440937/8719514440999 Hue Tap dial switch
- **Librarians:** yarafie, Nicolai-
- **Library Maintainers:** Nicolai-, yarafie
- **Latest Version:** 2026.02.09
- **Tags:** zigbee, button, remote, rotary, 4-button
<details>
<summary>Versions</summary>

| Library  | Release | Version    | Breaking |
| -------- | ------- | ---------- | -------- |
| Nicolai- | awesome | 2026.02.09 | no       |

</details>

### philips_929002398602

- **Title:** Controller - Philips 929002398602 Hue Dimmer switch v2
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.10.16
- **Tags:** zigbee, dimmer, light
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.10.16 | no       |

</details>

### shelly_button_1

- **Title:** Controller - Shelly Button 1
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.04.12
- **Tags:** wifi, button
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.04.12 | no       |

</details>

### shelly_snsn_0024x

- **Title:** Controller - Shelly SNSN-0024x Plus i4 with Wall switch 4
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.03.25
- **Tags:** wifi, wall-switch, input-module
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.03.25 | no       |

</details>

### smarthjemmet_dk_quad_zig_sw

- **Title:** Controller - Smarthjemmet.dk QUAD-ZIG-SW 4 button remote
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.03.03
- **Tags:** zigbee, button, remote, 4-button
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.03.03 | no       |

</details>

### sonoff_snzb01

- **Title:** Controller - SONOFF SNZB-01 Wireless Switch
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.04.19
- **Tags:** zigbee, button
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.04.19 | no       |

</details>

### sonoff_snzb01p

- **Title:** Controller - SONOFF SNZB-01P Wireless Button
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2026.02.20
- **Tags:** zigbee, button
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2026.02.20 | no       |

</details>

### tuya_ers_10tzbvk_aa

- **Title:** Controller - Tuya ERS-10TZBVK-AA Smart knob
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2026.02.17
- **Tags:** zigbee, knob, rotary
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.03.29 | no       |
| EPMatt  | awesome | 2026.02.17 | no       |

</details>

### tuya_zg_101z_d

- **Title:** Controller - Tuya ZG-101Z/D Smart knob
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.10.14
- **Tags:** zigbee, knob, rotary
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.10.14 | no       |

</details>

### xiaomi_wxcjkg11lm

- **Title:** Controller - Xiaomi WXCJKG11LM Aqara Opple 2 button remote
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.04.19
- **Tags:** zigbee, button, remote, 2-button
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.04.19 | no       |

</details>

### xiaomi_wxcjkg12lm

- **Title:** Controller - Xiaomi WXCJKG12LM Aqara Opple 4 button remote
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.04.19
- **Tags:** zigbee, button, remote, 4-button
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.04.19 | no       |

</details>

### xiaomi_wxcjkg13lm

- **Title:** Controller - Xiaomi WXCJKG13LM Aqara Opple 6 button remote
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.04.19
- **Tags:** zigbee, button, remote, 6-button
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2025.04.19 | no       |

</details>

### xiaomi_wxkg01lm

- **Title:** Controller - Xiaomi WXKG01LM Mi Wireless Switch
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2025.12.22 (**🚨 Breaking Change**)
- **Tags:** zigbee, button, remote
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking               |
| ------- | ------- | ---------- | ---------------------- |
| EPMatt  | awesome | 2025.12.22 | **🚨 Breaking Change** |

**Breaking change reasons:**

- Device Name and Model was corrected to Xiaomi WXKG01LM as it is a different device from the Aqara WXKG11LM. Blueprint will need to be redownloaded and setup again.

</details>

## Automations

### addon_update_notification

- **Title:** Send a mobile notification when add-on update is available
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2021.10.26
- **Tags:** addon, event, mobile, notification, notify, sensor, supervisor, update
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2021.10.26 | no       |

</details>

### on_off_schedule_state_persistence

- **Title:** On-Off schedule with state persistence
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2021.10.26
- **Tags:** event, schedule, time
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2021.10.26 | no       |

</details>

### persistent_notification_to_mobile

- **Title:** Send Web UI persistent notifications to Mobile Devices
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2021.10.26
- **Tags:** event, mobile, notification, notify
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2021.10.26 | no       |

</details>

### simple_safe_scheduler

- **Title:** Simple Safe Scheduler
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2021.10.22
- **Tags:** event, schedule, time
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking |
| ------- | ------- | ---------- | -------- |
| EPMatt  | awesome | 2021.10.22 | no       |

</details>

## Hooks

### cover

- **Title:** Hook - Cover
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2026.02.20
- **Tags:** close, garage, open, stop
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking               |
| ------- | ------- | ---------- | ---------------------- |
| EPMatt  | awesome | 2025.12.22 | **🚨 Breaking Change** |

**Breaking change reasons:**

- Device Name and Model was corrected for both Aqara WXKG11LM and Xiaomi WXKG01LM. Blueprints integrated with these two devices will need to be redownloaded and setup again.

| EPMatt | awesome | 2026.02.20 | no |

</details>

### light

- **Title:** Hook - Light
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2026.02.20
- **Tags:** brightness, color, dim, hue, light, off, on
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking               |
| ------- | ------- | ---------- | ---------------------- |
| EPMatt  | awesome | 2025.12.22 | **🚨 Breaking Change** |

**Breaking change reasons:**

- Device Name and Model was corrected for both Aqara WXKG11LM and Xiaomi WXKG01LM. Blueprints integrated with these two devices will need to be redownloaded and setup again.

| EPMatt | awesome | 2026.02.09 | no |
| EPMatt | awesome | 2026.02.20 | no |

</details>

### media_player

- **Title:** Hook - Media Player
- **Librarians:** yarafie, EPMatt
- **Library Maintainers:** EPMatt, yarafie
- **Latest Version:** 2026.02.20
- **Tags:** forward, mute, next, pause, play, previous, reverse, stop, volume
<details>
<summary>Versions</summary>

| Library | Release | Version    | Breaking               |
| ------- | ------- | ---------- | ---------------------- |
| EPMatt  | awesome | 2025.12.22 | **🚨 Breaking Change** |

**Breaking change reasons:**

- Device Name and Model was corrected for both Aqara WXKG11LM and Xiaomi WXKG01LM. Blueprints integrated with these two devices will need to be redownloaded and setup again.

| EPMatt | awesome | 2026.02.17 | no |
| EPMatt | awesome | 2026.02.20 | no |

</details>
