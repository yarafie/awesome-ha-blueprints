"use strict";(self.webpackChunkawesome_ha_blueprints_website=self.webpackChunkawesome_ha_blueprints_website||[]).push([[6476],{4154:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>a,contentTitle:()=>d,default:()=>u,frontMatter:()=>l,metadata:()=>s,toc:()=>h});const s=JSON.parse('{"id":"blueprints/controllers/ikea_e1524_e1810","title":"Controller - IKEA E1524/E1810 TR\xc5DFRI Wireless 5-Button Remote","description":"Controller automation for executing any kind of action triggered by the provided IKEA E1524/E1810 TR\xc5DFRI Wireless 5-Button Remote. Supports Zigbee2MQTT, ZHA, deCONZ.","source":"@site/docs/blueprints/controllers/ikea_e1524_e1810.mdx","sourceDirName":"blueprints/controllers","slug":"/blueprints/controllers/ikea_e1524_e1810","permalink":"/awesome-ha-blueprints/docs/blueprints/controllers/ikea_e1524_e1810","draft":false,"unlisted":false,"editUrl":"https://github.com/yarafie/awesome-ha-blueprints/edit/main/docs/blueprints/controllers/ikea_e1524_e1810.mdx","tags":[],"version":"current","frontMatter":{"title":"Controller - IKEA E1524/E1810 TR\xc5DFRI Wireless 5-Button Remote","description":"Controller automation for executing any kind of action triggered by the provided IKEA E1524/E1810 TR\xc5DFRI Wireless 5-Button Remote. Supports Zigbee2MQTT, ZHA, deCONZ."}}');var i=t(7557),o=t(7389),r=t(5561);const l={title:"Controller - IKEA E1524/E1810 TR\xc5DFRI Wireless 5-Button Remote",description:"Controller automation for executing any kind of action triggered by the provided IKEA E1524/E1810 TR\xc5DFRI Wireless 5-Button Remote. Supports Zigbee2MQTT, ZHA, deCONZ."},d=void 0,a={},h=[{value:"Description",id:"description",level:2},{value:"Requirements",id:"requirements",level:2},{value:"Inputs",id:"inputs",level:2},{value:"Available Hooks",id:"available-hooks",level:2},{value:"Light",id:"light",level:3},{value:"Default Mapping",id:"default-mapping",level:4},{value:"Media Player",id:"media-player",level:3},{value:"Default Mapping",id:"default-mapping-1",level:4},{value:"Cover",id:"cover",level:3},{value:"Default Mapping",id:"default-mapping-2",level:4},{value:"Additional Notes",id:"additional-notes",level:2},{value:"Helper - Last Controller Event",id:"helper---last-controller-event",level:3},{value:"Virtual double press events",id:"virtual-double-press-events",level:3},{value:"Center button long press",id:"center-button-long-press",level:3},{value:"Issues with the E1810 model firing bad events",id:"issues-with-the-e1810-model-firing-bad-events",level:3},{value:"Changelog",id:"changelog",level:2}];function c(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",strong:"strong",ul:"ul",...(0,o.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(r._x,{id:"ikea_e1524_e1810",category:"controllers"}),"\n",(0,i.jsx)("br",{}),"\n",(0,i.jsx)(n.admonition,{type:"tip",children:(0,i.jsxs)(n.p,{children:["This blueprint is part of the ",(0,i.jsx)(n.strong,{children:"Controllers-Hooks Ecosystem"}),". You can read more about this topic ",(0,i.jsx)(n.a,{href:"/docs/controllers-hooks-ecosystem",children:"here"}),"."]})}),"\n",(0,i.jsx)(n.h2,{id:"description",children:"Description"}),"\n",(0,i.jsx)(n.p,{children:"This blueprint provides universal support for running any custom action when a button is pressed on the provided IKEA E1524/E1810 TR\xc5DFRI Wireless 5-Button Remote. Supports controllers integrated with Zigbee2MQTT, ZHA, deCONZ. Just specify the integration used to connect the remote to Home Assistant when setting up the automation, and the blueprint will take care of all the rest."}),"\n",(0,i.jsx)(n.p,{children:"In addition of being able to provide custom actions for every kind of button press supported by the remote, the blueprint allows to loop the long press actions while the corresponding button is being held. Once released, the loop stops. This is useful when holding down a button should result in a continuous action (such as lowering the volume of a media player, or controlling a light brightness)."}),"\n",(0,i.jsx)(n.p,{children:"The blueprint also adds support for virtual double button press events, which are not exposed by the controller itself."}),"\n",(0,i.jsx)(n.admonition,{type:"tip",children:(0,i.jsxs)(n.p,{children:["Automations created with this blueprint can be connected with one or more ",(0,i.jsx)(n.a,{href:"/docs/blueprints/hooks",children:"Hooks"})," supported by this controller.\nHooks allow to easily create controller-based automations for interacting with media players, lights, covers and more. See the list of ",(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e1524_e1810#available-hooks",children:"Hooks available for this controller"})," for additional details."]})}),"\n",(0,i.jsx)(n.h2,{id:"requirements",children:"Requirements"}),"\n",(0,i.jsx)(r.Kg,{id:"zigbee2mqtt"}),"\n",(0,i.jsx)(r.Kg,{id:"zha"}),"\n",(0,i.jsx)(r.Kg,{id:"deconz"}),"\n",(0,i.jsxs)(r.Kg,{name:"Input Text Integration",required:!0,children:[(0,i.jsxs)(n.p,{children:["This integration provides the entity which must be provided to the blueprint in the ",(0,i.jsx)(n.strong,{children:"Helper - Last Controller Event"})," input. Learn more about this helper by reading the dedicated section in the ",(0,i.jsx)(n.a,{href:"#helper---last-controller-event",children:"Additional Notes"}),"."]}),(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"https://www.home-assistant.io/integrations/input_text/",children:"Input Text Integration Docs"})})]}),"\n",(0,i.jsx)(n.h2,{id:"inputs",children:"Inputs"}),"\n",(0,i.jsx)(r.G0,{category:"controllers",id:"ikea_e1524_e1810"}),"\n",(0,i.jsx)(n.h2,{id:"available-hooks",children:"Available Hooks"}),"\n",(0,i.jsx)(n.admonition,{title:"Virtual double press actions",type:"note",children:(0,i.jsx)(n.p,{children:"Some of the following mappings might include actions for virtual double press events, which are disabled by default.\nIf you are using a hook mapping which provides an action for a virtual double press event, please make sure to enable support for virtual double press on the corresponding buttons with the corresponding blueprint input."})}),"\n",(0,i.jsx)(n.h3,{id:"light",children:"Light"}),"\n",(0,i.jsx)(n.p,{children:"This Hook blueprint allows to build a controller-based automation to control a light. Supports brightness and color control both for white temperature and rgb lights."}),"\n",(0,i.jsx)(n.h4,{id:"default-mapping",children:"Default Mapping"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Up button short press -> Brightness up"}),"\n",(0,i.jsx)(n.li,{children:"Up button long press -> Brightness up (continuous, until release)"}),"\n",(0,i.jsx)(n.li,{children:"Down button short press -> Brightness down"}),"\n",(0,i.jsx)(n.li,{children:"Down button long press -> Brightness down (continuous, until release)"}),"\n",(0,i.jsx)(n.li,{children:"Left button short press -> Color down"}),"\n",(0,i.jsx)(n.li,{children:"Left button long press -> Color down (continuous, until release)"}),"\n",(0,i.jsx)(n.li,{children:"Right button short press -> Color up"}),"\n",(0,i.jsx)(n.li,{children:"Right button long press -> Color up (continuous, until release)"}),"\n",(0,i.jsx)(n.li,{children:"Center button short press -> Toggle"}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/hooks/light",children:"Light Hook docs"})}),"\n",(0,i.jsx)(n.h3,{id:"media-player",children:"Media Player"}),"\n",(0,i.jsx)(n.p,{children:"This Hook blueprint allows to build a controller-based automation to control a media player. Supports volume setting, play/pause and track selection."}),"\n",(0,i.jsx)(n.h4,{id:"default-mapping-1",children:"Default Mapping"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Up button short press -> Volume up"}),"\n",(0,i.jsx)(n.li,{children:"Up button long press -> Volume up (continuous, until release)"}),"\n",(0,i.jsx)(n.li,{children:"Down button short press -> Volume down"}),"\n",(0,i.jsx)(n.li,{children:"Down button long press -> Volume down (continuous, until release)"}),"\n",(0,i.jsx)(n.li,{children:"Left button short press -> Previous track"}),"\n",(0,i.jsx)(n.li,{children:"Right button short press -> Next track"}),"\n",(0,i.jsx)(n.li,{children:"Center button short press -> Play/Pause"}),"\n",(0,i.jsx)(n.li,{children:"Center button long press -> Stop"}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/hooks/media_player",children:"Media Player Hook docs"})}),"\n",(0,i.jsx)(n.h3,{id:"cover",children:"Cover"}),"\n",(0,i.jsx)(n.p,{children:"This Hook blueprint allows to build a controller-based automation to control a cover. Supports opening, closing and tilting the cover."}),"\n",(0,i.jsx)(n.h4,{id:"default-mapping-2",children:"Default Mapping"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Up button short press -> Open cover"}),"\n",(0,i.jsx)(n.li,{children:"Down button short press -> Close cover"}),"\n",(0,i.jsx)(n.li,{children:"Left button short press -> Close the cover tilt"}),"\n",(0,i.jsx)(n.li,{children:"Right button short press -> Open the cover tilt"}),"\n",(0,i.jsx)(n.li,{children:"Center button short press -> Stop cover and cover tilt"}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/hooks/cover",children:"Cover Hook docs"})}),"\n",(0,i.jsx)(n.h2,{id:"additional-notes",children:"Additional Notes"}),"\n",(0,i.jsx)(n.h3,{id:"helper---last-controller-event",children:"Helper - Last Controller Event"}),"\n",(0,i.jsxs)(n.p,{children:["The ",(0,i.jsx)(n.code,{children:"helper_last_controller_event"})," (Helper - Last Controller Event) input serves as a permanent storage area for the automation. The stored info is used to implement the blueprint's core functionality. To learn more about the helper, how it's used and why it's required, you can read the dedicated section in the ",(0,i.jsx)(n.a,{href:"/docs/controllers-hooks-ecosystem#helper---last-controller-event-input",children:"Controllers-Hooks Ecosystem documentation"}),"."]}),"\n",(0,i.jsx)(n.p,{children:"The helper is used to determine button release events when the controller is integrated with ZHA, because of the actions mapping for the controller with these integrations. Natively, the controller doesn't allow to distinguish between different button release events, so the blueprint must store the previous clicked button."}),"\n",(0,i.jsx)(n.h3,{id:"virtual-double-press-events",children:"Virtual double press events"}),"\n",(0,i.jsxs)(n.p,{children:["It's also important to note that the controller doesn't natively support double press events. Instead , this blueprint provides virtual double press events. You can read more about them in the ",(0,i.jsx)(n.a,{href:"/docs/controllers-hooks-ecosystem#virtual-events",children:"general Controllers-Hooks Ecosystem documentation"}),"."]}),"\n",(0,i.jsx)(n.h3,{id:"center-button-long-press",children:"Center button long press"}),"\n",(0,i.jsx)(n.p,{children:"Please note that the long press on the center button behaves differently from the long press for other buttons, due to how the controller implements this feature: when long pressing the center button, the controller first fires the short press event, then after a couple of seconds it sends the long press event as well. This behaviour is due to the controller design and it's not relative to any integration or the blueprint itself."}),"\n",(0,i.jsx)(n.h3,{id:"issues-with-the-e1810-model-firing-bad-events",children:"Issues with the E1810 model firing bad events"}),"\n",(0,i.jsx)(n.p,{children:"It has been reported that the newer IKEA E1810 controller, which looks identical to the E1524, might fire wrong events in certain situations when interacting with it. This is due to an issue with the controller design and is not relative to the blueprint itself."}),"\n",(0,i.jsx)(n.p,{children:"If you notice your controller is not behaving as expected please remove the battery, wait about 2 minutes, insert it back and try again."}),"\n",(0,i.jsx)(n.h2,{id:"changelog",children:"Changelog"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-02-05"}),": first blueprint version ","\ud83c\udf89"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-02-07"}),": fix an issue which prevented to create automations for ZHA or deCONZ."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-02-08"}),": update example, fixed an issue which executed actions twice when the remote was connected via Zigbee2MQTT."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-03-18"}),": added example for fully controlling a RGB light (thanks @kks36!)"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-02-21"}),":"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"add support for virtual double press events"}),"\n",(0,i.jsx)(n.li,{children:"block automation runs for empty and repeated messages"}),"\n",(0,i.jsxs)(n.li,{children:["reduce ",(0,i.jsx)(n.code,{children:"input_text helper"})," writes"]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-03-03"}),": move the blueprint in the Controllers-Hooks Ecosystem. See announcement ",(0,i.jsx)(n.a,{href:"https://community.home-assistant.io/t/awesome-ha-blueprints-a-curated-list-of-blueprints-easily-create-controller-based-automations-remotes-switches-for-controlling-lights-media-players-and-more/256687/7",children:"here"}),". ","\ud83c\udf89"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-03-25"}),": ","\u26a0\ufe0f"," ",(0,i.jsx)(n.strong,{children:"Breaking Change"}),": standardize input names across all the Controller blueprints.\nIf you plan to update this blueprint, please update the inputs in your automations as follows:"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"remote"})," -> ",(0,i.jsx)(n.code,{children:"controller_device"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"zigbee2mqtt_remote"})," -> ",(0,i.jsx)(n.code,{children:"controller_entity"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"action_*"})," inputs -> ",(0,i.jsx)(n.code,{children:"action_button_*"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"helper_last_loop_event_input"})," -> ",(0,i.jsx)(n.code,{children:"helper_last_controller_event"})]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-03-26"}),": add support for the Cover Hook"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-03-30"}),": Fix event mappings for ZHA and deCONZ"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-04-19"}),": Fix double press events not being detected with deCONZ"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-04-23"}),": Fix deCONZ events not being recognized"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-05-26"}),":"]}),"\n",(0,i.jsxs)(n.p,{children:["\u26a0\ufe0f"," ",(0,i.jsx)(n.strong,{children:"Breaking Change"}),":"]}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"helper_last_controller_event"})," is now a mandatory input. It also simplifies the blueprint setup (reducing issues due to improper configuration missing the helper, which was required only in certain conditions as was stated in the docs), and provides support for advanced features which might be developed in the future."]}),"\n",(0,i.jsxs)(n.p,{children:["If you plan to update this blueprint, please make sure to provide a valid ",(0,i.jsx)(n.code,{children:"input_text"})," entity for the ",(0,i.jsx)(n.code,{children:"helper_last_controller_event"})," input. You should create a separate ",(0,i.jsx)(n.code,{children:"input_text"})," for each Controller blueprint you're configuring, since using the same for multiple automation could lead to inconsistencies and undefined behaviour."]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Other changes:"})}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["\ud83c\udf89"," Add Debouncing support. Debouncing avoids duplicate action runs which might occur with certain controllers and integrations. The feature is disabled by default, check the documentation to find out how to enable it"]}),"\n",(0,i.jsx)(n.li,{children:"Prevent undesired endless loops, which might occur in rare cases when the corresponding stop event is not received, by running loop actions a finite number of times, customizable with four new blueprint inputs"}),"\n",(0,i.jsx)(n.li,{children:"Fix inputs wrongly marked as required"}),"\n",(0,i.jsx)(n.li,{children:"Fix for Zigbee2MQTT reporting null state changes"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-07-04"}),": Fix deCONZ button release events not being properly recognized"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-08-02"}),": Improve inputs documentation and organization"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-10-26"}),": Standardize blueprints structure and inputs naming across the whole collection. Improve blueprint documentation. No functionality change."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2022-08-08"}),": Optimize characters usage for the ",(0,i.jsx)(n.code,{children:"helper_last_controller_event"})," text input."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2025-01-03"}),": Fixed double press events not triggered due to changes in Home Assistant 2023.5.x. (",(0,i.jsx)(n.a,{href:"https://github.com/ZtormTheCat",children:"@ZtormTheCat"}),")"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2025-02-13"}),":"]}),"\n",(0,i.jsxs)(n.p,{children:["\u26a0\ufe0f"," ",(0,i.jsx)(n.strong,{children:"Breaking Change"}),":"]}),"\n",(0,i.jsxs)(n.p,{children:["Migrate to Zigbee2MQTT MQTT Device Triggers. (",(0,i.jsx)(n.a,{href:"https://github.com/yarafie",children:"@yarafie"}),")"]}),"\n",(0,i.jsxs)(n.p,{children:["The ",(0,i.jsx)(n.code,{children:"controller_entity"})," input has been deprecated, and ",(0,i.jsx)(n.code,{children:"controller_device"})," is now mandatory.\nIf you are a Zigbee2MQTT user and plan to update this blueprint, please make sure to remove the ",(0,i.jsx)(n.code,{children:"controller_entity"})," input from your automation config and add the device ID of your controller to the ",(0,i.jsx)(n.code,{children:"controller_device"})," input.\nTo obtain the device ID from your controller, configure the automation from the UI and use the device selector dropdown on the ",(0,i.jsx)(n.code,{children:"controller_device"})," input to select your controller."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2025-03-20"}),": Standardized input naming format for controller devices and virtual button actions. No functionality changes."]}),"\n"]}),"\n"]})]})}function u(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(c,{...e})}):c(e)}}}]);