"use strict";(self.webpackChunkawesome_ha_blueprints_website=self.webpackChunkawesome_ha_blueprints_website||[]).push([[4068],{1033:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>d,contentTitle:()=>h,default:()=>p,frontMatter:()=>l,metadata:()=>i,toc:()=>c});const i=JSON.parse('{"id":"blueprints/hooks/light","title":"Hook - Light","description":"This Hook blueprint allows to build a controller-based automation to control a light. Supports brightness and color control both for white temperature and rgb lights.","source":"@site/docs/blueprints/hooks/light.mdx","sourceDirName":"blueprints/hooks","slug":"/blueprints/hooks/light","permalink":"/awesome-ha-blueprints/docs/blueprints/hooks/light","draft":false,"unlisted":false,"editUrl":"https://github.com/yarafie/awesome-ha-blueprints/edit/main/docs/blueprints/hooks/light.mdx","tags":[],"version":"current","frontMatter":{"title":"Hook - Light","description":"This Hook blueprint allows to build a controller-based automation to control a light. Supports brightness and color control both for white temperature and rgb lights."}}');var s=r(7557),o=r(7389),t=r(5561);const l={title:"Hook - Light",description:"This Hook blueprint allows to build a controller-based automation to control a light. Supports brightness and color control both for white temperature and rgb lights."},h=void 0,d={},c=[{value:"Description",id:"description",level:2},{value:"Requirements",id:"requirements",level:2},{value:"Inputs",id:"inputs",level:2},{value:"Supported Controllers",id:"supported-controllers",level:2},{value:"Additional Notes",id:"additional-notes",level:2},{value:"Changelog",id:"changelog",level:2}];function a(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...(0,o.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(t._x,{id:"light",category:"hooks"}),"\n",(0,s.jsx)("br",{}),"\n",(0,s.jsx)(n.admonition,{type:"tip",children:(0,s.jsxs)(n.p,{children:["This blueprint is part of the ",(0,s.jsx)(n.strong,{children:"Controllers-Hooks Ecosystem"}),". You can read more about this topic ",(0,s.jsx)(n.a,{href:"/docs/controllers-hooks-ecosystem",children:"here"}),"."]})}),"\n",(0,s.jsx)(n.h2,{id:"description",children:"Description"}),"\n",(0,s.jsx)(n.p,{children:"This Hook blueprint allows to build a controller-based automation to control a light. Supports brightness and color control both for white temperature and rgb lights."}),"\n",(0,s.jsxs)(n.admonition,{type:"info",children:[(0,s.jsxs)(n.p,{children:["An automation created with this blueprint must be linked to a ",(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers",children:"Controller"})," automation. Controllers are blueprints which allow to easily integrate a wide range of controllers and use them to run a set of actions when interacting with them. They expose an abstract interface used by Hooks to create controller-based automations."]}),(0,s.jsxs)(n.p,{children:["See the list of ",(0,s.jsx)(n.a,{href:"#supported-controllers",children:"Controllers supported by this Hook"})," for additional details."]})]}),"\n",(0,s.jsx)(n.h2,{id:"requirements",children:"Requirements"}),"\n",(0,s.jsx)(t.Kg,{id:"controller",required:!0}),"\n",(0,s.jsxs)(t.Kg,{name:"Light Integration",required:!0,children:[(0,s.jsx)(n.p,{children:"This integration provides the entity which represents a light in Home Assistant. It should be activated by default so unless you tweaked the default configuration you're good to go."}),(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://www.home-assistant.io/integrations/light/",children:"Light Integration Docs"})})]}),"\n",(0,s.jsx)(n.h2,{id:"inputs",children:"Inputs"}),"\n",(0,s.jsx)(t.G0,{category:"hooks",id:"light"}),"\n",(0,s.jsx)(n.h2,{id:"supported-controllers",children:"Supported Controllers"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/xiaomi_wxkg11lm",children:"Aqara WXKG11LM Wireless Mini Switch"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e1524_e1810",children:"IKEA E1524/E1810 TR\xc5DFRI Wireless 5-Button Remote"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e1743",children:"IKEA E1743 TR\xc5DFRI On/Off Switch & Dimmer"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e1744",children:"IKEA E1744 SYMFONISK Rotary Remote"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e1766",children:"IKEA E1766 TR\xc5DFRI Open/Close Remote"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e1812",children:"IKEA E1812 TR\xc5DFRI Shortcut button"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e2001_e2002",children:"IKEA E2001/E2002 STYRBAR Remote control"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e2123",children:"IKEA E2123 SYMFONISK sound remote, gen 2"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e2201",children:"IKEA E2201 RODRET Dimmer"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_e2213",children:"IKEA E2213 SOMRIG shortcut button"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/ikea_ictc_g_1",children:"IKEA ICTC-G-1 TR\xc5DFRI wireless dimmer"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/osram_ac025xx00nj",children:"OSRAM AC025XX00NJ SMART+ Switch Mini"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/philips_324131092621",children:"Philips 324131092621 Hue Dimmer switch"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/philips_8718699693985",children:"Philips 8718699693985 Hue Smart Button"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/philips_929002398602",children:"Philips 929002398602 Hue Dimmer switch v2"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/smarthjemmet_dk_quad_zig_sw",children:"Smarthjemmet.dk QUAD-ZIG-SW 4 button remote"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/sonoff_snzb01",children:"SONOFF SNZB-01 Wireless Switch"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/tuya_ERS-10TZBVK-AA",children:"Tuya ERS-10TZBVK-AA Smart knob"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/xiaomi_wxcjkg11lm",children:"Xiaomi WXCJKG11LM Aqara Opple 2 button remote"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/xiaomi_wxcjkg12lm",children:"Xiaomi WXCJKG12LM Aqara Opple 4 button remote"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/xiaomi_wxcjkg13lm",children:"Xiaomi WXCJKG13LM Aqara Opple 6 button remote"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"/docs/blueprints/controllers/xiaomi_wxkg11lm",children:"Xiaomi WXKG01LM Mi Wireless Switch"})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"additional-notes",children:"Additional Notes"}),"\n",(0,s.jsxs)(n.p,{children:["If you want to link multiple lights to the same controller you can either use ",(0,s.jsx)(n.a,{href:"https://www.home-assistant.io/integrations/light.group/",children:"Light Groups"})," or build multiple Hooks linked to the same Controller."]}),"\n",(0,s.jsx)(n.h2,{id:"changelog",children:"Changelog"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-03-04"}),": first blueprint version ","\ud83c\udf89"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-03-07"}),": add support for IKEA E1744 SYMFONISK rotary remote"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-03-14"}),": add support for IKEA E1812 Shortcut button, fix E1743 naming"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-03-25"}),": update action mapping for IKEA E1744. If you're using this Hook with an IKEA E1744, please update also the corresponding Controller blueprint"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-03-26"}),":"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"set minimum and maximum light brightness"}),"\n",(0,s.jsx)(n.li,{children:"specify number of steps from min to max brightness, both for short and long actions, when controlling the light"}),"\n",(0,s.jsx)(n.li,{children:"allow to force brightness to a specific value when turning on the light"}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-03-27"}),": add support for Philips Hue dimmer switch"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-04-06"}),": fix light color modes not allowing to configure an automation with color temperature control."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-04-15"}),":"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"add smooth power on/off features"}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"breaking change"}),": by default the light now turns off when a brightness down command is received and light is at minimum brightness. To disable this behaviour, turn off the smooth power off feature."]}),"\n",(0,s.jsx)(n.li,{children:"fix some optional fields name."}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-04-19"}),": remove unused variable, fix warnings for undefined variables in Home Assistant Core >=2021.4.0"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-05-16"}),": Add support for Osram SMART+ Switch Mini"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-07-03"}),": Add support for Philips Hue Smart Button"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-08-02"}),": Improve inputs documentation and organization"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-10-26"}),":"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Standardize blueprints structure and inputs naming across the whole collection."}),"\n",(0,s.jsx)(n.li,{children:"Improve blueprint documentation."}),"\n",(0,s.jsxs)(n.li,{children:["\ud83c\udf89"," Add support for alternate mappings. Additional mappings for currently supported controllers will be added from now on. Refer to the documentation of your controller for more details."]}),"\n",(0,s.jsxs)(n.li,{children:["\u26a0\ufe0f"," ",(0,s.jsx)(n.strong,{children:"Breaking Change"}),": update controller names in the ",(0,s.jsx)(n.code,{children:"Controller Model"})," input, to match the full name of controllers, prevent ambiguities and enable support for alternate mappings. After updating this blueprint, please reconfigure your automations by selecting again the value for the ",(0,s.jsx)(n.code,{children:"Controller Model"})," input, matching the full name of the controller you're using with this hook."]}),"\n",(0,s.jsx)(n.li,{children:"Fix for remembering brightness level when turning on, where brightness level unavailable when light off."}),"\n",(0,s.jsx)(n.li,{children:"Added secondary mapping for IKEA E1743 TR\xc5DFRI On/Off Switch & Dimmer"}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-10-29"}),": Add support for IKEA E1766 TR\xc5DFRI Open/Close Remote."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-11-07"}),":"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Add support for IKEA E2001/E2002 STYRBAR Remote control."}),"\n",(0,s.jsx)(n.li,{children:"Fix color mode automatic detection not working properly with color temperature lights."}),"\n",(0,s.jsx)(n.li,{children:'Add "None" color mode to completely disable color control features.'}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-11-21"}),": Add support for Philips 929002398602 Hue Dimmer switch v2."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-12-03"}),": Add support for Xiaomi WXCJKG11LM, WXCJKG12LM, WXCJKG13LM."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2021-12-05"}),": Added secondary mapping for IKEA E2001/E2002"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2022-07-22"}),": Add support for Xiaomi WXKG11LM."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2022-07-30"}),": Add support for SONOFF SNZB-01."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2025-02-13"}),":"]}),"\n",(0,s.jsxs)(n.p,{children:["\u26a0\ufe0f"," ",(0,s.jsx)(n.strong,{children:"Breaking Change"}),":"]}),"\n",(0,s.jsxs)(n.p,{children:["Migrate to Zigbee2MQTT MQTT Device Triggers. (",(0,s.jsx)(n.a,{href:"https://github.com/yarafie",children:"@yarafie"}),")"]}),"\n",(0,s.jsxs)(n.p,{children:["The ",(0,s.jsx)(n.code,{children:"controller_entity"})," input has been deprecated, and ",(0,s.jsx)(n.code,{children:"controller_device"})," is now mandatory.\nIf you are a Zigbee2MQTT user and plan to update this blueprint, please make sure to remove the ",(0,s.jsx)(n.code,{children:"controller_entity"})," input from your automation config and add the device ID of your controller to the ",(0,s.jsx)(n.code,{children:"controller_device"})," input.\nTo obtain the device ID from your controller, configure the automation from the UI and use the device selector dropdown on the ",(0,s.jsx)(n.code,{children:"controller_device"})," input to select your controller."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2025-02-16"}),":"]}),"\n",(0,s.jsxs)(n.p,{children:["\u26a0\ufe0f"," ",(0,s.jsx)(n.strong,{children:"Breaking Change"}),":"]}),"\n",(0,s.jsx)(n.p,{children:"Add support for Xiaomi WXKG01LM Mi Wireless Switch, rename Xiaomi WXKG11LM Aqara Wireless Switch Mini to Aqara WXKG11LM Wireless Mini Switch"}),"\n",(0,s.jsxs)(n.p,{children:["If you had configured the ",(0,s.jsx)(n.code,{children:"controller_model"})," input to ",(0,s.jsx)(n.code,{children:"Xiaomi WXKG11LM Aqara Wireless Switch Mini"}),", please change it to ",(0,s.jsx)(n.code,{children:"Aqara WXKG11LM Wireless Mini Switch"}),".\nThe change has been implemented to match the controller with the correct manufacturer name (Aqara)."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2025-02-20"}),": Use default int when value is none (",(0,s.jsx)(n.a,{href:"https://github.com/yarafie/awesome-ha-blueprints/pull/22",children:"PR#22"}),"). (",(0,s.jsx)(n.a,{href:"https://github.com/mwinkler",children:"@mwinkler"}),")"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2025-02-28"}),": Added support for Smarthjemmet.dk QUAD-ZIG-SW 4 button remote. (",(0,s.jsx)(n.a,{href:"https://github.com/Nicolai-",children:"@Nicolai-"}),")"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2025-02-28"}),": Added support for Tuya ERS-10TZBVK-AA Smart knob. (",(0,s.jsx)(n.a,{href:"https://github.com/yarafie",children:"@yarafie"}),")"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2025-03-01"}),": Added support for IKEA E2213 SOMRIG shortcut button. (",(0,s.jsx)(n.a,{href:"https://github.com/yarafie",children:"@yarafie"}),")"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2025-03-01"}),": Added support for IKEA E2123 SYMFONISK sound remote, gen 2. (",(0,s.jsx)(n.a,{href:"https://github.com/yarafie",children:"@yarafie"}),")"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2025-03-18"}),': use min_brightness and max_brightness as conditions instead of "while true" loops ',(0,s.jsx)(n.a,{href:"https://github.com/Nicolai-",children:"@Nicolai-"}),"."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"2025-03-20"}),": Added support for IKEA E2201 RODRET Dimmer. (",(0,s.jsx)(n.a,{href:"https://github.com/yarafie",children:"@yarafie"}),")"]}),"\n"]}),"\n"]})]})}function p(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(a,{...e})}):a(e)}}}]);