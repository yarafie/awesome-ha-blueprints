"use strict";(self.webpackChunkawesome_ha_blueprints_website=self.webpackChunkawesome_ha_blueprints_website||[]).push([[832],{5680:(e,t,n)=>{n.d(t,{xA:()=>c,yg:()=>p});var a=n(6540);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=a.createContext({}),u=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=u(e.components);return a.createElement(l.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),m=u(n),p=i,h=m["".concat(l,".").concat(p)]||m[p]||d[p]||r;return n?a.createElement(h,o(o({ref:t},c),{},{components:n})):a.createElement(h,o({ref:t},c))}));function p(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,o=new Array(r);o[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:i,o[1]=s;for(var u=2;u<r;u++)o[u]=n[u];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},1873:(e,t,n)=>{n.d(t,{_x:()=>h,pd:()=>s,Kg:()=>d});var a=n(6540);const i=function(e){let{variant:t,children:n}=e;return a.createElement("span",{className:"badge badge--"+t},n)},r={action:{type:"Action"},addon:{type:"Add-on"},area:{type:"Area"},boolean:{type:"Boolean"},device:{type:"Device"},entity:{type:"Entity"},number:{type:"Number"},object:{type:"Object"},select:{type:"Select"},target:{type:"Target"},text:{type:"Text"},time:{type:"Time"},none:{type:"Text"}},o={inputName:{fontWeight:600},inputDescription:{fontSize:"0.9rem"}};const s=function(e){let{selector:t,required:n,name:s,description:l,deprecated:u}=e;const c=t?r[t]:r.none;return a.createElement("div",null,a.createElement("span",{style:o.inputName},s," ",a.createElement(i,{variant:"primary"},c.type)," ",n?a.createElement(i,{variant:"warning"},n," Required"):a.createElement(i,{variant:"info"},"Optional")," ",u&&a.createElement(i,{variant:"danger"},"Deprecated")),a.createElement("br",null),a.createElement("p",{style:o.inputDescription,className:"margin-top--sm"},l),a.createElement("hr",null))},l={requirementNameContainer:{paddingBottom:"0.8rem"},requirementName:{display:"inline"}};const u=function(e){let{name:t,required:n,children:r}=e;return a.createElement("div",{className:"margin-bottom--lg"},a.createElement("div",{style:l.requirementNameContainer},a.createElement("h3",{style:l.requirementName},t," "),n?a.createElement(i,{variant:"warning"},n," Required"):a.createElement(i,{variant:"info"},"Optional")),r)};const c={zigbee2mqtt:function(e){let{required:t,refers:n,children:i}=e;return a.createElement(u,{name:"Zigbee2MQTT Integration",required:t},a.createElement("p",null,"If you plan to integrate the ",n," with Zigbee2MQTT, you must have this integration set up. Installation methods differ between different installation types. Check out the documentation for full details on the required hardware and how to set up Zigbee2MQTT on your system."),a.createElement("p",null,i),a.createElement("a",{href:"https://www.zigbee2mqtt.io/"},"Zigbee2MQTT Docs"))},zha:function(e){let{required:t,refers:n,children:i}=e;return a.createElement(u,{name:"ZHA Integration",required:t},a.createElement("p",null,"If you plan to integrate the ",n," with ZHA, you must have this integration set up. The ZHA integration can be configured from the Home Assistant UI. Check the documentation for full details on the required hardware and how to set up ZHA on your system."),a.createElement("p",null,i),a.createElement("a",{href:"https://www.home-assistant.io/integrations/zha/"},"ZHA Integration Docs"))},deconz:function(e){let{required:t,refers:n,children:i}=e;return a.createElement(u,{name:"deCONZ Integration",required:t},a.createElement("p",null,"If you plan to integrate the ",n," with deCONZ, you must have this integration set up. The deCONZ integration can be configured from the Home Assistant UI and requires an additional container to run deCONZ on. Head over to the documentation for full details on the required hardware and how to set up deCONZ on your system."),a.createElement("p",null,i),a.createElement("a",{href:"https://www.home-assistant.io/integrations/deconz/"},"deCONZ Integration Docs"))},controller:function(e){let{required:t,children:n}=e;return a.createElement(u,{name:"Controller Automation",required:t},a.createElement("p",null,"To use this blueprint you need to first create an automation with a Controller blueprint. You can then create an automation with this Hook,"," ",a.createElement("b",null,"making sure that you provide the same controller device or entity used in the corresponding Controller blueprint"),". This key step will link the two automations and ensure the Hook will respond to events fired by the Controller."),a.createElement("p",null,n),a.createElement("a",{href:"#supported-controllers"},"List of Supported Controllers")," -"," ",a.createElement("a",{href:"https://yarafie.github.io/awesome-ha-blueprints/blueprints/controllers"},"Controllers Docs"))}};const d=function(e){let{id:t,required:n,name:i,refers:r,children:o}=e;const s=t?c[t]:u;return a.createElement(s,{name:i,required:n,refers:r},o)};var m=n(6447);const p={myHomeAssistantImage:{width:"100%",maxWidth:212}};const h=function(e){let{category:t,id:n}=e;const[i,r]=(0,a.useState)(!1),o="https://github.com/yarafie/awesome-ha-blueprints/blob/main/blueprints/"+t+"/"+n+"/"+n+".yaml";return a.createElement("div",{className:"card item shadow--md"},a.createElement("div",{className:"card__header margin-bottom--md"},a.createElement("h3",null,"Import this blueprint")),a.createElement("div",{className:"card__body"},a.createElement("div",{className:"row row--no-gutters"},a.createElement("div",{className:"col col--6"},a.createElement("h5",null,"My Home Assistant"),a.createElement("p",null,a.createElement("a",{href:"https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url="+escape(o),target:"_blank",rel:"noreferrer"},a.createElement("img",{src:"https://my.home-assistant.io/badges/blueprint_import.svg",alt:"Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled.",style:p.myHomeAssistantImage})),a.createElement("br",null),a.createElement("small",null,"(Home Assistant 2021.3.0 or higher)"))),a.createElement("div",{className:"col col--6"},a.createElement("h5",null,"Direct Link"),a.createElement("button",{type:"button",className:"button button--"+(i?"success":"primary"),onClick:async()=>{await navigator.clipboard.writeText(o),r(!0)}},a.createElement("span",null,a.createElement(m.A,{size:16}),a.createElement("span",null," ",i?"Link Copied!":"Copy Link")))))))}},8849:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>s,default:()=>m,frontMatter:()=>o,metadata:()=>l,toc:()=>c});var a=n(8168),i=(n(6540),n(5680)),r=n(1873);const o={title:"Simple Safe Scheduler",description:"A simple scheduler which executes a certain action at a given time, checking and eventually re-executing the action if the automation did not run at the expected time (e.g. due to a disruptive event)."},s=void 0,l={unversionedId:"blueprints/automation/simple_safe_scheduler",id:"blueprints/automation/simple_safe_scheduler",title:"Simple Safe Scheduler",description:"A simple scheduler which executes a certain action at a given time, checking and eventually re-executing the action if the automation did not run at the expected time (e.g. due to a disruptive event).",source:"@site/docs/blueprints/automation/simple_safe_scheduler.mdx",sourceDirName:"blueprints/automation",slug:"/blueprints/automation/simple_safe_scheduler",permalink:"/awesome-ha-blueprints/docs/blueprints/automation/simple_safe_scheduler",draft:!1,editUrl:"https://github.com/yarafie/awesome-ha-blueprints/edit/main/docs/blueprints/automation/simple_safe_scheduler.mdx",tags:[],version:"current",frontMatter:{title:"Simple Safe Scheduler",description:"A simple scheduler which executes a certain action at a given time, checking and eventually re-executing the action if the automation did not run at the expected time (e.g. due to a disruptive event)."}},u={},c=[{value:"Description",id:"description",level:2},{value:"Requirements",id:"requirements",level:2},{value:"Inputs",id:"inputs",level:2},{value:"Additional Notes",id:"additional-notes",level:2},{value:"Helper - Storage Input",id:"helper---storage-input",level:3},{value:"Advanced scheduling",id:"advanced-scheduling",level:3},{value:"Dynamic scheduling (e.g. sunrise/sunset)",id:"dynamic-scheduling-eg-sunrisesunset",level:3},{value:"Changelog",id:"changelog",level:2}],d={toc:c};function m(e){let{components:t,...n}=e;return(0,i.yg)("wrapper",(0,a.A)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,i.yg)(r._x,{id:"simple_safe_scheduler",category:"automation",mdxType:"ImportCard"}),(0,i.yg)("br",null),(0,i.yg)("h2",{id:"description"},"Description"),(0,i.yg)("p",null,"Scheduling a periodic action in Home Assistant might be trickier than what it looks at first glance. Not only the available automation triggers are limited to only time-based schedules (requiring the user to either use template triggers or install additional integrations for more complex scheduling options), but they also do not guarantee that the automation is executed at the provided time."),(0,i.yg)("p",null,"As an example, let's assume automation ",(0,i.yg)("em",{parentName:"p"},"A")," is scheduled to run at 12:00. If the Home Assistant server goes down at 11:59 due to a disruptive event (e.g. power outage, planned maintenance, hardware failure etc.) and comes back up at 12:01, the ",(0,i.yg)("em",{parentName:"p"},"A")," automation run scheduled for 12:00 would simply be skipped, without any warning to the user."),(0,i.yg)("p",null,"The Simple Safe Scheduler blueprint tries to mitigate scheduling limitations in Home Assistant by providing an easy interface to configure periodic actions, with built-in safety checks to ensure the action actually runs even in case of a disruptive event."),(0,i.yg)("p",null,"The configured automation acts as a simple scheduler, allowing to flexibly program any kind of action based on the following parameters:"),(0,i.yg)("ul",null,(0,i.yg)("li",{parentName:"ul"},"Time of the day (dynamically provided as an ",(0,i.yg)("inlineCode",{parentName:"li"},"input_datetime")," entity);"),(0,i.yg)("li",{parentName:"ul"},"Day of the week (multiple days can be selected);"),(0,i.yg)("li",{parentName:"ul"},"Week frequency (allowing to schedule the action to run i.e. every 2 weeks).")),(0,i.yg)("p",null,"In addition, the blueprint implements useful checks to make sure that, in case of a disruptive event (e.g power outage, Home Assistant server outage etc.) happening at the scheduled automation run time, the action is executed as soon as the system restores its state. These checks can be configured to be performed both when Home Assistant boots up and when a custom event is fired (e.g. from another automation or integration). Such safety checks might be particularly important for critical automations, which need to run as close as possible to the scheduled time (e.g. watering plants, configuring an alarm system, etc.)."),(0,i.yg)("h2",{id:"requirements"},"Requirements"),(0,i.yg)(r.Kg,{name:"Input Datetime Integration",required:!0,mdxType:"Requirement"},(0,i.yg)("p",null,"This integration provides the entity which represents a datetime input in Home Assistant. It should be activated by default so unless you tweaked the default configuration you're good to go."),(0,i.yg)("p",null,(0,i.yg)("a",{parentName:"p",href:"https://www.home-assistant.io/integrations/input_datetime/"},"Input Datetime Docs"))),(0,i.yg)("h2",{id:"inputs"},"Inputs"),(0,i.yg)(r.pd,{name:"Action",description:"The action which needs to be executed by this automation at the provided day and time.",selector:"action",required:!0,mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Helper - Storage",description:"A text helper which will be used by the automation to store information regarding the last successful run. You will need to manually create a text input entity for this, please read the blueprint Additional Notes for more info.",selector:"entity",required:!0,mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Run every N weeks",description:"The number of weeks between a successful run and the next one.",selector:"number",mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Run on Monday",description:"Run the action on Monday.",selector:"boolean",mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Run on Tuesday",description:"Run the action on Tuesday.",selector:"boolean",mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Run on Wednesday",description:"Run the action on Wednesday.",selector:"boolean",mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Run on Thursday",description:"Run the action on Thursday.",selector:"boolean",mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Run on Friday",description:"Run the action on Friday.",selector:"boolean",mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Run on Saturday",description:"Run the action on Saturday.",selector:"boolean",mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Run on Sunday",description:"Run the action on Sunday.",selector:"boolean",mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Run Time Entity",description:"Entity which describes the time when the action should run. Provide an entity with only time information configured (has_time: true, has_date: false).",selector:"entity",required:!0,mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Custom Trigger Event",description:"A custom event which can trigger the execution check (eg. a powercut event reported by external integrations).",selector:"text",mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Trigger at Home Assistant startup",description:"Trigger the execution check at Home Assistant startup.",selector:"boolean",mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Block late execution",description:"Prevent the action to be executed too late, when a given period of time passed since the expected run time.",selector:"boolean",mdxType:"Input"}),(0,i.yg)(r.pd,{name:"Block late execution - Max elapsed time",description:"Threshold which is used to determine a late execution: if the provided amount of time passed since the expected run time and block late execution is enabled, the action will not be executed in any case.",selector:"number",mdxType:"Input"}),(0,i.yg)("h2",{id:"additional-notes"},"Additional Notes"),(0,i.yg)("h3",{id:"helper---storage-input"},"Helper - Storage Input"),(0,i.yg)("p",null,"The ",(0,i.yg)("inlineCode",{parentName:"p"},"helper_storage")," (Helper - Storage) input serves as a permanent storage area for the automation. The stored info is used to implement the blueprint's core functionality. When setting up this blueprint, manually create a new ",(0,i.yg)("inlineCode",{parentName:"p"},"input_text")," entity and provide it in the inputs section."),(0,i.yg)("admonition",{type:"caution"},(0,i.yg)("p",{parentName:"admonition"},"Make sure the text input is not altered by any other agent. The provided entity is used as a permanent storage area for just a single automation; any change to its state not carried out by the respective automation could lead to inconsistencies and unexpected behaviour. Therefore, you should create a ",(0,i.yg)("strong",{parentName:"p"},"separate text input for each automation you're configuring with this blueprint"),".")),(0,i.yg)("h3",{id:"advanced-scheduling"},"Advanced scheduling"),(0,i.yg)("p",null,"For more advanced scheduling options you can configure multiple automation with this blueprint, having the same action but with a different scheduling configuration.\nLet's say that you want to set up an action to run every two weeks on Monday, at 12:00 and also every week on Wednesday, at 13:00. You can setup two distinct automations with the same action and the following scheduling configuration (only scheduling-relevant inputs are provided):"),(0,i.yg)("p",null,"Automation 1: Every two weeks, on Monday, at 12:00:"),(0,i.yg)("pre",null,(0,i.yg)("code",{parentName:"pre",className:"language-yaml"},"weeks_frequency: 2\nday_monday: true\ntime_entity: input_datetime.automation_1 # its value need to be set at 12:00\n")),(0,i.yg)("p",null,"Automation 2: Every week, on Wednesday, at 13:00:"),(0,i.yg)("pre",null,(0,i.yg)("code",{parentName:"pre",className:"language-yaml"},"weeks_frequency: 1\nday_wednesday: true\ntime_entity: input_datetime.automation_2 # its value need to be set at 13:00\n")),(0,i.yg)("h3",{id:"dynamic-scheduling-eg-sunrisesunset"},"Dynamic scheduling (e.g. sunrise/sunset)"),(0,i.yg)("p",null,"Using an ",(0,i.yg)("inlineCode",{parentName:"p"},"input_datetime")," entity to provide the time the automation should run allows to flexibly configure the scheduled time, without providing an hardcoded value. This can be really useful when configuring schedules based on a dynamic time of the day, such as sunrise or sunset based automations. In the latter case, you can provide an ",(0,i.yg)("inlineCode",{parentName:"p"},"input_datetime")," entity configured as follows:"),(0,i.yg)("pre",null,(0,i.yg)("code",{parentName:"pre",className:"language-yaml"},"# input_datetime configuration\ninput_datetime:\n  automation_1:\n    name: Automation 1 Execution Time\n    has_date: false\n    has_time: true\n\n# your automations.yaml file\n- id: automation_1_datetime_update\n  # whenever you want to update the automation dynamic execution time\n  # in this case at sunset\n  trigger:\n    - platform: sun\n      event: sunset\n  action:\n    - service: input_datetime.set_datetime\n      target:\n        entity_id: input_datetime.automation_1\n      data:\n        time: \"{{ now().strftime('%H:%M:%S') }}\"\n")),(0,i.yg)("h2",{id:"changelog"},"Changelog"),(0,i.yg)("ul",null,(0,i.yg)("li",{parentName:"ul"},(0,i.yg)("strong",{parentName:"li"},"2021-10-22"),": first blueprint version \ud83c\udf89")))}m.isMDXComponent=!0},6447:(e,t,n)=>{n.d(t,{A:()=>c});var a=n(6540),i=n(5556),r=n.n(i),o=["color","size","title"];function s(){return s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},s.apply(this,arguments)}function l(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var u=(0,a.forwardRef)((function(e,t){var n=e.color,i=e.size,r=e.title,u=l(e,o);return a.createElement("svg",s({ref:t,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",width:i,height:i,fill:n},u),r?a.createElement("title",null,r):null,a.createElement("path",{fillRule:"evenodd",d:"M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7z"}),a.createElement("path",{d:"M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"}),a.createElement("path",{d:"M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"}))}));u.propTypes={color:r().string,size:r().oneOfType([r().string,r().number]),title:r().string},u.defaultProps={color:"currentColor",size:"1em",title:null};const c=u}}]);