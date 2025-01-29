"use strict";(self.webpackChunkawesome_ha_blueprints_website=self.webpackChunkawesome_ha_blueprints_website||[]).push([[396],{2940:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>u,frontMatter:()=>o,metadata:()=>i,toc:()=>c});const i=JSON.parse('{"id":"blueprints/automation/on_off_schedule_state_persistence","title":"On-Off schedule with state persistence","description":"A simple on-off schedule, with the addition of state persistence across disruptive events, making sure the target device is always in the expected state.","source":"@site/docs/blueprints/automation/on_off_schedule_state_persistence.mdx","sourceDirName":"blueprints/automation","slug":"/blueprints/automation/on_off_schedule_state_persistence","permalink":"/awesome-ha-blueprints/docs/blueprints/automation/on_off_schedule_state_persistence","draft":false,"unlisted":false,"editUrl":"https://github.com/yarafie/awesome-ha-blueprints/edit/main/docs/blueprints/automation/on_off_schedule_state_persistence.mdx","tags":[],"version":"current","frontMatter":{"title":"On-Off schedule with state persistence","description":"A simple on-off schedule, with the addition of state persistence across disruptive events, making sure the target device is always in the expected state."}}');var s=n(4848),r=n(8453),a=n(7017);const o={title:"On-Off schedule with state persistence",description:"A simple on-off schedule, with the addition of state persistence across disruptive events, making sure the target device is always in the expected state."},l=void 0,d={},c=[{value:"Description",id:"description",level:2},{value:"Requirements",id:"requirements",level:2},{value:"Inputs",id:"inputs",level:2},{value:"Additional Notes",id:"additional-notes",level:2},{value:"Changelog",id:"changelog",level:2}];function h(e){const t={a:"a",em:"em",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...(0,r.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(a._x,{id:"on_off_schedule_state_persistence",category:"automation"}),"\n",(0,s.jsx)("br",{}),"\n",(0,s.jsx)(t.h2,{id:"description",children:"Description"}),"\n",(0,s.jsx)(t.p,{children:"This blueprint provides a simple on-off schedule, with the addition of state persistence across server reboots, powercuts, or other disruptive events which could potentially alter the expected state of the targeted entities. The automation makes sure the target is always in the expected state, even in these situations, but always leaving the freedom to manually toggle the target state as desired. It can be used on critical targets which require a simple on-off schedule during every single day."}),"\n",(0,s.jsxs)(t.p,{children:["One common scenario where this could be useful is in the case of a server reboot or shutdown. For example, let's assume you've an automation ",(0,s.jsx)(t.em,{children:"A"})," set to turn on light ",(0,s.jsx)(t.em,{children:"L"})," at 12:00. If for whatever reason Home Assistant goes offline at 11:59 and turns back on at 12:01, automation ",(0,s.jsx)(t.em,{children:"A"})," scheduled for 12:00 is not executed, with the result of ",(0,s.jsx)(t.em,{children:"L"})," not being in the state you'd expect to be, after 12:00."]}),"\n",(0,s.jsxs)(t.p,{children:["Using this blueprint in the above example would have guaranteed the expected behaviour, with the automation ",(0,s.jsx)(t.em,{children:"A"})," being run at Home Assistant startup, and setting the ",(0,s.jsx)(t.em,{children:"L"})," state as described by the schedule."]}),"\n",(0,s.jsx)(t.p,{children:"Examples of disruptive scenarios could include server reboots, network outages or powercuts. Since every installation could be influenced by many different events and check for them in many different ways, the blueprints includes the flexibility to optionally supply a custom event type which the automation will listen to. When such event is fired, the automation is run."}),"\n",(0,s.jsx)(t.p,{children:"The blueprint already implements the support for listening to Home Assistant startup events, but this functionality can be disabled as desired by the user."}),"\n",(0,s.jsx)(t.p,{children:"Internally, the blueprint calculates time ranges based on the provided On-Off times, bound to the target expected state. Whenever one of the specified times is reached or a disruptive event occurs, the automation retrieves the expected state from the calculated ranges, and enforces it on the target."}),"\n",(0,s.jsx)(t.h2,{id:"requirements",children:"Requirements"}),"\n",(0,s.jsxs)(t.p,{children:["No additional integrations or addons are required for this blueprint, since it's only based on the ",(0,s.jsx)(t.a,{href:"https://www.home-assistant.io/integrations/homeassistant",children:"Home Assistant Core Integration"}),"."]}),"\n",(0,s.jsx)(t.p,{children:"If you optionally want to supply a custom event type to the blueprint, you should setup a mechanism to fire the event in any situation a state check should be performed. This could be an integration firing an event, or another automation, so any additional required setup is out of scope of this documentation."}),"\n",(0,s.jsx)(t.h2,{id:"inputs",children:"Inputs"}),"\n",(0,s.jsx)(a.pd,{name:"Automation target",description:"The target which the automation will turn on and off based on the provided schedule.",selector:"target",required:!0}),"\n",(0,s.jsx)(a.pd,{name:"On Time",description:"Time when the target should be placed in the on state.",selector:"time",required:!0}),"\n",(0,s.jsx)(a.pd,{name:"Off Time",description:"Time when the target should be placed in the off state.",selector:"time",required:!0}),"\n",(0,s.jsx)(a.pd,{name:"Custom Trigger Event",description:"A custom event which can trigger the state check (eg. a powercut event reported by external integrations).",selector:"text"}),"\n",(0,s.jsx)(a.pd,{name:"Trigger at Home Assistant startup",description:"Trigger the target state check and enforcement at Home Assistant startup.",selector:"boolean"}),"\n",(0,s.jsx)(t.h2,{id:"additional-notes",children:"Additional Notes"}),"\n",(0,s.jsx)(t.p,{children:"This automation only provides a simple On-Off schedule. More complex situations could require a different approach to the problem. Also, be aware that running multiple automations generated with this blueprint against the same target could result in unexpected behaviour."}),"\n",(0,s.jsx)(t.h2,{id:"changelog",children:"Changelog"}),"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.strong,{children:"2021-02-01"}),": first blueprint version ","\ud83c\udf89"]}),"\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.strong,{children:"2021-10-26"}),": Standardize blueprints structure and inputs naming across the whole collection. Improve blueprint documentation. Remove default value from required inputs. No functionality change."]}),"\n"]})]})}function u(e={}){const{wrapper:t}={...(0,r.R)(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},7017:(e,t,n)=>{n.d(t,{_x:()=>f,pd:()=>l,Kg:()=>u});var i=n(6540),s=n(4848);const r=function(e){let{variant:t,children:n}=e;return(0,s.jsx)("span",{className:`badge badge--${t}`,children:n})},a={action:{type:"Action"},addon:{type:"Add-on"},area:{type:"Area"},boolean:{type:"Boolean"},device:{type:"Device"},entity:{type:"Entity"},virtual:{type:"Virtual"},number:{type:"Number"},object:{type:"Object"},select:{type:"Select"},target:{type:"Target"},text:{type:"Text"},time:{type:"Time"},none:{type:"Text"}},o={inputName:{fontWeight:600},inputDescription:{fontSize:"0.9rem"}};const l=function(e){let{selector:t,required:n,name:i,description:l,deprecated:d}=e;const c=t?a[t]:a.none;return(0,s.jsxs)("div",{children:[(0,s.jsxs)("span",{style:o.inputName,children:[i," ",(0,s.jsx)(r,{variant:"primary",children:c.type})," ",n?(0,s.jsxs)(r,{variant:"warning",children:[n," Required"]}):(0,s.jsx)(r,{variant:"info",children:"Optional"})," ",d&&(0,s.jsx)(r,{variant:"danger",children:"Deprecated"})]}),(0,s.jsx)("br",{}),(0,s.jsx)("p",{style:o.inputDescription,className:"margin-top--sm",children:l}),(0,s.jsx)("hr",{})]})},d={requirementNameContainer:{paddingBottom:"0.8rem"},requirementName:{display:"inline"}};const c=function(e){let{name:t,required:n,children:i}=e;return(0,s.jsxs)("div",{className:"margin-bottom--lg",children:[(0,s.jsxs)("div",{style:d.requirementNameContainer,children:[(0,s.jsxs)("h3",{style:d.requirementName,children:[t," "]}),n?(0,s.jsxs)(r,{variant:"warning",children:[n," Required"]}):(0,s.jsx)(r,{variant:"info",children:"Optional"})]}),i]})};const h={zigbee2mqtt:function(e){let{required:t,refers:n,children:i}=e;return(0,s.jsxs)(c,{name:"Zigbee2MQTT Integration",required:t,children:[(0,s.jsxs)("p",{children:["If you plan to integrate the ",n," with Zigbee2MQTT, you must have this integration set up. Installation methods differ between different installation types. Check out the documentation for full details on the required hardware and how to set up Zigbee2MQTT on your system."]}),(0,s.jsx)("p",{children:i}),(0,s.jsx)("a",{href:"https://www.zigbee2mqtt.io/",children:"Zigbee2MQTT Docs"})]})},zha:function(e){let{required:t,refers:n,children:i}=e;return(0,s.jsxs)(c,{name:"ZHA Integration",required:t,children:[(0,s.jsxs)("p",{children:["If you plan to integrate the ",n," with ZHA, you must have this integration set up. The ZHA integration can be configured from the Home Assistant UI. Check the documentation for full details on the required hardware and how to set up ZHA on your system."]}),(0,s.jsx)("p",{children:i}),(0,s.jsx)("a",{href:"https://www.home-assistant.io/integrations/zha/",children:"ZHA Integration Docs"})]})},deconz:function(e){let{required:t,refers:n,children:i}=e;return(0,s.jsxs)(c,{name:"deCONZ Integration",required:t,children:[(0,s.jsxs)("p",{children:["If you plan to integrate the ",n," with deCONZ, you must have this integration set up. The deCONZ integration can be configured from the Home Assistant UI and requires an additional container to run deCONZ on. Head over to the documentation for full details on the required hardware and how to set up deCONZ on your system."]}),(0,s.jsx)("p",{children:i}),(0,s.jsx)("a",{href:"https://www.home-assistant.io/integrations/deconz/",children:"deCONZ Integration Docs"})]})},controller:function(e){let{required:t,children:n}=e;return(0,s.jsxs)(c,{name:"Controller Automation",required:t,children:[(0,s.jsxs)("p",{children:["To use this blueprint you need to first create an automation with a Controller blueprint. You can then create an automation with this Hook,"," ",(0,s.jsx)("b",{children:"making sure that you provide the same controller device used in the corresponding Controller blueprint"}),". This key step will link the two automations and ensure the Hook will respond to events fired by the Controller."]}),(0,s.jsx)("p",{children:n}),(0,s.jsx)("a",{href:"#supported-controllers",children:"List of Supported Controllers"})," -"," ",(0,s.jsx)("a",{href:"https://yarafie.github.io/awesome-ha-blueprints/blueprints/controllers",children:"Controllers Docs"})]})}};const u=function(e){let{id:t,required:n,name:i,refers:r,children:a}=e;const o=t?h[t]:c;return(0,s.jsx)(o,{name:i,required:n,refers:r,children:a})};var p=n(6447);const m={myHomeAssistantImage:{width:"100%",maxWidth:212}};const f=function(e){let{category:t,id:n}=e;const[r,a]=(0,i.useState)(!1),o=`https://github.com/yarafie/awesome-ha-blueprints/blob/main/blueprints/${t}/${n}/${n}.yaml`;return(0,s.jsxs)("div",{className:"card item shadow--md",children:[(0,s.jsx)("div",{className:"card__header margin-bottom--md",children:(0,s.jsx)("h3",{children:"Import this blueprint"})}),(0,s.jsx)("div",{className:"card__body",children:(0,s.jsxs)("div",{className:"row row--no-gutters",children:[(0,s.jsxs)("div",{className:"col col--6",children:[(0,s.jsx)("h5",{children:"My Home Assistant"}),(0,s.jsxs)("p",{children:[(0,s.jsx)("a",{href:`https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=${escape(o)}`,target:"_blank",rel:"noreferrer",children:(0,s.jsx)("img",{src:"https://my.home-assistant.io/badges/blueprint_import.svg",alt:"Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled.",style:m.myHomeAssistantImage})}),(0,s.jsx)("br",{}),(0,s.jsx)("small",{children:"(Home Assistant 2024.10.0 or higher)"})]})]}),(0,s.jsxs)("div",{className:"col col--6",children:[(0,s.jsx)("h5",{children:"Direct Link"}),(0,s.jsx)("button",{type:"button",className:"button button--"+(r?"success":"primary"),onClick:async()=>{await navigator.clipboard.writeText(o),a(!0)},children:(0,s.jsxs)("span",{children:[(0,s.jsx)(p.A,{size:16}),(0,s.jsxs)("span",{children:[" ",r?"Link Copied!":"Copy Link"]})]})})]})]})})]})}},6447:(e,t,n)=>{n.d(t,{A:()=>d});var i=n(6540),s=n(5556),r=n.n(s),a=["color","size","title","className"];function o(){return o=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var i in n)({}).hasOwnProperty.call(n,i)&&(e[i]=n[i])}return e},o.apply(null,arguments)}var l=(0,i.forwardRef)((function(e,t){var n=e.color,s=void 0===n?"currentColor":n,r=e.size,l=void 0===r?"1em":r,d=e.title,c=void 0===d?null:d,h=e.className,u=void 0===h?"":h,p=function(e,t){if(null==e)return{};var n,i,s=function(e,t){if(null==e)return{};var n={};for(var i in e)if({}.hasOwnProperty.call(e,i)){if(t.includes(i))continue;n[i]=e[i]}return n}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.includes(n)||{}.propertyIsEnumerable.call(e,n)&&(s[n]=e[n])}return s}(e,a);return i.createElement("svg",o({ref:t,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",width:l,height:l,fill:s,className:["bi","bi-clipboard-plus",u].filter(Boolean).join(" ")},p),c?i.createElement("title",null,c):null,i.createElement("path",{fillRule:"evenodd",d:"M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7"}),i.createElement("path",{d:"M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"}),i.createElement("path",{d:"M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"}))}));l.propTypes={color:r().string,size:r().oneOfType([r().string,r().number]),title:r().string,className:r().string};const d=l},8453:(e,t,n)=>{n.d(t,{R:()=>a,x:()=>o});var i=n(6540);const s={},r=i.createContext(s);function a(e){const t=i.useContext(r);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),i.createElement(r.Provider,{value:t},e.children)}}}]);