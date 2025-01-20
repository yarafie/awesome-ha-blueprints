"use strict";(self.webpackChunkawesome_ha_blueprints_website=self.webpackChunkawesome_ha_blueprints_website||[]).push([[66],{5680:(e,t,n)=>{n.d(t,{xA:()=>p,yg:()=>g});var o=n(6540);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,o,i=function(e,t){if(null==e)return{};var n,o,i={},r=Object.keys(e);for(o=0;o<r.length;o++)n=r[o],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(o=0;o<r.length;o++)n=r[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var l=o.createContext({}),u=function(e){var t=o.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},p=function(e){var t=u(e.components);return o.createElement(l.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},m=o.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),m=u(n),g=i,h=m["".concat(l,".").concat(g)]||m[g]||c[g]||r;return n?o.createElement(h,a(a({ref:t},p),{},{components:n})):o.createElement(h,a({ref:t},p))}));function g(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,a=new Array(r);a[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:i,a[1]=s;for(var u=2;u<r;u++)a[u]=n[u];return o.createElement.apply(null,a)}return o.createElement.apply(null,n)}m.displayName="MDXCreateElement"},3940:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>a,default:()=>c,frontMatter:()=>r,metadata:()=>s,toc:()=>u});var o=n(8168),i=(n(6540),n(5680));const r={title:"Introduction"},a=void 0,s={unversionedId:"introduction",id:"introduction",title:"Introduction",description:"Overview",source:"@site/docs/introduction.mdx",sourceDirName:".",slug:"/introduction",permalink:"/awesome-ha-blueprints/docs/introduction",draft:!1,editUrl:"https://github.com/yarafie/awesome-ha-blueprints/edit/main/docs/introduction.mdx",tags:[],version:"current",frontMatter:{title:"Introduction"},sidebar:"docs",next:{title:"Importing a Blueprint",permalink:"/awesome-ha-blueprints/docs/importing-a-blueprint"}},l={},u=[{value:"Overview",id:"overview",level:2},{value:"Getting started",id:"getting-started",level:2},{value:"Using blueprints",id:"using-blueprints",level:3},{value:"Contributing",id:"contributing",level:3},{value:"Additional Resources",id:"additional-resources",level:2}],p={toc:u};function c(e){let{components:t,...n}=e;return(0,i.yg)("wrapper",(0,o.A)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.yg)("h2",{id:"overview"},"Overview"),(0,i.yg)("p",null,"With the ",(0,i.yg)("strong",{parentName:"p"},"Home Assistant 2020.12 Release"),", a new exciting feature was introduced: ",(0,i.yg)("em",{parentName:"p"},"Blueprints"),"."),(0,i.yg)("p",null,"Blueprints, which currently are available only for the ",(0,i.yg)("inlineCode",{parentName:"p"},"automation")," domain, are highly reusable configurations for the home automation hub."),(0,i.yg)("p",null,"For automations, an interesting use-case is described in the ",(0,i.yg)("a",{parentName:"p",href:"https://www.home-assistant.io/docs/blueprint/"},"Official Blueprint Documentation"),":"),(0,i.yg)("blockquote",null,(0,i.yg)("p",{parentName:"blockquote"},"Imagine a blueprint that controls a light based on motion, that allows you to configure the motion sensor to trigger on, and the light to control."),(0,i.yg)("p",{parentName:"blockquote"},"It is now possible to create two automations that each have their own configuration for this blueprint and that act completely independent, yet are based on the same automation configuration.")),(0,i.yg)("p",null,"One of the major advantages of Blueprints is their ability to be customized by any user, adapting to their needs, ",(0,i.yg)("strong",{parentName:"p"},"directly from the UI, without ever writing a single YAML line"),"."),(0,i.yg)("p",null,(0,i.yg)("strong",{parentName:"p"},"Awesome HA Blueprints")," is a curated list of automation blueprints for Home Assistant, which can then be easily imported and updated in any Home Assistant instance. Each blueprint included in the collection is:"),(0,i.yg)("ul",null,(0,i.yg)("li",{parentName:"ul"},(0,i.yg)("strong",{parentName:"li"},"Highly customizable")," and ",(0,i.yg)("strong",{parentName:"li"},"flexible")," to user needs, but still hiding the complexity of their internal working to the user;"),(0,i.yg)("li",{parentName:"ul"},(0,i.yg)("strong",{parentName:"li"},"Reliable")," on most situations and corner cases;"),(0,i.yg)("li",{parentName:"ul"},(0,i.yg)("strong",{parentName:"li"},"Fully maintained"),", collaboratively ",(0,i.yg)("strong",{parentName:"li"},"developed")," and ",(0,i.yg)("strong",{parentName:"li"},"tested by the community"),".")),(0,i.yg)("p",null,"One of the main focuses of the project is on ",(0,i.yg)("strong",{parentName:"p"},"Reliability"),". With more and more people looking into home automation every day, it's important that our smart homes run on reliable software. This includes not only server OSs, home automation hubs, and general services, but also the automations we use throughout the day."),(0,i.yg)("p",null,"The ",(0,i.yg)("strong",{parentName:"p"},"ultimate goal")," of Awesome HA Blueprints is to ",(0,i.yg)("strong",{parentName:"p"},"develop an highly valuable resource")," for Home Assistant newcomers who would like to include ",(0,i.yg)("strong",{parentName:"p"},"complex automations")," in their home automation setups ",(0,i.yg)("strong",{parentName:"p"},"with just a few clicks"),", without even touching a single line of code."),(0,i.yg)("h2",{id:"getting-started"},"Getting started"),(0,i.yg)("h3",{id:"using-blueprints"},"Using blueprints"),(0,i.yg)("p",null,"You can browse the collection of available blueprints ",(0,i.yg)("a",{parentName:"p",href:"blueprints"},"here"),". Every blueprint is associated with a documentation page in this website, which states all the information you need to properly configure blueprints on your instance."),(0,i.yg)("p",null,"If you have any doubts on how to setup blueprints on your system, visit the ",(0,i.yg)("a",{parentName:"p",href:"importing-a-blueprint"},"Importing a Blueprint")," page."),(0,i.yg)("p",null,"You might be also interested in knowing more about Controllers and Hooks, special blueprints which allow you to build complex controller-based automations in just a few clicks. More on the topic ",(0,i.yg)("a",{parentName:"p",href:"controllers-hooks-ecosystem"},"here"),"."),(0,i.yg)("h3",{id:"contributing"},"Contributing"),(0,i.yg)("p",null,"Loving Awesome HA Blueprints and want to help? Thanks! There are plenty of ways you can contribute.",(0,i.yg)("br",null),"New or updates to blueprints and documentation, as well as any suggestion on organization, guidelines, or anything else that can improve the interaction with the project would be highly appreciated."),(0,i.yg)("p",null,"Please check out the ",(0,i.yg)("a",{parentName:"p",href:"contributing"},"Contributing section")," for additional information on how to contribute. From issues to new blueprints submissions, everything is described in detail to make sure the community can benefit the most from your contribution."),(0,i.yg)("h2",{id:"additional-resources"},"Additional Resources"),(0,i.yg)("ul",null,(0,i.yg)("li",{parentName:"ul"},(0,i.yg)("a",{parentName:"li",href:"https://www.home-assistant.io/docs/blueprint/"},"Home Assistant official documentation on Blueprints")," if you want to learn more about blueprints, how to create and use them in your Home Assistant installation;"),(0,i.yg)("li",{parentName:"ul"},(0,i.yg)("a",{parentName:"li",href:"https://community.home-assistant.io/c/blueprints-exchange"},"Home Assistant Blueprint Exchange forum")," the official resource for sharing blueprints within the community, which is currently seeing an intense activity from the community;"),(0,i.yg)("li",{parentName:"ul"},(0,i.yg)("a",{parentName:"li",href:"https://youtu.be/oFcRe91LH1E"},"Beginner's Guide to Blueprints")," a YouTube video by Zack Barett which describes how to import, use and create blueprints.")))}c.isMDXComponent=!0}}]);