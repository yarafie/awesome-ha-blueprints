"use strict";(self.webpackChunkawesome_ha_blueprints_website=self.webpackChunkawesome_ha_blueprints_website||[]).push([[725],{5680:(e,t,n)=>{n.d(t,{xA:()=>u,yg:()=>m});var o=n(6540);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=o.createContext({}),p=function(e){var t=o.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=p(e.components);return o.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},d=o.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),d=p(n),m=r,g=d["".concat(s,".").concat(m)]||d[m]||c[m]||a;return n?o.createElement(g,i(i({ref:t},u),{},{components:n})):o.createElement(g,i({ref:t},u))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,i=new Array(a);i[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:r,i[1]=l;for(var p=2;p<a;p++)i[p]=n[p];return o.createElement.apply(null,i)}return o.createElement.apply(null,n)}d.displayName="MDXCreateElement"},1873:(e,t,n)=>{n.d(t,{_x:()=>g,pd:()=>l,Kg:()=>c});var o=n(6540);const r=function(e){let{variant:t,children:n}=e;return o.createElement("span",{className:"badge badge--"+t},n)},a={action:{type:"Action"},addon:{type:"Add-on"},area:{type:"Area"},boolean:{type:"Boolean"},device:{type:"Device"},entity:{type:"Entity"},number:{type:"Number"},object:{type:"Object"},select:{type:"Select"},target:{type:"Target"},text:{type:"Text"},time:{type:"Time"},none:{type:"Text"}},i={inputName:{fontWeight:600},inputDescription:{fontSize:"0.9rem"}};const l=function(e){let{selector:t,required:n,name:l,description:s,deprecated:p}=e;const u=t?a[t]:a.none;return o.createElement("div",null,o.createElement("span",{style:i.inputName},l," ",o.createElement(r,{variant:"primary"},u.type)," ",n?o.createElement(r,{variant:"warning"},n," Required"):o.createElement(r,{variant:"info"},"Optional")," ",p&&o.createElement(r,{variant:"danger"},"Deprecated")),o.createElement("br",null),o.createElement("p",{style:i.inputDescription,className:"margin-top--sm"},s),o.createElement("hr",null))},s={requirementNameContainer:{paddingBottom:"0.8rem"},requirementName:{display:"inline"}};const p=function(e){let{name:t,required:n,children:a}=e;return o.createElement("div",{className:"margin-bottom--lg"},o.createElement("div",{style:s.requirementNameContainer},o.createElement("h3",{style:s.requirementName},t," "),n?o.createElement(r,{variant:"warning"},n," Required"):o.createElement(r,{variant:"info"},"Optional")),a)};const u={zigbee2mqtt:function(e){let{required:t,refers:n,children:r}=e;return o.createElement(p,{name:"Zigbee2MQTT Integration",required:t},o.createElement("p",null,"If you plan to integrate the ",n," with Zigbee2MQTT, you must have this integration set up. Installation methods differ between different installation types. Check out the documentation for full details on the required hardware and how to set up Zigbee2MQTT on your system."),o.createElement("p",null,r),o.createElement("a",{href:"https://www.zigbee2mqtt.io/"},"Zigbee2MQTT Docs"))},zha:function(e){let{required:t,refers:n,children:r}=e;return o.createElement(p,{name:"ZHA Integration",required:t},o.createElement("p",null,"If you plan to integrate the ",n," with ZHA, you must have this integration set up. The ZHA integration can be configured from the Home Assistant UI. Check the documentation for full details on the required hardware and how to set up ZHA on your system."),o.createElement("p",null,r),o.createElement("a",{href:"https://www.home-assistant.io/integrations/zha/"},"ZHA Integration Docs"))},deconz:function(e){let{required:t,refers:n,children:r}=e;return o.createElement(p,{name:"deCONZ Integration",required:t},o.createElement("p",null,"If you plan to integrate the ",n," with deCONZ, you must have this integration set up. The deCONZ integration can be configured from the Home Assistant UI and requires an additional container to run deCONZ on. Head over to the documentation for full details on the required hardware and how to set up deCONZ on your system."),o.createElement("p",null,r),o.createElement("a",{href:"https://www.home-assistant.io/integrations/deconz/"},"deCONZ Integration Docs"))},controller:function(e){let{required:t,children:n}=e;return o.createElement(p,{name:"Controller Automation",required:t},o.createElement("p",null,"To use this blueprint you need to first create an automation with a Controller blueprint. You can then create an automation with this Hook,"," ",o.createElement("b",null,"making sure that you provide the same controller device or entity used in the corresponding Controller blueprint"),". This key step will link the two automations and ensure the Hook will respond to events fired by the Controller."),o.createElement("p",null,n),o.createElement("a",{href:"#supported-controllers"},"List of Supported Controllers")," -"," ",o.createElement("a",{href:"https://yarafie.github.io/awesome-ha-blueprints/blueprints/controllers"},"Controllers Docs"))}};const c=function(e){let{id:t,required:n,name:r,refers:a,children:i}=e;const l=t?u[t]:p;return o.createElement(l,{name:r,required:n,refers:a},i)};var d=n(6447);const m={myHomeAssistantImage:{width:"100%",maxWidth:212}};const g=function(e){let{category:t,id:n}=e;const[r,a]=(0,o.useState)(!1),i="https://github.com/yarafie/awesome-ha-blueprints/blob/main/blueprints/"+t+"/"+n+"/"+n+".yaml";return o.createElement("div",{className:"card item shadow--md"},o.createElement("div",{className:"card__header margin-bottom--md"},o.createElement("h3",null,"Import this blueprint")),o.createElement("div",{className:"card__body"},o.createElement("div",{className:"row row--no-gutters"},o.createElement("div",{className:"col col--6"},o.createElement("h5",null,"My Home Assistant"),o.createElement("p",null,o.createElement("a",{href:"https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url="+escape(i),target:"_blank",rel:"noreferrer"},o.createElement("img",{src:"https://my.home-assistant.io/badges/blueprint_import.svg",alt:"Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled.",style:m.myHomeAssistantImage})),o.createElement("br",null),o.createElement("small",null,"(Home Assistant 2021.3.0 or higher)"))),o.createElement("div",{className:"col col--6"},o.createElement("h5",null,"Direct Link"),o.createElement("button",{type:"button",className:"button button--"+(r?"success":"primary"),onClick:async()=>{await navigator.clipboard.writeText(i),a(!0)}},o.createElement("span",null,o.createElement(d.A,{size:16}),o.createElement("span",null," ",r?"Link Copied!":"Copy Link")))))))}},1418:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>d,frontMatter:()=>i,metadata:()=>s,toc:()=>u});var o=n(8168),r=(n(6540),n(5680)),a=n(1873);const i={title:"Controller - Xiaomi WXCJKG11LM Aqara Opple 2 button remote",description:"Controller automation for executing any kind of action triggered by the provided Xiaomi WXCJKG11LM Aqara Opple 2 button remote. Supports deCONZ, ZHA, Zigbee2MQTT."},l=void 0,s={unversionedId:"blueprints/controllers/xiaomi_wxcjkg11lm",id:"blueprints/controllers/xiaomi_wxcjkg11lm",title:"Controller - Xiaomi WXCJKG11LM Aqara Opple 2 button remote",description:"Controller automation for executing any kind of action triggered by the provided Xiaomi WXCJKG11LM Aqara Opple 2 button remote. Supports deCONZ, ZHA, Zigbee2MQTT.",source:"@site/docs/blueprints/controllers/xiaomi_wxcjkg11lm.mdx",sourceDirName:"blueprints/controllers",slug:"/blueprints/controllers/xiaomi_wxcjkg11lm",permalink:"/awesome-ha-blueprints/docs/blueprints/controllers/xiaomi_wxcjkg11lm",draft:!1,editUrl:"https://github.com/yarafie/awesome-ha-blueprints/edit/main/docs/blueprints/controllers/xiaomi_wxcjkg11lm.mdx",tags:[],version:"current",frontMatter:{title:"Controller - Xiaomi WXCJKG11LM Aqara Opple 2 button remote",description:"Controller automation for executing any kind of action triggered by the provided Xiaomi WXCJKG11LM Aqara Opple 2 button remote. Supports deCONZ, ZHA, Zigbee2MQTT."}},p={},u=[{value:"Description",id:"description",level:2},{value:"Requirements",id:"requirements",level:2},{value:"Inputs",id:"inputs",level:2},{value:"Available Hooks",id:"available-hooks",level:2},{value:"Light",id:"light",level:3},{value:"Default Mapping",id:"default-mapping",level:4},{value:"Media Player",id:"media-player",level:3},{value:"Default Mapping",id:"default-mapping-1",level:4},{value:"Cover",id:"cover",level:3},{value:"Default Mapping",id:"default-mapping-2",level:4},{value:"Additional Notes",id:"additional-notes",level:2},{value:"Helper - Last Controller Event",id:"helper---last-controller-event",level:3},{value:"Changelog",id:"changelog",level:2}],c={toc:u};function d(e){let{components:t,...n}=e;return(0,r.yg)("wrapper",(0,o.A)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,r.yg)(a._x,{id:"xiaomi_wxcjkg11lm",category:"controllers",mdxType:"ImportCard"}),(0,r.yg)("br",null),(0,r.yg)("admonition",{type:"tip"},(0,r.yg)("p",{parentName:"admonition"},"This blueprint is part of the ",(0,r.yg)("strong",{parentName:"p"},"Controllers-Hooks Ecosystem"),". You can read more about this topic ",(0,r.yg)("a",{parentName:"p",href:"/docs/controllers-hooks-ecosystem"},"here"),".")),(0,r.yg)("h2",{id:"description"},"Description"),(0,r.yg)("p",null,"This blueprint provides universal support for running any custom action when a button is pressed on the provided Xiaomi WXCJKG11LM Aqara Opple 2 button remote. Supports controllers integrated with deCONZ, ZHA, Zigbee2MQTT. Just specify the integration used to connect the remote to Home Assistant when setting up the automation, and the blueprint will take care of all the rest."),(0,r.yg)("p",null,"In addition of being able to provide custom actions for every kind of button press supported by the remote, the blueprint allows to loop the long press actions while the corresponding button is being held. Once released, the loop stops. This is useful when holding down a button should result in a continuous action (such as lowering the volume of a media player, or controlling a light brightness)."),(0,r.yg)("admonition",{type:"tip"},(0,r.yg)("p",{parentName:"admonition"},"Automations created with this blueprint can be connected with one or more ",(0,r.yg)("a",{parentName:"p",href:"/docs/blueprints/hooks"},"Hooks")," supported by this controller.\nHooks allow to easily create controller-based automations for interacting with media players, lights, covers and more. See the list of ",(0,r.yg)("a",{parentName:"p",href:"/docs/blueprints/controllers/xiaomi_wxcjkg11lm#available-hooks"},"Hooks available for this controller")," for additional details.")),(0,r.yg)("h2",{id:"requirements"},"Requirements"),(0,r.yg)(a.Kg,{id:"deconz",mdxType:"Requirement"}),(0,r.yg)(a.Kg,{id:"zha",mdxType:"Requirement"}),(0,r.yg)(a.Kg,{id:"zigbee2mqtt",mdxType:"Requirement"}),(0,r.yg)(a.Kg,{name:"Input Text Integration",required:!0,mdxType:"Requirement"},(0,r.yg)("p",null,"This integration provides the entity which must be provided to the blueprint in the ",(0,r.yg)("strong",{parentName:"p"},"Helper - Last Controller Event")," input. Learn more about this helper by reading the dedicated section in the ",(0,r.yg)("a",{parentName:"p",href:"#helper---last-controller-event"},"Additional Notes"),"."),(0,r.yg)("p",null,(0,r.yg)("a",{parentName:"p",href:"https://www.home-assistant.io/integrations/input_text/"},"Input Text Integration Docs"))),(0,r.yg)("h2",{id:"inputs"},"Inputs"),(0,r.yg)(a.pd,{name:"Integration",description:"Integration used for connecting the remote with Home Assistant. Select one of the available values.",selector:"select",required:!0,mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Controller Device",description:"The controller device to use for the automation. Choose a value only if the remote is integrated with deCONZ, ZHA.",selector:"device",required:"deCONZ, ZHA, Zigbee2MQTT",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Controller Entity",description:"The action sensor of the controller to use for the automation. Choose a value only if the remote is integrated with Zigbee2MQTT and Legacy Action Sensors are enabled. This input is deprecated in favor of the Controller Device input, and will be removed in a future release.",selector:"entity",deprecated:!0,mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Helper - Last Controller Event",description:"Input Text used to store the last event fired by the controller. You will need to manually create a text input entity for this, please read the blueprint Additional Notes for more info.",selector:"entity",required:!0,mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 1 short press",description:"Action to run on short button 1 press.",selector:"action",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 1 long press",description:"Action to run on long button 1 press.",selector:"action",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 1 release",description:"Action to run on button 1 release after long press.",selector:"action",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 1 double press",description:"Action to run on double button 1 press.",selector:"action",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 1 triple press",description:"Action to run on triple button 1 press.",selector:"action",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 2 short press",description:"Action to run on short button 2 press.",selector:"action",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 2 long press",description:"Action to run on long button 2 press.",selector:"action",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 2 release",description:"Action to run on button 2 release after long press.",selector:"action",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 2 double press",description:"Action to run on double button 2 press.",selector:"action",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 2 triple press",description:"Action to run on triple button 2 press.",selector:"action",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 1 long press - loop until release",description:"Loop the button 1 action until the button is released.",selector:"boolean",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 1 long press - Maximum loop repeats",description:"Maximum number of repeats for the custom action, when looping is enabled. Use it as a safety limit to prevent an endless loop in case the corresponding stop event is not received.",selector:"number",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 2 long press - loop until release",description:"Loop the button 2 action until the button is released.",selector:"boolean",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Button 2 long press - Maximum loop repeats",description:"Maximum number of repeats for the custom action, when looping is enabled. Use it as a safety limit to prevent an endless loop in case the corresponding stop event is not received.",selector:"number",mdxType:"Input"}),(0,r.yg)(a.pd,{name:"Helper - Debounce delay",description:"Delay used for debouncing RAW controller events, by default set to 0. A value of 0 disables the debouncing feature. Increase this value if you notice custom actions or linked Hooks running multiple times when interacting with the device. When the controller needs to be debounced, usually a value of 100 is enough to remove all duplicate events.",selector:"number",mdxType:"Input"}),(0,r.yg)("h2",{id:"available-hooks"},"Available Hooks"),(0,r.yg)("h3",{id:"light"},"Light"),(0,r.yg)("p",null,"This Hook blueprint allows to build a controller-based automation to control a light. Supports brightness and color control both for white temperature and rgb lights."),(0,r.yg)("h4",{id:"default-mapping"},"Default Mapping"),(0,r.yg)("ul",null,(0,r.yg)("li",{parentName:"ul"},"Button 1 short press -> Turn on"),(0,r.yg)("li",{parentName:"ul"},"Button 1 long press -> Brightness up (continuous, until release)"),(0,r.yg)("li",{parentName:"ul"},"Button 1 double press -> Color up"),(0,r.yg)("li",{parentName:"ul"},"Button 2 short press -> Turn off"),(0,r.yg)("li",{parentName:"ul"},"Button 2 long press -> Brightness down (continuous, until release)"),(0,r.yg)("li",{parentName:"ul"},"Button 2 double press -> Color down")),(0,r.yg)("p",null,(0,r.yg)("a",{parentName:"p",href:"/docs/blueprints/hooks/light"},"Light Hook docs")),(0,r.yg)("h3",{id:"media-player"},"Media Player"),(0,r.yg)("p",null,"This Hook blueprint allows to build a controller-based automation to control a media player. Supports volume setting, play/pause and track selection."),(0,r.yg)("h4",{id:"default-mapping-1"},"Default Mapping"),(0,r.yg)("ul",null,(0,r.yg)("li",{parentName:"ul"},"Button 1 short press -> Volume up"),(0,r.yg)("li",{parentName:"ul"},"Button 1 long press -> Volume up (continuous, until release)"),(0,r.yg)("li",{parentName:"ul"},"Button 1 double press -> Next track"),(0,r.yg)("li",{parentName:"ul"},"Button 2 short press -> Volume down"),(0,r.yg)("li",{parentName:"ul"},"Button 2 long press -> Volume down"),(0,r.yg)("li",{parentName:"ul"},"Button 2 double press -> Play/Pause")),(0,r.yg)("p",null,(0,r.yg)("a",{parentName:"p",href:"/docs/blueprints/hooks/media_player"},"Media Player Hook docs")),(0,r.yg)("h3",{id:"cover"},"Cover"),(0,r.yg)("p",null,"This Hook blueprint allows to build a controller-based automation to control a cover. Supports opening, closing and tilting the cover."),(0,r.yg)("h4",{id:"default-mapping-2"},"Default Mapping"),(0,r.yg)("ul",null,(0,r.yg)("li",{parentName:"ul"},"Button 1 short press -> Open cover"),(0,r.yg)("li",{parentName:"ul"},"Button 1 long press -> Open the cover tilt"),(0,r.yg)("li",{parentName:"ul"},"Button 2 short press -> Close cover"),(0,r.yg)("li",{parentName:"ul"},"Button 2 long press -> Close the cover tilt"),(0,r.yg)("li",{parentName:"ul"},"Button 2 double press -> Stop cover and cover tilt")),(0,r.yg)("p",null,(0,r.yg)("a",{parentName:"p",href:"/docs/blueprints/hooks/cover"},"Cover Hook docs")),(0,r.yg)("h2",{id:"additional-notes"},"Additional Notes"),(0,r.yg)("h3",{id:"helper---last-controller-event"},"Helper - Last Controller Event"),(0,r.yg)("p",null,"The ",(0,r.yg)("inlineCode",{parentName:"p"},"helper_last_controller_event")," (Helper - Last Controller Event) input serves as a permanent storage area for the automation. The stored info is used to implement the blueprint's core functionality. To learn more about the helper, how it's used and why it's required, you can read the dedicated section in the ",(0,r.yg)("a",{parentName:"p",href:"/docs/controllers-hooks-ecosystem#helper---last-controller-event-input"},"Controllers-Hooks Ecosystem documentation"),"."),(0,r.yg)("h2",{id:"changelog"},"Changelog"),(0,r.yg)("ul",null,(0,r.yg)("li",{parentName:"ul"},(0,r.yg)("p",{parentName:"li"},(0,r.yg)("strong",{parentName:"p"},"2021-12-03"),": first blueprint version \ud83c\udf89")),(0,r.yg)("li",{parentName:"ul"},(0,r.yg)("p",{parentName:"li"},(0,r.yg)("strong",{parentName:"p"},"2022-08-08"),": Optimize characters usage for the ",(0,r.yg)("inlineCode",{parentName:"p"},"helper_last_controller_event")," text input.")),(0,r.yg)("li",{parentName:"ul"},(0,r.yg)("p",{parentName:"li"},(0,r.yg)("strong",{parentName:"p"},"2025-01-15"),":"),(0,r.yg)("p",{parentName:"li"},"\u26a0\ufe0f ",(0,r.yg)("strong",{parentName:"p"},"Breaking Change"),":"),(0,r.yg)("p",{parentName:"li"},"Migrate to Zigbee2MQTT MQTT Device Triggers. (",(0,r.yg)("a",{parentName:"p",href:"https://github.com/yarafie"},"@yarafie"),")"),(0,r.yg)("p",{parentName:"li"},"The ",(0,r.yg)("inlineCode",{parentName:"p"},"controller_entity")," input has been deprecated, and ",(0,r.yg)("inlineCode",{parentName:"p"},"controller_device")," is now mandatory.\nIf you are a Zigbee2MQTT user and plan to update this blueprint, please make sure to remove the ",(0,r.yg)("inlineCode",{parentName:"p"},"controller_entity")," input from your automation config and add the device ID of your controller to the ",(0,r.yg)("inlineCode",{parentName:"p"},"controller_device")," input.\nTo obtain the device ID from your controller, configure the automation from the UI and use the device selector dropdown on the ",(0,r.yg)("inlineCode",{parentName:"p"},"controller_device")," input to select your controller."))))}d.isMDXComponent=!0},6447:(e,t,n)=>{n.d(t,{A:()=>u});var o=n(6540),r=n(5556),a=n.n(r),i=["color","size","title"];function l(){return l=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e},l.apply(this,arguments)}function s(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=(0,o.forwardRef)((function(e,t){var n=e.color,r=e.size,a=e.title,p=s(e,i);return o.createElement("svg",l({ref:t,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",width:r,height:r,fill:n},p),a?o.createElement("title",null,a):null,o.createElement("path",{fillRule:"evenodd",d:"M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7z"}),o.createElement("path",{d:"M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"}),o.createElement("path",{d:"M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"}))}));p.propTypes={color:a().string,size:a().oneOfType([a().string,a().number]),title:a().string},p.defaultProps={color:"currentColor",size:"1em",title:null};const u=p}}]);