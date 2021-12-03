"use strict";(self.webpackChunkawesome_ha_blueprints_website=self.webpackChunkawesome_ha_blueprints_website||[]).push([[360],{4590:function(e,t,i){i.r(t),i.d(t,{frontMatter:function(){return l},contentTitle:function(){return u},metadata:function(){return s},toc:function(){return p},default:function(){return d}});var n=i(7462),o=i(3366),a=(i(7294),i(3905)),r=["components"],l={title:"Contributing",description:"Contribution Guidelines for the Awesome HA Blueprints project."},u=void 0,s={unversionedId:"contributing",id:"contributing",isDocsHomePage:!1,title:"Contributing",description:"Contribution Guidelines for the Awesome HA Blueprints project.",source:"@site/docs/contributing.mdx",sourceDirName:".",slug:"/contributing",permalink:"/awesome-ha-blueprints/docs/contributing",editUrl:"https://github.com/EPMatt/awesome-ha-blueprints/edit/main/docs/contributing.mdx",tags:[],version:"current",frontMatter:{title:"Contributing",description:"Contribution Guidelines for the Awesome HA Blueprints project."},sidebar:"docs",previous:{title:"Controllers-Hooks Ecosystem",permalink:"/awesome-ha-blueprints/docs/controllers-hooks-ecosystem"},next:{title:"Overview",permalink:"/awesome-ha-blueprints/docs/blueprints"}},p=[{value:"How to Contribute",id:"how-to-contribute",children:[{value:"1. I have an issue with a blueprint",id:"1-i-have-an-issue-with-a-blueprint",children:[],level:3},{value:"2. I want to add a blueprint to the project",id:"2-i-want-to-add-a-blueprint-to-the-project",children:[],level:3},{value:"3. I want to improve an existing blueprint",id:"3-i-want-to-improve-an-existing-blueprint",children:[],level:3},{value:"4. I&#39;ve a question regarding a blueprint / this project",id:"4-ive-a-question-regarding-a-blueprint--this-project",children:[],level:3},{value:"5. I&#39;ve an idea for a new blueprint but I need help to develop it",id:"5-ive-an-idea-for-a-new-blueprint-but-i-need-help-to-develop-it",children:[],level:3}],level:2},{value:"Blueprint Guidelines",id:"blueprint-guidelines",children:[],level:2}],h={toc:p};function d(e){var t=e.components,i=(0,o.Z)(e,r);return(0,a.kt)("wrapper",(0,n.Z)({},h,i,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("div",{className:"admonition admonition-info alert alert--info"},(0,a.kt)("div",{parentName:"div",className:"admonition-heading"},(0,a.kt)("h5",{parentName:"div"},(0,a.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,a.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,a.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"}))),"Note")),(0,a.kt)("div",{parentName:"div",className:"admonition-content"},(0,a.kt)("p",{parentName:"div"},"This documentation section is currently under review."))),(0,a.kt)("p",null,"The goal of this project is to keep a curated collection of blueprints for Home Assistant entirely maintained by the community. Therefore, any contribution to this project is highly appreciated and welcomed! \ud83d\ude80"),(0,a.kt)("p",null,"Please consider that this project is released under the ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/EPMatt/awesome-ha-blueprints/blob/main/LICENSE"},"GPL-3.0 License"),", and any discussion or interaction must adhere with the ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/EPMatt/awesome-ha-blueprints/blob/main/CODE_OF_CONDUCT.md"},"Contributor Covenant Code of Conduct"),". Make sure to read and agree with those terms before submitting your contribution."),(0,a.kt)("p",null,"Also, keep in mind that any of the following operations require that you've succesfully created a ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/"},"GitHub")," account. If you have any troubles working with GitHub please consider taking a look at the ",(0,a.kt)("a",{parentName:"p",href:"https://docs.github.com/"},"Official GitHub Docs"),"."),(0,a.kt)("h2",{id:"how-to-contribute"},"How to Contribute"),(0,a.kt)("h3",{id:"1-i-have-an-issue-with-a-blueprint"},"1. I have an issue with a blueprint"),(0,a.kt)("p",null,"Please open an issue in the ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/EPMatt/awesome-ha-blueprints/issues"},"Issues tab")," using the ",(0,a.kt)("strong",{parentName:"p"},"Blueprint Bug Report")," template and fill in all the requested fields in the template before submitting the issue."),(0,a.kt)("h3",{id:"2-i-want-to-add-a-blueprint-to-the-project"},"2. I want to add a blueprint to the project"),(0,a.kt)("p",null,"Amazing! The following steps will guide you through the process of adding your contribution to this project:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Fork this repo on your private GitHub account;"),(0,a.kt)("li",{parentName:"ul"},"Clone the forked repository on your computer;"),(0,a.kt)("li",{parentName:"ul"},"Create a new branch ",(0,a.kt)("strong",{parentName:"li"},"named as your new blueprint"),". This step will ease the operations required for merging your changes into this repository;"),(0,a.kt)("li",{parentName:"ul"},"Make sure to checkout the new branch so you can start to work on your contribution;"),(0,a.kt)("li",{parentName:"ul"},"Copy the example blueprint folder ",(0,a.kt)("inlineCode",{parentName:"li"},"blueprints/automation/_example")," into ",(0,a.kt)("inlineCode",{parentName:"li"},"blueprints/automation"),", renaming the folder with your blueprint name. This is the folder when all files for your blueprint will reside;"),(0,a.kt)("li",{parentName:"ul"},"Inside your blueprint's folder:",(0,a.kt)("ul",{parentName:"li"},(0,a.kt)("li",{parentName:"ul"},"rename the ",(0,a.kt)("inlineCode",{parentName:"li"},"_example.yaml")," file with the name of your blueprint;"),(0,a.kt)("li",{parentName:"ul"},"Add the code for your blueprint in the ",(0,a.kt)("inlineCode",{parentName:"li"},".yaml")," file you've just renamed. Please make sure to follow the ",(0,a.kt)("a",{parentName:"li",href:"#Blueprint-Guidelines"},"Blueprint Guidelines"),";"),(0,a.kt)("li",{parentName:"ul"},"Write the documentation for your blueprint in the ",(0,a.kt)("inlineCode",{parentName:"li"},"README.md")," file. Make sure to fill in all the required information for the documentation template file;"))),(0,a.kt)("li",{parentName:"ul"},"After you've reviewed your work commit;"),(0,a.kt)("li",{parentName:"ul"},"Push the branch with the changes to your fork;"),(0,a.kt)("li",{parentName:"ul"},"Navigate to the webpage for your repo on GitHub, go to the Pull Requests tab and open a new Pull Request. Make sure to select ",(0,a.kt)("inlineCode",{parentName:"li"},"awesome-ha-blueprints/main")," as base branch. Provide a description for the Pull Request, then click on ",(0,a.kt)("strong",{parentName:"li"},"Open Pull Request"),";"),(0,a.kt)("li",{parentName:"ul"},"You're all set! The PR will be reviewed and eventually your contribution will be merged in this repository. Thank you very much for having spent your time and energy to help the Home Assistant community! \ud83d\udd25"),(0,a.kt)("li",{parentName:"ul"},"You can now safely delete your fork.")),(0,a.kt)("h3",{id:"3-i-want-to-improve-an-existing-blueprint"},"3. I want to improve an existing blueprint"),(0,a.kt)("p",null,"Amazing! The following steps will guide you through the process of adding your contribution to this project:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Fork this repo on your private GitHub account;"),(0,a.kt)("li",{parentName:"ul"},"Clone the forked repository on your computer;"),(0,a.kt)("li",{parentName:"ul"},"Create a new branch ",(0,a.kt)("strong",{parentName:"li"},"named as the blueprint you want to edit"),". This step will ease the operations required for merging your changes into this repository;"),(0,a.kt)("li",{parentName:"ul"},"Make sure to checkout the new branch so you can start to work on your contribution;"),(0,a.kt)("li",{parentName:"ul"},"Make your edits to the blueprint. Please make sure to follow the ",(0,a.kt)("a",{parentName:"li",href:"#Blueprint-Guidelines"},"Blueprint Guidelines"),";"),(0,a.kt)("li",{parentName:"ul"},"Make your edits to the blueprint ",(0,a.kt)("inlineCode",{parentName:"li"},"README.md")," documentation file. Make sure to fill in all the required information for the documentation template file;"),(0,a.kt)("li",{parentName:"ul"},"Push your branch with the changes to your fork;"),(0,a.kt)("li",{parentName:"ul"},"Navigate to the webpage for your repo on GitHub, go to the Pull Requests tab and open a new Pull Request. Make sure to select ",(0,a.kt)("inlineCode",{parentName:"li"},"awesome-ha-blueprints/main")," as base branch. Provide a description for the Pull Request, then click on ",(0,a.kt)("strong",{parentName:"li"},"Open Pull Request"),";"),(0,a.kt)("li",{parentName:"ul"},"You're all set! The PR will be reviewed and eventually your contribution will be merged in this repository. Thank you very much for having spent your time and energy to help the Home Assistant community! \ud83d\udd25"),(0,a.kt)("li",{parentName:"ul"},"You can now safely delete your fork.")),(0,a.kt)("h3",{id:"4-ive-a-question-regarding-a-blueprint--this-project"},"4. I've a question regarding a blueprint / this project"),(0,a.kt)("p",null,"Please open a discussion in the ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/EPMatt/awesome-ha-blueprints/discussions"},"Discussions tab"),". Add your question in the ",(0,a.kt)("strong",{parentName:"p"},"Q/A")," category. The community will be glad to help you!"),(0,a.kt)("h3",{id:"5-ive-an-idea-for-a-new-blueprint-but-i-need-help-to-develop-it"},"5. I've an idea for a new blueprint but I need help to develop it"),(0,a.kt)("p",null,"Please open an issue in the ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/EPMatt/awesome-ha-blueprints/discussions"},"Issues tab")," using the ",(0,a.kt)("strong",{parentName:"p"},"New Blueprint Suggestion")," template and fill in all the requested fields in the template before submitting the issue."),(0,a.kt)("h2",{id:"blueprint-guidelines"},"Blueprint Guidelines"),(0,a.kt)("p",null,"To ensure the delivery of good quality, highly reusable blueprints which can be widely adopted across the community, blueprints must adhere to the following guidelines:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"Clarity and Descriptiveness"),": don't use ambiguous names and identifiers. Include clear descriptions for both the blueprint and its inputs."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"Flexibility"),": your blueprint must be as general as possible, and should adapt to different use-cases. Consider different conditions and effectively handle corner cases."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"Effective Testing"),": make sure to conduct proper testing before submitting your contribution."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"Input Restriction"),": use selectors to restrict what users can provide as input to the blueprint."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"Code Documentation"),": if the blueprint contains a complicated piece of code, consider adding some YAML comments to better explain what the section is trying to achieve."),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"Consistency"),": be consistent within your blueprint, for what regards naming and patterns you use to accomplish certain tasks. Also, adhere to the format of the provided templates.")))}d.isMDXComponent=!0}}]);