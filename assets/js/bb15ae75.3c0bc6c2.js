"use strict";(self.webpackChunkawesome_ha_blueprints_website=self.webpackChunkawesome_ha_blueprints_website||[]).push([[495],{87:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>a,default:()=>u,frontMatter:()=>l,metadata:()=>i,toc:()=>c});const i=JSON.parse('{"id":"blueprints/controllers/ikea_ictc_g_1","title":"Controller - IKEA ICTC-G-1 TR\xc5DFRI wireless dimmer","description":"Controller automation for executing any kind of action triggered by the provided IKEA ICTC-G-1 TR\xc5DFRI wireless dimmer. Supports deCONZ, ZHA, Zigbee2MQTT.","source":"@site/docs/blueprints/controllers/ikea_ictc_g_1.mdx","sourceDirName":"blueprints/controllers","slug":"/blueprints/controllers/ikea_ictc_g_1","permalink":"/awesome-ha-blueprints/docs/blueprints/controllers/ikea_ictc_g_1","draft":false,"unlisted":false,"editUrl":"https://github.com/yarafie/awesome-ha-blueprints/edit/main/docs/blueprints/controllers/ikea_ictc_g_1.mdx","tags":[],"version":"current","frontMatter":{"title":"Controller - IKEA ICTC-G-1 TR\xc5DFRI wireless dimmer","description":"Controller automation for executing any kind of action triggered by the provided IKEA ICTC-G-1 TR\xc5DFRI wireless dimmer. Supports deCONZ, ZHA, Zigbee2MQTT."}}');var r=n(4848),o=n(8453),s=n(7017);const l={title:"Controller - IKEA ICTC-G-1 TR\xc5DFRI wireless dimmer",description:"Controller automation for executing any kind of action triggered by the provided IKEA ICTC-G-1 TR\xc5DFRI wireless dimmer. Supports deCONZ, ZHA, Zigbee2MQTT."},a=void 0,d={},c=[{value:"Description",id:"description",level:2},{value:"Requirements",id:"requirements",level:2},{value:"Inputs",id:"inputs",level:2},{value:"Available Hooks",id:"available-hooks",level:2},{value:"Light",id:"light",level:3},{value:"Default Mapping",id:"default-mapping",level:4},{value:"Media Player",id:"media-player",level:3},{value:"Default Mapping",id:"default-mapping-1",level:4},{value:"Additional Notes",id:"additional-notes",level:2},{value:"Helper - Last Controller Event",id:"helper---last-controller-event",level:3},{value:"Changelog",id:"changelog",level:2}];function h(e){const t={a:"a",admonition:"admonition",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",strong:"strong",ul:"ul",...(0,o.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(s._x,{id:"ikea_ictc_g_1",category:"controllers"}),"\n",(0,r.jsx)("br",{}),"\n",(0,r.jsx)(t.admonition,{type:"tip",children:(0,r.jsxs)(t.p,{children:["This blueprint is part of the ",(0,r.jsx)(t.strong,{children:"Controllers-Hooks Ecosystem"}),". You can read more about this topic ",(0,r.jsx)(t.a,{href:"/docs/controllers-hooks-ecosystem",children:"here"}),"."]})}),"\n",(0,r.jsx)(t.h2,{id:"description",children:"Description"}),"\n",(0,r.jsx)(t.p,{children:"This blueprint provides universal support for running any custom action when a button is pressed on the provided IKEA ICTC-G-1 TR\xc5DFRI wireless dimmer. Supports controllers integrated with deCONZ, ZHA, Zigbee2MQTT. Just specify the integration used to connect the remote to Home Assistant when setting up the automation, and the blueprint will take care of all the rest."}),"\n",(0,r.jsx)(t.p,{children:"In addition of being able to provide custom actions for every kind of button press supported by the remote, the blueprint allows to optionally loop the rotate actions while the remote is rotating either left or right. Once the remote stops rotating, the loop stops as well. This is useful when rotating the controller should result in a continuous action (such as lowering the volume of a media player, or controlling a light brightness)."}),"\n",(0,r.jsx)(t.admonition,{type:"tip",children:(0,r.jsxs)(t.p,{children:["Automations created with this blueprint can be connected with one or more ",(0,r.jsx)(t.a,{href:"/docs/blueprints/hooks",children:"Hooks"})," supported by this controller.\nHooks allow to easily create controller-based automations for interacting with media players, lights, covers and more. See the list of ",(0,r.jsx)(t.a,{href:"/docs/blueprints/controllers/ikea_ictc_g_1#available-hooks",children:"Hooks available for this controller"})," for additional details."]})}),"\n",(0,r.jsx)(t.h2,{id:"requirements",children:"Requirements"}),"\n",(0,r.jsx)(s.Kg,{id:"deconz"}),"\n",(0,r.jsx)(s.Kg,{id:"zha"}),"\n",(0,r.jsx)(s.Kg,{id:"zigbee2mqtt",children:(0,r.jsxs)(t.p,{children:["When configuring the remote with Zigbee2MQTT make sure to disable the legacy integration for it, as reported ",(0,r.jsx)(t.a,{href:"https://www.zigbee2mqtt.io/devices/ICTC-G-1.html#legacy-integration",children:"here"}),". This blueprint won't work with controllers with a legacy integration due to their instability and fundamental problems."]})}),"\n",(0,r.jsxs)(s.Kg,{name:"Input Text Integration",required:!0,children:[(0,r.jsxs)(t.p,{children:["This integration provides the entity which must be provided to the blueprint in the ",(0,r.jsx)(t.strong,{children:"Helper - Last Controller Event"})," input. Learn more about this helper by reading the dedicated section in the ",(0,r.jsx)(t.a,{href:"#helper---last-controller-event",children:"Additional Notes"}),"."]}),(0,r.jsx)(t.p,{children:(0,r.jsx)(t.a,{href:"https://www.home-assistant.io/integrations/input_text/",children:"Input Text Integration Docs"})})]}),"\n",(0,r.jsx)(t.h2,{id:"inputs",children:"Inputs"}),"\n",(0,r.jsx)(s.pd,{name:"Integration",description:"Integration used for connecting the remote with Home Assistant. Select one of the available values.",selector:"select",required:!0}),"\n",(0,r.jsx)(s.pd,{name:"Controller Device",description:"The controller device to use for the automation. Choose a value only if the remote is integrated with deCONZ, ZHA.",selector:"device",required:"deCONZ, ZHA, Zigbee2MQTT"}),"\n",(0,r.jsx)(s.pd,{name:"Controller Entity",description:"The action sensor of the controller to use for the automation. Choose a value only if the remote is integrated with Zigbee2MQTT and Legacy Action Sensors are enabled. This input is deprecated in favor of the Controller Device input, and will be removed in a future release.",selector:"entity",deprecated:!0}),"\n",(0,r.jsx)(s.pd,{name:"Helper - Last Controller Event",description:"Input Text used to store the last event fired by the controller. You will need to manually create a text input entity for this, please read the blueprint Additional Notes for more info.",selector:"entity",required:!0}),"\n",(0,r.jsx)(s.pd,{name:"Rotate left",description:"Action to run on rotate left.",selector:"action"}),"\n",(0,r.jsx)(s.pd,{name:"Rotate left stop",description:"Action to run when stopping to rotate left the remote.",selector:"action"}),"\n",(0,r.jsx)(s.pd,{name:"Rotate right",description:"Action to run on rotate right.",selector:"action"}),"\n",(0,r.jsx)(s.pd,{name:"Rotate right stop",description:"Action to run when stopping to rotate right the remote.",selector:"action"}),"\n",(0,r.jsx)(s.pd,{name:"Rotate left - loop until stop",description:"Loop the rotate left action until the rotation is stopped.",selector:"boolean"}),"\n",(0,r.jsx)(s.pd,{name:"Rotate left - Maximum loop repeats",description:"Maximum number of repeats for the custom action, when looping is enabled. Use it as a safety limit to prevent an endless loop in case the corresponding stop event is not received.",selector:"number"}),"\n",(0,r.jsx)(s.pd,{name:"Rotate right - loop until stop",description:"Loop the rotate right action until the rotation is stopped.",selector:"boolean"}),"\n",(0,r.jsx)(s.pd,{name:"Rotate right - Maximum loop repeats",description:"Maximum number of repeats for the custom action, when looping is enabled. Use it as a safety limit to prevent an endless loop in case the corresponding stop event is not received.",selector:"number"}),"\n",(0,r.jsx)(s.pd,{name:"Helper - Debounce delay",description:"Delay used for debouncing RAW controller events, by default set to 0. A value of 0 disables the debouncing feature. Increase this value if you notice custom actions or linked Hooks running multiple times when interacting with the device. When the controller needs to be debounced, usually a value of 100 is enough to remove all duplicate events.",selector:"number"}),"\n",(0,r.jsx)(t.h2,{id:"available-hooks",children:"Available Hooks"}),"\n",(0,r.jsx)(t.h3,{id:"light",children:"Light"}),"\n",(0,r.jsx)(t.p,{children:"This Hook blueprint allows to build a controller-based automation to control a light. Supports brightness and color control both for white temperature and rgb lights."}),"\n",(0,r.jsx)(t.h4,{id:"default-mapping",children:"Default Mapping"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsx)(t.li,{children:"Rotate left -> Brightness down (continuous, until stop)"}),"\n",(0,r.jsx)(t.li,{children:"Rotate right -> Brightness up (continuous, until stop)"}),"\n"]}),"\n",(0,r.jsx)(t.p,{children:(0,r.jsx)(t.a,{href:"/docs/blueprints/hooks/light",children:"Light Hook docs"})}),"\n",(0,r.jsx)(t.h3,{id:"media-player",children:"Media Player"}),"\n",(0,r.jsx)(t.p,{children:"This Hook blueprint allows to build a controller-based automation to control a media player. Supports volume setting, play/pause and track selection."}),"\n",(0,r.jsx)(t.h4,{id:"default-mapping-1",children:"Default Mapping"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsx)(t.li,{children:"Rotate left -> Volume down (continuous, until stop)"}),"\n",(0,r.jsx)(t.li,{children:"Rotate right -> Volume up (continuous, until stop)"}),"\n"]}),"\n",(0,r.jsx)(t.p,{children:(0,r.jsx)(t.a,{href:"/docs/blueprints/hooks/media_player",children:"Media Player Hook docs"})}),"\n",(0,r.jsx)(t.h2,{id:"additional-notes",children:"Additional Notes"}),"\n",(0,r.jsx)(t.h3,{id:"helper---last-controller-event",children:"Helper - Last Controller Event"}),"\n",(0,r.jsxs)(t.p,{children:["The ",(0,r.jsx)(t.code,{children:"helper_last_controller_event"})," (Helper - Last Controller Event) input serves as a permanent storage area for the automation. The stored info is used to implement the blueprint's core functionality. To learn more about the helper, how it's used and why it's required, you can read the dedicated section in the ",(0,r.jsx)(t.a,{href:"/docs/controllers-hooks-ecosystem#helper---last-controller-event-input",children:"Controllers-Hooks Ecosystem documentation"}),"."]}),"\n",(0,r.jsx)(t.p,{children:"The helper is used to determine stop rotation events when the controller is integrated with ZHA, Zigbee2MQTT, because of the actions mapping for the controller with these integrations. Natively, the controller doesn't allow to distinguish between different rotation events, so the blueprint must store the previous rotation."}),"\n",(0,r.jsxs)(t.p,{children:["This blueprint provides beta support for controllers integrated with deCONZ, since not all the supported events are mapped for this integration. If you are using the IKEA ICTC-G-1 with deCONZ and would like to help, you can reach out ",(0,r.jsx)(t.a,{href:"https://community.home-assistant.io/t/awesome-ha-blueprints-a-curated-list-of-blueprints-easily-create-controller-based-automations-remotes-switches-for-controlling-lights-media-players-and-more/256687",children:"here"}),"."]}),"\n",(0,r.jsx)(t.h2,{id:"changelog",children:"Changelog"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"2021-03-26"}),": first blueprint version ","\ud83c\udf89"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"2021-04-19"}),": Fix stop rotation events not being detected with deCONZ"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"2021-04-23"}),": Fix deCONZ events not being recognized"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"2021-05-26"}),":"]}),"\n",(0,r.jsxs)(t.p,{children:["\u26a0\ufe0f"," ",(0,r.jsx)(t.strong,{children:"Breaking Change"}),":"]}),"\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.code,{children:"helper_last_controller_event"})," is now a mandatory input. It also simplifies the blueprint setup (reducing issues due to improper configuration missing the helper, which was required only in certain conditions as was stated in the docs), and provides support for advanced features which might be developed in the future."]}),"\n",(0,r.jsxs)(t.p,{children:["If you plan to update this blueprint, please make sure to provide a valid ",(0,r.jsx)(t.code,{children:"input_text"})," entity for the ",(0,r.jsx)(t.code,{children:"helper_last_controller_event"})," input. You should create a separate ",(0,r.jsx)(t.code,{children:"input_text"})," for each Controller blueprint you're configuring, since using the same for multiple automation could lead to inconsistencies and undefined behaviour."]}),"\n",(0,r.jsx)(t.p,{children:(0,r.jsx)(t.strong,{children:"Other changes:"})}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:["\ud83c\udf89"," Add Debouncing support. Debouncing avoids duplicate action runs which might occur with certain controllers and integrations. The feature is disabled by default, check the documentation to find out how to enable it"]}),"\n",(0,r.jsx)(t.li,{children:"Prevent undesired endless loops, which might occur in rare cases when the corresponding stop event is not received, by running loop actions a finite number of times, customizable with two new blueprint inputs"}),"\n",(0,r.jsx)(t.li,{children:"Use any RAW stop event (left/right) to identify the stop event corresponding to the current remote rotation"}),"\n",(0,r.jsx)(t.li,{children:"Fix inputs wrongly marked as required"}),"\n",(0,r.jsx)(t.li,{children:"Fix for Zigbee2MQTT reporting null state changes"}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"2021-07-04"}),": Fix deCONZ rotation stop events not being properly recognized"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"2021-08-02"}),": Improve inputs documentation and organization"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"2021-10-26"}),": Standardize blueprints structure and inputs naming across the whole collection. Improve blueprint documentation. No functionality change."]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"2022-08-08"}),": Optimize characters usage for the ",(0,r.jsx)(t.code,{children:"helper_last_controller_event"})," text input."]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"2025-01-15"}),":"]}),"\n",(0,r.jsxs)(t.p,{children:["\u26a0\ufe0f"," ",(0,r.jsx)(t.strong,{children:"Breaking Change"}),":"]}),"\n",(0,r.jsxs)(t.p,{children:["Migrate to Zigbee2MQTT MQTT Device Triggers. (",(0,r.jsx)(t.a,{href:"https://github.com/yarafie",children:"@yarafie"}),")"]}),"\n",(0,r.jsxs)(t.p,{children:["The ",(0,r.jsx)(t.code,{children:"controller_entity"})," input has been deprecated, and ",(0,r.jsx)(t.code,{children:"controller_device"})," is now mandatory.\nIf you are a Zigbee2MQTT user and plan to update this blueprint, please make sure to remove the ",(0,r.jsx)(t.code,{children:"controller_entity"})," input from your automation config and add the device ID of your controller to the ",(0,r.jsx)(t.code,{children:"controller_device"})," input.\nTo obtain the device ID from your controller, configure the automation from the UI and use the device selector dropdown on the ",(0,r.jsx)(t.code,{children:"controller_device"})," input to select your controller."]}),"\n"]}),"\n"]})]})}function u(e={}){const{wrapper:t}={...(0,o.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},7017:(e,t,n)=>{n.d(t,{_x:()=>g,pd:()=>a,Kg:()=>u});var i=n(6540),r=n(4848);const o=function(e){let{variant:t,children:n}=e;return(0,r.jsx)("span",{className:`badge badge--${t}`,children:n})},s={action:{type:"Action"},addon:{type:"Add-on"},area:{type:"Area"},boolean:{type:"Boolean"},device:{type:"Device"},entity:{type:"Entity"},number:{type:"Number"},object:{type:"Object"},select:{type:"Select"},target:{type:"Target"},text:{type:"Text"},time:{type:"Time"},none:{type:"Text"}},l={inputName:{fontWeight:600},inputDescription:{fontSize:"0.9rem"}};const a=function(e){let{selector:t,required:n,name:i,description:a,deprecated:d}=e;const c=t?s[t]:s.none;return(0,r.jsxs)("div",{children:[(0,r.jsxs)("span",{style:l.inputName,children:[i," ",(0,r.jsx)(o,{variant:"primary",children:c.type})," ",n?(0,r.jsxs)(o,{variant:"warning",children:[n," Required"]}):(0,r.jsx)(o,{variant:"info",children:"Optional"})," ",d&&(0,r.jsx)(o,{variant:"danger",children:"Deprecated"})]}),(0,r.jsx)("br",{}),(0,r.jsx)("p",{style:l.inputDescription,className:"margin-top--sm",children:a}),(0,r.jsx)("hr",{})]})},d={requirementNameContainer:{paddingBottom:"0.8rem"},requirementName:{display:"inline"}};const c=function(e){let{name:t,required:n,children:i}=e;return(0,r.jsxs)("div",{className:"margin-bottom--lg",children:[(0,r.jsxs)("div",{style:d.requirementNameContainer,children:[(0,r.jsxs)("h3",{style:d.requirementName,children:[t," "]}),n?(0,r.jsxs)(o,{variant:"warning",children:[n," Required"]}):(0,r.jsx)(o,{variant:"info",children:"Optional"})]}),i]})};const h={zigbee2mqtt:function(e){let{required:t,refers:n,children:i}=e;return(0,r.jsxs)(c,{name:"Zigbee2MQTT Integration",required:t,children:[(0,r.jsxs)("p",{children:["If you plan to integrate the ",n," with Zigbee2MQTT, you must have this integration set up. Installation methods differ between different installation types. Check out the documentation for full details on the required hardware and how to set up Zigbee2MQTT on your system."]}),(0,r.jsx)("p",{children:i}),(0,r.jsx)("a",{href:"https://www.zigbee2mqtt.io/",children:"Zigbee2MQTT Docs"})]})},zha:function(e){let{required:t,refers:n,children:i}=e;return(0,r.jsxs)(c,{name:"ZHA Integration",required:t,children:[(0,r.jsxs)("p",{children:["If you plan to integrate the ",n," with ZHA, you must have this integration set up. The ZHA integration can be configured from the Home Assistant UI. Check the documentation for full details on the required hardware and how to set up ZHA on your system."]}),(0,r.jsx)("p",{children:i}),(0,r.jsx)("a",{href:"https://www.home-assistant.io/integrations/zha/",children:"ZHA Integration Docs"})]})},deconz:function(e){let{required:t,refers:n,children:i}=e;return(0,r.jsxs)(c,{name:"deCONZ Integration",required:t,children:[(0,r.jsxs)("p",{children:["If you plan to integrate the ",n," with deCONZ, you must have this integration set up. The deCONZ integration can be configured from the Home Assistant UI and requires an additional container to run deCONZ on. Head over to the documentation for full details on the required hardware and how to set up deCONZ on your system."]}),(0,r.jsx)("p",{children:i}),(0,r.jsx)("a",{href:"https://www.home-assistant.io/integrations/deconz/",children:"deCONZ Integration Docs"})]})},controller:function(e){let{required:t,children:n}=e;return(0,r.jsxs)(c,{name:"Controller Automation",required:t,children:[(0,r.jsxs)("p",{children:["To use this blueprint you need to first create an automation with a Controller blueprint. You can then create an automation with this Hook,"," ",(0,r.jsx)("b",{children:"making sure that you provide the same controller device or entity used in the corresponding Controller blueprint"}),". This key step will link the two automations and ensure the Hook will respond to events fired by the Controller."]}),(0,r.jsx)("p",{children:n}),(0,r.jsx)("a",{href:"#supported-controllers",children:"List of Supported Controllers"})," -"," ",(0,r.jsx)("a",{href:"https://yarafie.github.io/awesome-ha-blueprints/blueprints/controllers",children:"Controllers Docs"})]})}};const u=function(e){let{id:t,required:n,name:i,refers:o,children:s}=e;const l=t?h[t]:c;return(0,r.jsx)(l,{name:i,required:n,refers:o,children:s})};var p=n(6447);const m={myHomeAssistantImage:{width:"100%",maxWidth:212}};const g=function(e){let{category:t,id:n}=e;const[o,s]=(0,i.useState)(!1),l=`https://github.com/yarafie/awesome-ha-blueprints/blob/main/blueprints/${t}/${n}/${n}.yaml`;return(0,r.jsxs)("div",{className:"card item shadow--md",children:[(0,r.jsx)("div",{className:"card__header margin-bottom--md",children:(0,r.jsx)("h3",{children:"Import this blueprint"})}),(0,r.jsx)("div",{className:"card__body",children:(0,r.jsxs)("div",{className:"row row--no-gutters",children:[(0,r.jsxs)("div",{className:"col col--6",children:[(0,r.jsx)("h5",{children:"My Home Assistant"}),(0,r.jsxs)("p",{children:[(0,r.jsx)("a",{href:`https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=${escape(l)}`,target:"_blank",rel:"noreferrer",children:(0,r.jsx)("img",{src:"https://my.home-assistant.io/badges/blueprint_import.svg",alt:"Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled.",style:m.myHomeAssistantImage})}),(0,r.jsx)("br",{}),(0,r.jsx)("small",{children:"(Home Assistant 2021.3.0 or higher)"})]})]}),(0,r.jsxs)("div",{className:"col col--6",children:[(0,r.jsx)("h5",{children:"Direct Link"}),(0,r.jsx)("button",{type:"button",className:"button button--"+(o?"success":"primary"),onClick:async()=>{await navigator.clipboard.writeText(l),s(!0)},children:(0,r.jsxs)("span",{children:[(0,r.jsx)(p.A,{size:16}),(0,r.jsxs)("span",{children:[" ",o?"Link Copied!":"Copy Link"]})]})})]})]})})]})}},6447:(e,t,n)=>{n.d(t,{A:()=>d});var i=n(6540),r=n(5556),o=n.n(r),s=["color","size","title","className"];function l(){return l=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var i in n)({}).hasOwnProperty.call(n,i)&&(e[i]=n[i])}return e},l.apply(null,arguments)}var a=(0,i.forwardRef)((function(e,t){var n=e.color,r=void 0===n?"currentColor":n,o=e.size,a=void 0===o?"1em":o,d=e.title,c=void 0===d?null:d,h=e.className,u=void 0===h?"":h,p=function(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n={};for(var i in e)if({}.hasOwnProperty.call(e,i)){if(t.includes(i))continue;n[i]=e[i]}return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)n=o[i],t.includes(n)||{}.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}(e,s);return i.createElement("svg",l({ref:t,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",width:a,height:a,fill:r,className:["bi","bi-clipboard-plus",u].filter(Boolean).join(" ")},p),c?i.createElement("title",null,c):null,i.createElement("path",{fillRule:"evenodd",d:"M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7"}),i.createElement("path",{d:"M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"}),i.createElement("path",{d:"M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"}))}));a.propTypes={color:o().string,size:o().oneOfType([o().string,o().number]),title:o().string,className:o().string};const d=a},8453:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>l});var i=n(6540);const r={},o=i.createContext(r);function s(e){const t=i.useContext(o);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function l(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:s(e.components),i.createElement(o.Provider,{value:t},e.children)}}}]);