"use strict";(self.webpackChunkawesome_ha_blueprints_website=self.webpackChunkawesome_ha_blueprints_website||[]).push([[68],{5351:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>h,contentTitle:()=>a,default:()=>u,frontMatter:()=>l,metadata:()=>r,toc:()=>c});const r=JSON.parse('{"id":"blueprints/hooks/light","title":"Hook - Light","description":"This Hook blueprint allows to build a controller-based automation to control a light. Supports brightness and color control both for white temperature and rgb lights.","source":"@site/docs/blueprints/hooks/light.mdx","sourceDirName":"blueprints/hooks","slug":"/blueprints/hooks/light","permalink":"/awesome-ha-blueprints/docs/blueprints/hooks/light","draft":false,"unlisted":false,"editUrl":"https://github.com/yarafie/awesome-ha-blueprints/edit/main/docs/blueprints/hooks/light.mdx","tags":[],"version":"current","frontMatter":{"title":"Hook - Light","description":"This Hook blueprint allows to build a controller-based automation to control a light. Supports brightness and color control both for white temperature and rgb lights."}}');var i=t(4848),s=t(8453),o=t(7017);const l={title:"Hook - Light",description:"This Hook blueprint allows to build a controller-based automation to control a light. Supports brightness and color control both for white temperature and rgb lights."},a=void 0,h={},c=[{value:"Description",id:"description",level:2},{value:"Requirements",id:"requirements",level:2},{value:"Inputs",id:"inputs",level:2},{value:"Supported Controllers",id:"supported-controllers",level:2},{value:"Additional Notes",id:"additional-notes",level:2},{value:"Changelog",id:"changelog",level:2}];function d(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(o._x,{id:"light",category:"hooks"}),"\n",(0,i.jsx)("br",{}),"\n",(0,i.jsx)(n.admonition,{type:"tip",children:(0,i.jsxs)(n.p,{children:["This blueprint is part of the ",(0,i.jsx)(n.strong,{children:"Controllers-Hooks Ecosystem"}),". You can read more about this topic ",(0,i.jsx)(n.a,{href:"/docs/controllers-hooks-ecosystem",children:"here"}),"."]})}),"\n",(0,i.jsx)(n.h2,{id:"description",children:"Description"}),"\n",(0,i.jsx)(n.p,{children:"This Hook blueprint allows to build a controller-based automation to control a light. Supports brightness and color control both for white temperature and rgb lights."}),"\n",(0,i.jsxs)(n.admonition,{type:"info",children:[(0,i.jsxs)(n.p,{children:["An automation created with this blueprint must be linked to a ",(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers",children:"Controller"})," automation. Controllers are blueprints which allow to easily integrate a wide range of controllers and use them to run a set of actions when interacting with them. They expose an abstract interface used by Hooks to create controller-based automations."]}),(0,i.jsxs)(n.p,{children:["See the list of ",(0,i.jsx)(n.a,{href:"#supported-controllers",children:"Controllers supported by this Hook"})," for additional details."]})]}),"\n",(0,i.jsx)(n.h2,{id:"requirements",children:"Requirements"}),"\n",(0,i.jsx)(o.Kg,{id:"controller",required:!0}),"\n",(0,i.jsxs)(o.Kg,{name:"Light Integration",required:!0,children:[(0,i.jsx)(n.p,{children:"This integration provides the entity which represents a light in Home Assistant. It should be activated by default so unless you tweaked the default configuration you're good to go."}),(0,i.jsx)(n.p,{children:(0,i.jsx)(n.a,{href:"https://www.home-assistant.io/integrations/light/",children:"Light Integration Docs"})})]}),"\n",(0,i.jsx)(n.h2,{id:"inputs",children:"Inputs"}),"\n",(0,i.jsx)(o.pd,{name:"Controller Device",description:"The controller device which will control the Light. Choose a value only if the integration used to connect the controller to Home Assistant exposes it as a Device. This value should match the one specified in the corresponding Controller automation.",selector:"device",required:!0}),"\n",(0,i.jsx)(o.pd,{name:"Controller model",description:"The model for the controller used in this automation. Choose a value from the list of supported controllers.",selector:"select",required:!0}),"\n",(0,i.jsx)(o.pd,{name:"Light",description:"Light which will be controlled with this automation.",selector:"entity",required:!0}),"\n",(0,i.jsx)(o.pd,{name:"Light color mode",description:'Specify how the controller will set the light color. Choose "Color Temperature" and "Hue - Saturation" depending on the features supported by your light. If you are not sure you can select "Auto". "None" will disable color control features.',selector:"select"}),"\n",(0,i.jsx)(o.pd,{name:"Light Transition",description:"Number that represents the time (in milliseconds) the light should take turn on or off, if the light supports it.",selector:"number"}),"\n",(0,i.jsx)(o.pd,{name:"Light minimum brightness",description:"The minimum brightness the light can be set with this automation.",selector:"number"}),"\n",(0,i.jsx)(o.pd,{name:"Light maximum brightness",description:"The maximum brightness the light can be set with this automation.",selector:"number"}),"\n",(0,i.jsx)(o.pd,{name:"Light brightness steps - short actions",description:"Number of steps from min to max brightness when controlling brightness with short actions (eg. button press).",selector:"number"}),"\n",(0,i.jsx)(o.pd,{name:"Light brightness steps - long actions",description:"Number of steps from min to max brightness when controlling brightness with long actions (eg. button hold or controller rotation).",selector:"number"}),"\n",(0,i.jsx)(o.pd,{name:"Force brightness value at turn on",description:'Force brightness to the "On brightness" input value, when the light is being turned on.',selector:"boolean"}),"\n",(0,i.jsx)(o.pd,{name:"On brightness",description:"Brightness value to force when turning on the light",selector:"number"}),"\n",(0,i.jsx)(o.pd,{name:"Smooth power on",description:"Force the light to turn on at minimum brightness when a brightness up command (single or continuous) is triggered and light is off.",selector:"boolean"}),"\n",(0,i.jsx)(o.pd,{name:"Smooth power off",description:"Allow a brightness down command (single or continuous) to turn off the light when at minimum brightness. Disabling this will prevent the light from being turned off by brightness down commands.",selector:"boolean"}),"\n",(0,i.jsx)(n.h2,{id:"supported-controllers",children:"Supported Controllers"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/xiaomi_wxkg11lm",children:"Aqara WXKG11LM Wireless Mini Switch"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e1524_e1810",children:"IKEA E1524/E1810 TR\xc5DFRI Wireless 5-Button Remote"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e1743",children:"IKEA E1743 TR\xc5DFRI On/Off Switch & Dimmer"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e1744",children:"IKEA E1744 SYMFONISK Rotary Remote"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e1766",children:"IKEA E1766 TR\xc5DFRI Open/Close Remote"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e1812",children:"IKEA E1812 TR\xc5DFRI Shortcut button"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e2001_e2002",children:"IKEA E2001/E2002 STYRBAR Remote control"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e2201",children:"IKEA E2201 RODRET Dimmer"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_ictc_g_1",children:"IKEA ICTC-G-1 TR\xc5DFRI wireless dimmer"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/osram_ac025xx00nj",children:"OSRAM AC025XX00NJ SMART+ Switch Mini"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/philips_324131092621",children:"Philips 324131092621 Hue Dimmer switch"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/philips_8718699693985",children:"Philips 8718699693985 Hue Smart Button"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/philips_929002398602",children:"Philips 929002398602 Hue Dimmer switch v2"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/sonoff_snzb01",children:"SONOFF SNZB-01 Wireless Switch"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/xiaomi_wxcjkg11lm",children:"Xiaomi WXCJKG11LM Aqara Opple 2 button remote"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/xiaomi_wxcjkg12lm",children:"Xiaomi WXCJKG12LM Aqara Opple 4 button remote"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/xiaomi_wxcjkg13lm",children:"Xiaomi WXCJKG13LM Aqara Opple 6 button remote"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docs/blueprints/controllers/xiaomi_wxkg11lm",children:"Xiaomi WXKG01LM Mi Wireless Switch"})}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"additional-notes",children:"Additional Notes"}),"\n",(0,i.jsxs)(n.p,{children:["If you want to link multiple lights to the same controller you can either use ",(0,i.jsx)(n.a,{href:"https://www.home-assistant.io/integrations/light.group/",children:"Light Groups"})," or build multiple Hooks linked to the same Controller."]}),"\n",(0,i.jsx)(n.h2,{id:"changelog",children:"Changelog"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-03-04"}),": first blueprint version ","\ud83c\udf89"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-03-07"}),": add support for IKEA E1744 SYMFONISK rotary remote"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-03-14"}),": add support for IKEA E1812 Shortcut button, fix E1743 naming"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-03-25"}),": update action mapping for IKEA E1744. If you're using this Hook with an IKEA E1744, please update also the corresponding Controller blueprint"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-03-26"}),":"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"set minimum and maximum light brightness"}),"\n",(0,i.jsx)(n.li,{children:"specify number of steps from min to max brightness, both for short and long actions, when controlling the light"}),"\n",(0,i.jsx)(n.li,{children:"allow to force brightness to a specific value when turning on the light"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-03-27"}),": add support for Philips Hue dimmer switch"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-04-06"}),": fix light color modes not allowing to configure an automation with color temperature control."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-04-15"}),":"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"add smooth power on/off features"}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"breaking change"}),": by default the light now turns off when a brightness down command is received and light is at minimum brightness. To disable this behaviour, turn off the smooth power off feature."]}),"\n",(0,i.jsx)(n.li,{children:"fix some optional fields name."}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-04-19"}),": remove unused variable, fix warnings for undefined variables in Home Assistant Core >=2021.4.0"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-05-16"}),": Add support for Osram SMART+ Switch Mini"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-07-03"}),": Add support for Philips Hue Smart Button"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-08-02"}),": Improve inputs documentation and organization"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-10-26"}),":"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Standardize blueprints structure and inputs naming across the whole collection."}),"\n",(0,i.jsx)(n.li,{children:"Improve blueprint documentation."}),"\n",(0,i.jsxs)(n.li,{children:["\ud83c\udf89"," Add support for alternate mappings. Additional mappings for currently supported controllers will be added from now on. Refer to the documentation of your controller for more details."]}),"\n",(0,i.jsxs)(n.li,{children:["\u26a0\ufe0f"," ",(0,i.jsx)(n.strong,{children:"Breaking Change"}),": update controller names in the ",(0,i.jsx)(n.code,{children:"Controller Model"})," input, to match the full name of controllers, prevent ambiguities and enable support for alternate mappings. After updating this blueprint, please reconfigure your automations by selecting again the value for the ",(0,i.jsx)(n.code,{children:"Controller Model"})," input, matching the full name of the controller you're using with this hook."]}),"\n",(0,i.jsx)(n.li,{children:"Fix for remembering brightness level when turning on, where brightness level unavailable when light off."}),"\n",(0,i.jsx)(n.li,{children:"Added secondary mapping for IKEA E1743 TR\xc5DFRI On/Off Switch & Dimmer"}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-10-29"}),": Add support for IKEA E1766 TR\xc5DFRI Open/Close Remote."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-11-07"}),":"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Add support for IKEA E2001/E2002 STYRBAR Remote control."}),"\n",(0,i.jsx)(n.li,{children:"Fix color mode automatic detection not working properly with color temperature lights."}),"\n",(0,i.jsx)(n.li,{children:'Add "None" color mode to completely disable color control features.'}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-11-21"}),": Add support for Philips 929002398602 Hue Dimmer switch v2."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-12-03"}),": Add support for Xiaomi WXCJKG11LM, WXCJKG12LM, WXCJKG13LM."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2021-12-05"}),": Added secondary mapping for IKEA E2001/E2002"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2022-07-22"}),": Add support for Xiaomi WXKG11LM."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2022-07-30"}),": Add support for SONOFF SNZB-01."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2025-02-13"}),":"]}),"\n",(0,i.jsxs)(n.p,{children:["\u26a0\ufe0f"," ",(0,i.jsx)(n.strong,{children:"Breaking Change"}),":"]}),"\n",(0,i.jsxs)(n.p,{children:["Migrate to Zigbee2MQTT MQTT Device Triggers. (",(0,i.jsx)(n.a,{href:"https://github.com/yarafie",children:"@yarafie"}),")"]}),"\n",(0,i.jsxs)(n.p,{children:["The ",(0,i.jsx)(n.code,{children:"controller_entity"})," input has been deprecated, and ",(0,i.jsx)(n.code,{children:"controller_device"})," is now mandatory.\nIf you are a Zigbee2MQTT user and plan to update this blueprint, please make sure to remove the ",(0,i.jsx)(n.code,{children:"controller_entity"})," input from your automation config and add the device ID of your controller to the ",(0,i.jsx)(n.code,{children:"controller_device"})," input.\nTo obtain the device ID from your controller, configure the automation from the UI and use the device selector dropdown on the ",(0,i.jsx)(n.code,{children:"controller_device"})," input to select your controller."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2025-02-16"}),":"]}),"\n",(0,i.jsxs)(n.p,{children:["\u26a0\ufe0f"," ",(0,i.jsx)(n.strong,{children:"Breaking Change"}),":"]}),"\n",(0,i.jsx)(n.p,{children:"Add support for Xiaomi WXKG01LM Mi Wireless Switch, rename Xiaomi WXKG11LM Aqara Wireless Switch Mini to Aqara WXKG11LM Wireless Mini Switch"}),"\n",(0,i.jsxs)(n.p,{children:["If you had configured the ",(0,i.jsx)(n.code,{children:"controller_model"})," input to ",(0,i.jsx)(n.code,{children:"Xiaomi WXKG11LM Aqara Wireless Switch Mini"}),", please change it to ",(0,i.jsx)(n.code,{children:"Aqara WXKG11LM Wireless Mini Switch"}),".\nThe change has been implemented to match the controller with the correct manufacturer name (Aqara)."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2025-02-20"}),": Use default int when value is none (",(0,i.jsx)(n.a,{href:"https://github.com/yarafie/awesome-ha-blueprints/pull/22",children:"PR#22"}),"). (",(0,i.jsx)(n.a,{href:"https://github.com/mwinkler",children:"@mwinkler"}),")"]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"2025-02-20"}),": Added support for IKEA E2201 RODRET Dimmer. (",(0,i.jsx)(n.a,{href:"https://github.com/yarafie",children:"@yarafie"}),")"]}),"\n"]}),"\n"]})]})}function u(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}},7017:(e,n,t)=>{t.d(n,{_x:()=>x,pd:()=>a,Kg:()=>u});var r=t(6540),i=t(4848);const s=function(e){let{variant:n,children:t}=e;return(0,i.jsx)("span",{className:`badge badge--${n}`,children:t})},o={action:{type:"Action"},addon:{type:"Add-on"},area:{type:"Area"},boolean:{type:"Boolean"},device:{type:"Device"},entity:{type:"Entity"},virtual:{type:"Virtual"},number:{type:"Number"},object:{type:"Object"},select:{type:"Select"},target:{type:"Target"},text:{type:"Text"},time:{type:"Time"},none:{type:"Text"}},l={inputName:{fontWeight:600},inputDescription:{fontSize:"0.9rem"}};const a=function(e){let{selector:n,required:t,name:r,description:a,deprecated:h,virtual:c}=e;const d=n?o[n]:o.none;return(0,i.jsxs)("div",{children:[(0,i.jsxs)("span",{style:l.inputName,children:[r," ",(0,i.jsx)(s,{variant:"primary",children:d.type})," ",t?(0,i.jsxs)(s,{variant:"warning",children:[t," Required"]}):(0,i.jsx)(s,{variant:"info",children:"Optional"})," ",c&&(0,i.jsx)(s,{variant:"secondary",children:"Virtual"}),h&&(0,i.jsx)(s,{variant:"danger",children:"Deprecated"})]}),(0,i.jsx)("br",{}),(0,i.jsx)("p",{style:l.inputDescription,className:"margin-top--sm",children:a}),(0,i.jsx)("hr",{})]})},h={requirementNameContainer:{paddingBottom:"0.8rem"},requirementName:{display:"inline"}};const c=function(e){let{name:n,required:t,children:r}=e;return(0,i.jsxs)("div",{className:"margin-bottom--lg",children:[(0,i.jsxs)("div",{style:h.requirementNameContainer,children:[(0,i.jsxs)("h3",{style:h.requirementName,children:[n," "]}),t?(0,i.jsxs)(s,{variant:"warning",children:[t," Required"]}):(0,i.jsx)(s,{variant:"info",children:"Optional"})]}),r]})};const d={zigbee2mqtt:function(e){let{required:n,refers:t,children:r}=e;return(0,i.jsxs)(c,{name:"Zigbee2MQTT Integration",required:n,children:[(0,i.jsxs)("p",{children:["If you plan to integrate the ",t," with Zigbee2MQTT, you must have this integration set up. Installation methods differ between different installation types. Check out the documentation for full details on the required hardware and how to set up Zigbee2MQTT on your system."]}),(0,i.jsx)("p",{children:r}),(0,i.jsx)("a",{href:"https://www.zigbee2mqtt.io/",children:"Zigbee2MQTT Docs"})]})},zha:function(e){let{required:n,refers:t,children:r}=e;return(0,i.jsxs)(c,{name:"ZHA Integration",required:n,children:[(0,i.jsxs)("p",{children:["If you plan to integrate the ",t," with ZHA, you must have this integration set up. The ZHA integration can be configured from the Home Assistant UI. Check the documentation for full details on the required hardware and how to set up ZHA on your system."]}),(0,i.jsx)("p",{children:r}),(0,i.jsx)("a",{href:"https://www.home-assistant.io/integrations/zha/",children:"ZHA Integration Docs"})]})},deconz:function(e){let{required:n,refers:t,children:r}=e;return(0,i.jsxs)(c,{name:"deCONZ Integration",required:n,children:[(0,i.jsxs)("p",{children:["If you plan to integrate the ",t," with deCONZ, you must have this integration set up. The deCONZ integration can be configured from the Home Assistant UI and requires an additional container to run deCONZ on. Head over to the documentation for full details on the required hardware and how to set up deCONZ on your system."]}),(0,i.jsx)("p",{children:r}),(0,i.jsx)("a",{href:"https://www.home-assistant.io/integrations/deconz/",children:"deCONZ Integration Docs"})]})},controller:function(e){let{required:n,children:t}=e;return(0,i.jsxs)(c,{name:"Controller Automation",required:n,children:[(0,i.jsxs)("p",{children:["To use this blueprint you need to first create an automation with a Controller blueprint. You can then create an automation with this Hook,"," ",(0,i.jsx)("b",{children:"making sure that you provide the same controller device used in the corresponding Controller blueprint"}),". This key step will link the two automations and ensure the Hook will respond to events fired by the Controller."]}),(0,i.jsx)("p",{children:t}),(0,i.jsx)("a",{href:"#supported-controllers",children:"List of Supported Controllers"})," -"," ",(0,i.jsx)("a",{href:"https://yarafie.github.io/awesome-ha-blueprints/blueprints/controllers",children:"Controllers Docs"})]})}};const u=function(e){let{id:n,required:t,name:r,refers:s,children:o}=e;const l=n?d[n]:c;return(0,i.jsx)(l,{name:r,required:t,refers:s,children:o})};var p=t(6447);const m={myHomeAssistantImage:{width:"100%",maxWidth:212}};const x=function(e){let{category:n,id:t}=e;const[s,o]=(0,r.useState)(!1),l=`https://github.com/yarafie/awesome-ha-blueprints/blob/main/blueprints/${n}/${t}/${t}.yaml`;return(0,i.jsxs)("div",{className:"card item shadow--md",children:[(0,i.jsx)("div",{className:"card__header margin-bottom--md",children:(0,i.jsx)("h3",{children:"Import this blueprint"})}),(0,i.jsx)("div",{className:"card__body",children:(0,i.jsxs)("div",{className:"row row--no-gutters",children:[(0,i.jsxs)("div",{className:"col col--6",children:[(0,i.jsx)("h5",{children:"My Home Assistant"}),(0,i.jsxs)("p",{children:[(0,i.jsx)("a",{href:`https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=${escape(l)}`,target:"_blank",rel:"noreferrer",children:(0,i.jsx)("img",{src:"https://my.home-assistant.io/badges/blueprint_import.svg",alt:"Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled.",style:m.myHomeAssistantImage})}),(0,i.jsx)("br",{}),(0,i.jsx)("small",{children:"(Home Assistant 2024.10.0 or higher)"})]})]}),(0,i.jsxs)("div",{className:"col col--6",children:[(0,i.jsx)("h5",{children:"Direct Link"}),(0,i.jsx)("button",{type:"button",className:"button button--"+(s?"success":"primary"),onClick:async()=>{await navigator.clipboard.writeText(l),o(!0)},children:(0,i.jsxs)("span",{children:[(0,i.jsx)(p.A,{size:16}),(0,i.jsxs)("span",{children:[" ",s?"Link Copied!":"Copy Link"]})]})})]})]})})]})}},6447:(e,n,t)=>{t.d(n,{A:()=>h});var r=t(6540),i=t(5556),s=t.n(i),o=["color","size","title","className"];function l(){return l=Object.assign?Object.assign.bind():function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)({}).hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e},l.apply(null,arguments)}var a=(0,r.forwardRef)((function(e,n){var t=e.color,i=void 0===t?"currentColor":t,s=e.size,a=void 0===s?"1em":s,h=e.title,c=void 0===h?null:h,d=e.className,u=void 0===d?"":d,p=function(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(n.includes(r))continue;t[r]=e[r]}return t}(e,n);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)t=s[r],n.includes(t)||{}.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}(e,o);return r.createElement("svg",l({ref:n,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",width:a,height:a,fill:i,className:["bi","bi-clipboard-plus",u].filter(Boolean).join(" ")},p),c?r.createElement("title",null,c):null,r.createElement("path",{fillRule:"evenodd",d:"M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7"}),r.createElement("path",{d:"M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"}),r.createElement("path",{d:"M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"}))}));a.propTypes={color:s().string,size:s().oneOfType([s().string,s().number]),title:s().string,className:s().string};const h=a},8453:(e,n,t)=>{t.d(n,{R:()=>o,x:()=>l});var r=t(6540);const i={},s=r.createContext(i);function o(e){const n=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);