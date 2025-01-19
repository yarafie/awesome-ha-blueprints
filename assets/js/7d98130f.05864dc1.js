"use strict";(self.webpackChunkawesome_ha_blueprints_website=self.webpackChunkawesome_ha_blueprints_website||[]).push([[207],{8567:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>d,default:()=>h,frontMatter:()=>r,metadata:()=>i,toc:()=>c});const i=JSON.parse('{"id":"blueprints/automation/addon_update_notification","title":"Send a mobile notification when add-on update is available","description":"Send a notification to the provided mobile devices whenever an update for the given Home Assistant add-on is available.","source":"@site/docs/blueprints/automation/addon_update_notification.mdx","sourceDirName":"blueprints/automation","slug":"/blueprints/automation/addon_update_notification","permalink":"/awesome-ha-blueprints/docs/blueprints/automation/addon_update_notification","draft":false,"unlisted":false,"editUrl":"https://github.com/EPMatt/awesome-ha-blueprints/edit/main/docs/blueprints/automation/addon_update_notification.mdx","tags":[],"version":"current","frontMatter":{"title":"Send a mobile notification when add-on update is available","description":"Send a notification to the provided mobile devices whenever an update for the given Home Assistant add-on is available."}}');var o=n(4848),s=n(8453),a=n(7017);const r={title:"Send a mobile notification when add-on update is available",description:"Send a notification to the provided mobile devices whenever an update for the given Home Assistant add-on is available."},d=void 0,l={},c=[{value:"Description",id:"description",level:2},{value:"Requirements",id:"requirements",level:2},{value:"How to enable add-on entities",id:"how-to-enable-add-on-entities",level:4},{value:"Inputs",id:"inputs",level:2},{value:"Additional Notes",id:"additional-notes",level:2},{value:"Changelog",id:"changelog",level:2}];function u(e){const t={a:"a",code:"code",em:"em",h2:"h2",h4:"h4",img:"img",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(a._x,{id:"addon_update_notification",category:"automation"}),"\n",(0,o.jsx)("br",{}),"\n",(0,o.jsx)(t.h2,{id:"description",children:"Description"}),"\n",(0,o.jsx)(t.p,{children:"Send a notification to the provided mobile devices whenever an update for the given Home Assistant add-on is available.\nSupports full notification customization, notification groups, auto-dismissal when the add-on is updated and button for starting the update directly from your notification tray, with optional notification after the update completed succesfully.\nThis blueprint doesn't require any additional sensor to be manually set up, since it uses the built-in add-on sensors introduced with the Supervisor integration starting from Home Assistant Core 2021.4.0."}),"\n",(0,o.jsx)(t.h2,{id:"requirements",children:"Requirements"}),"\n",(0,o.jsxs)(a.Kg,{name:"Home Assistant Supervisor + Integration",required:!0,children:[(0,o.jsx)(t.p,{children:"To use this blueprint you must have an Home Assistant instance running installed as Home Assistant Managed OS or Home Assistant Supervised.\nYou can learn more about Home Assistant installation methods in the"}),(0,o.jsxs)(t.p,{children:[(0,o.jsx)(t.a,{href:"https://www.home-assistant.io/installation/",children:"official Home Assistant docs"}),"."]}),(0,o.jsx)(t.p,{children:"You must also have the Home Assistant Supervisor integration enabled and correctly set up. This is available and enabled by default starting from Home Assistant Core 2021.4.0."}),(0,o.jsx)(t.p,{children:"Moreover, add-on sensors are disabled by default in the Supervisor integration. Please make sure to enable the following entities for the add-on you plan to track before setting up this blueprint:"}),(0,o.jsxs)(t.ul,{children:["\n",(0,o.jsx)(t.li,{children:(0,o.jsx)(t.code,{children:"sensor.<addon>_version"})}),"\n",(0,o.jsx)(t.li,{children:(0,o.jsx)(t.code,{children:"sensor.<addon>_newest_version"})}),"\n",(0,o.jsx)(t.li,{children:(0,o.jsx)(t.code,{children:"binary_sensor.<addon>_update_available"})}),"\n"]}),(0,o.jsx)(t.h4,{id:"how-to-enable-add-on-entities",children:"How to enable add-on entities"}),(0,o.jsxs)(t.ol,{children:["\n",(0,o.jsxs)(t.li,{children:["Navigate to ",(0,o.jsx)(t.em,{children:"Configuration"})," -> ",(0,o.jsx)(t.em,{children:"Integrations"})," in your Home Assistant UI. You can click the following button to navigate to the Integrations dashboard for your installation."]}),"\n"]}),(0,o.jsxs)(t.p,{children:[(0,o.jsx)(t.a,{href:"https://my.home-assistant.io/redirect/integrations/",children:(0,o.jsx)(t.img,{src:"https://my.home-assistant.io/badges/integrations.svg",alt:"Open your Home Assistant instance and show your integrations."})})," 2. Click on ",(0,o.jsx)(t.em,{children:"Entities"})," in the ",(0,o.jsx)(t.em,{children:"Home Assistant Supervisor"})," card you find in the Integrations page. You'll be presented with a table of entities exposed by the Supervisor integration. 3. Select all the entities you want to use with this blueprint, then hit ",(0,o.jsx)(t.em,{children:"Enable Selected"})," on the top right of the table. 4. You've succesfully enabled the add-on entities required by this blueprint."]}),(0,o.jsx)(t.p,{children:(0,o.jsx)(t.a,{href:"https://www.home-assistant.io/integrations/hassio/",children:"Home Assistant Supervisor Docs"})})]}),"\n",(0,o.jsxs)(a.Kg,{name:"Mobile App Integration",required:!0,children:[(0,o.jsx)(t.p,{children:"This integration provides the service to send notification to mobile devices. This should be activated by default so unless you tweaked the default configuration you're good to go."}),(0,o.jsx)(t.p,{children:(0,o.jsx)(t.a,{href:"https://www.home-assistant.io/integrations/mobile_app/",children:"Mobile App Integration Docs"})})]}),"\n",(0,o.jsxs)(a.Kg,{name:"Home Assistant Companion App",required:!0,children:[(0,o.jsx)(t.p,{children:"The official mobile app for Home Assistant. Make sure to have the Home Assistant Companion App installed and configured on mobile devices you plan to use for this automation."}),(0,o.jsx)(t.p,{children:(0,o.jsx)(t.a,{href:"https://companion.home-assistant.io/docs/notifications/notifications-basic#sending-notifications-to-multiple-devices",children:"Home Assistant Companion App Docs"})})]}),"\n",(0,o.jsxs)(a.Kg,{name:"Notify Group Integration",required:!0,children:[(0,o.jsxs)(t.p,{children:["If you want to simultaneously send the notification to multiple devices, you can define a notification group using this integration in your ",(0,o.jsx)(t.code,{children:"configuration.yaml"}),", then provide the service for the notification group in the ",(0,o.jsx)(t.a,{href:"#mobile-devices-notification-service",children:"Mobile devices notification service input"}),". This integration should be enabled by default. More on how to setup notification groups in the official docs."]}),(0,o.jsx)(t.p,{children:(0,o.jsx)(t.a,{href:"https://www.home-assistant.io/integrations/notify.group/",children:"Notify Group Integration Docs"})})]}),"\n",(0,o.jsx)(t.h2,{id:"inputs",children:"Inputs"}),"\n",(0,o.jsx)(a.pd,{name:"Add-on",description:"The add-on to monitor for updates.",selector:"addon",required:!0}),"\n",(0,o.jsx)(a.pd,{name:"Add-on name",description:"The add-on name to be displayed in notifications.",selector:"text",required:!0}),"\n",(0,o.jsx)(a.pd,{name:"Add-on version sensor",description:"The add-on current version sensor, exposed by the Supervisor.",selector:"entity",required:!0}),"\n",(0,o.jsx)(a.pd,{name:"Add-on newest version sensor",description:"The add-on newest version sensor, exposed by the Supervisor.",selector:"entity",required:!0}),"\n",(0,o.jsx)(a.pd,{name:"Add-on update available sensor",description:"The add-on update available sensor, exposed by the Supervisor.",selector:"entity",required:!0}),"\n",(0,o.jsx)(a.pd,{name:"Mobile devices notification service",description:"The notification service for mobile devices (eg. service.mobile_app_<your_device_id_here>). You can provide both a notify group or a single notify device here.",selector:"text",required:!0}),"\n",(0,o.jsx)(a.pd,{name:"Notification title",description:"Title for the update notification. You can use {{ version }}, {{ newest_version }}, and {{ addon_name }} templates to include add-on current version, newest version and name respectively.",selector:"text"}),"\n",(0,o.jsx)(a.pd,{name:"Notification message",description:"Message for the update notification. You can use {{ version }}, {{ newest_version }}, and {{ addon_name }} templates to include add-on current version, newest version and name respectively.",selector:"text"}),"\n",(0,o.jsx)(a.pd,{name:"Tap action",description:"URL you will navigate to when tapping on the notification. Default to the add-on info page.",selector:"text"}),"\n",(0,o.jsx)(a.pd,{name:"(Android only) Notification color",description:"Color for the notifications. You can both type a friendly color name or an hex value.",selector:"text"}),"\n",(0,o.jsx)(a.pd,{name:"(Android only) Notification channel",description:"Android notification channel. Allows to group notifications to then apply custom settings for sound, vibration, etc. Leave blank if you do not want to use this feature.",selector:"text"}),"\n",(0,o.jsx)(a.pd,{name:"(Android only) Notification Channel importance",description:"Android notification channel importance. Allows to define different priority levels for your notifications.",selector:"select"}),"\n",(0,o.jsx)(a.pd,{name:"Notification group",description:"Notification group for the notifications sent with this automation. Use this to group notifications in the notification tray. Leave blank if you do not want to use this feature.",selector:"text"}),"\n",(0,o.jsx)(a.pd,{name:"Notification Update Button",description:"Add a button to the notification for updating the add-on.",selector:"boolean"}),"\n",(0,o.jsx)(a.pd,{name:"Update success notification",description:"Send a notification after the add-on update triggered by the update button succeed. The notification will use the same settings for group, channel, importance and color from the update available notification.",selector:"boolean"}),"\n",(0,o.jsx)(a.pd,{name:"Update success notification title",description:"Title for the update success notification. You can use {{ version }}, {{ newest_version }}, and {{ addon_name }} templates to include add-on current version, newest version and name respectively.",selector:"text"}),"\n",(0,o.jsx)(a.pd,{name:"Update success notification message",description:"Message for the update success notification. You can use {{ version }}, {{ newest_version }}, and {{ addon_name }} templates to include add-on current version, newest version and name respectively.",selector:"text"}),"\n",(0,o.jsx)(t.h2,{id:"additional-notes",children:"Additional Notes"}),"\n",(0,o.jsxs)(t.p,{children:["Please be aware that if you use notification groups which include both iOS and Android devices, some features (like Android Channels and notification groups) won't work. More details in the ",(0,o.jsx)(t.a,{href:"https://companion.home-assistant.io/docs/notifications/notifications-basic#sending-notifications-to-multiple-devices",children:"Home Assistant Companion App Docs"}),"."]}),"\n",(0,o.jsx)(t.h2,{id:"changelog",children:"Changelog"}),"\n",(0,o.jsxs)(t.ul,{children:["\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.strong,{children:"2021-04-25"}),": first blueprint version ","\ud83c\udf89"]}),"\n",(0,o.jsxs)(t.li,{children:[(0,o.jsx)(t.strong,{children:"2021-10-26"}),": Standardize blueprints structure and inputs naming across the whole collection. Improve blueprint documentation. No functionality change."]}),"\n"]})]})}function h(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,o.jsx)(t,{...e,children:(0,o.jsx)(u,{...e})}):u(e)}},7017:(e,t,n)=>{n.d(t,{_x:()=>f,pd:()=>d,Kg:()=>h});var i=n(6540),o=n(4848);const s=function(e){let{variant:t,children:n}=e;return(0,o.jsx)("span",{className:`badge badge--${t}`,children:n})},a={action:{type:"Action"},addon:{type:"Add-on"},area:{type:"Area"},boolean:{type:"Boolean"},device:{type:"Device"},entity:{type:"Entity"},number:{type:"Number"},object:{type:"Object"},select:{type:"Select"},target:{type:"Target"},text:{type:"Text"},time:{type:"Time"},none:{type:"Text"}},r={inputName:{fontWeight:600},inputDescription:{fontSize:"0.9rem"}};const d=function(e){let{selector:t,required:n,name:i,description:d,deprecated:l}=e;const c=t?a[t]:a.none;return(0,o.jsxs)("div",{children:[(0,o.jsxs)("span",{style:r.inputName,children:[i," ",(0,o.jsx)(s,{variant:"primary",children:c.type})," ",n?(0,o.jsxs)(s,{variant:"warning",children:[n," Required"]}):(0,o.jsx)(s,{variant:"info",children:"Optional"})," ",l&&(0,o.jsx)(s,{variant:"danger",children:"Deprecated"})]}),(0,o.jsx)("br",{}),(0,o.jsx)("p",{style:r.inputDescription,className:"margin-top--sm",children:d}),(0,o.jsx)("hr",{})]})},l={requirementNameContainer:{paddingBottom:"0.8rem"},requirementName:{display:"inline"}};const c=function(e){let{name:t,required:n,children:i}=e;return(0,o.jsxs)("div",{className:"margin-bottom--lg",children:[(0,o.jsxs)("div",{style:l.requirementNameContainer,children:[(0,o.jsxs)("h3",{style:l.requirementName,children:[t," "]}),n?(0,o.jsxs)(s,{variant:"warning",children:[n," Required"]}):(0,o.jsx)(s,{variant:"info",children:"Optional"})]}),i]})};const u={zigbee2mqtt:function(e){let{required:t,refers:n,children:i}=e;return(0,o.jsxs)(c,{name:"Zigbee2MQTT Integration",required:t,children:[(0,o.jsxs)("p",{children:["If you plan to integrate the ",n," with Zigbee2MQTT, you must have this integration set up. Installation methods differ between different installation types. Check out the documentation for full details on the required hardware and how to set up Zigbee2MQTT on your system."]}),(0,o.jsx)("p",{children:i}),(0,o.jsx)("a",{href:"https://www.zigbee2mqtt.io/",children:"Zigbee2MQTT Docs"})]})},zha:function(e){let{required:t,refers:n,children:i}=e;return(0,o.jsxs)(c,{name:"ZHA Integration",required:t,children:[(0,o.jsxs)("p",{children:["If you plan to integrate the ",n," with ZHA, you must have this integration set up. The ZHA integration can be configured from the Home Assistant UI. Check the documentation for full details on the required hardware and how to set up ZHA on your system."]}),(0,o.jsx)("p",{children:i}),(0,o.jsx)("a",{href:"https://www.home-assistant.io/integrations/zha/",children:"ZHA Integration Docs"})]})},deconz:function(e){let{required:t,refers:n,children:i}=e;return(0,o.jsxs)(c,{name:"deCONZ Integration",required:t,children:[(0,o.jsxs)("p",{children:["If you plan to integrate the ",n," with deCONZ, you must have this integration set up. The deCONZ integration can be configured from the Home Assistant UI and requires an additional container to run deCONZ on. Head over to the documentation for full details on the required hardware and how to set up deCONZ on your system."]}),(0,o.jsx)("p",{children:i}),(0,o.jsx)("a",{href:"https://www.home-assistant.io/integrations/deconz/",children:"deCONZ Integration Docs"})]})},controller:function(e){let{required:t,children:n}=e;return(0,o.jsxs)(c,{name:"Controller Automation",required:t,children:[(0,o.jsxs)("p",{children:["To use this blueprint you need to first create an automation with a Controller blueprint. You can then create an automation with this Hook,"," ",(0,o.jsx)("b",{children:"making sure that you provide the same controller device or entity used in the corresponding Controller blueprint"}),". This key step will link the two automations and ensure the Hook will respond to events fired by the Controller."]}),(0,o.jsx)("p",{children:n}),(0,o.jsx)("a",{href:"#supported-controllers",children:"List of Supported Controllers"})," -"," ",(0,o.jsx)("a",{href:"https://epmatt.github.io/awesome-ha-blueprints/blueprints/controllers",children:"Controllers Docs"})]})}};const h=function(e){let{id:t,required:n,name:i,refers:s,children:a}=e;const r=t?u[t]:c;return(0,o.jsx)(r,{name:i,required:n,refers:s,children:a})};var p=n(6447);const m={myHomeAssistantImage:{width:"100%",maxWidth:212}};const f=function(e){let{category:t,id:n}=e;const[s,a]=(0,i.useState)(!1),r=`https://github.com/EPMatt/awesome-ha-blueprints/blob/main/blueprints/${t}/${n}/${n}.yaml`;return(0,o.jsxs)("div",{className:"card item shadow--md",children:[(0,o.jsx)("div",{className:"card__header margin-bottom--md",children:(0,o.jsx)("h3",{children:"Import this blueprint"})}),(0,o.jsx)("div",{className:"card__body",children:(0,o.jsxs)("div",{className:"row row--no-gutters",children:[(0,o.jsxs)("div",{className:"col col--6",children:[(0,o.jsx)("h5",{children:"My Home Assistant"}),(0,o.jsxs)("p",{children:[(0,o.jsx)("a",{href:`https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=${escape(r)}`,target:"_blank",rel:"noreferrer",children:(0,o.jsx)("img",{src:"https://my.home-assistant.io/badges/blueprint_import.svg",alt:"Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled.",style:m.myHomeAssistantImage})}),(0,o.jsx)("br",{}),(0,o.jsx)("small",{children:"(Home Assistant 2021.3.0 or higher)"})]})]}),(0,o.jsxs)("div",{className:"col col--6",children:[(0,o.jsx)("h5",{children:"Direct Link"}),(0,o.jsx)("button",{type:"button",className:"button button--"+(s?"success":"primary"),onClick:async()=>{await navigator.clipboard.writeText(r),a(!0)},children:(0,o.jsxs)("span",{children:[(0,o.jsx)(p.A,{size:16}),(0,o.jsxs)("span",{children:[" ",s?"Link Copied!":"Copy Link"]})]})})]})]})})]})}},6447:(e,t,n)=>{n.d(t,{A:()=>l});var i=n(6540),o=n(5556),s=n.n(o),a=["color","size","title","className"];function r(){return r=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var i in n)({}).hasOwnProperty.call(n,i)&&(e[i]=n[i])}return e},r.apply(null,arguments)}var d=(0,i.forwardRef)((function(e,t){var n=e.color,o=void 0===n?"currentColor":n,s=e.size,d=void 0===s?"1em":s,l=e.title,c=void 0===l?null:l,u=e.className,h=void 0===u?"":u,p=function(e,t){if(null==e)return{};var n,i,o=function(e,t){if(null==e)return{};var n={};for(var i in e)if({}.hasOwnProperty.call(e,i)){if(t.includes(i))continue;n[i]=e[i]}return n}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(i=0;i<s.length;i++)n=s[i],t.includes(n)||{}.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}(e,a);return i.createElement("svg",r({ref:t,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",width:d,height:d,fill:o,className:["bi","bi-clipboard-plus",h].filter(Boolean).join(" ")},p),c?i.createElement("title",null,c):null,i.createElement("path",{fillRule:"evenodd",d:"M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7"}),i.createElement("path",{d:"M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"}),i.createElement("path",{d:"M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"}))}));d.propTypes={color:s().string,size:s().oneOfType([s().string,s().number]),title:s().string,className:s().string};const l=d},8453:(e,t,n)=>{n.d(t,{R:()=>a,x:()=>r});var i=n(6540);const o={},s=i.createContext(o);function a(e){const t=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function r(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:a(e.components),i.createElement(s.Provider,{value:t},e.children)}}}]);