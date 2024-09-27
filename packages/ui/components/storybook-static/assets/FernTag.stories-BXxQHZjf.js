import{j as l}from"./jsx-runtime-Cw0GR0a5.js";import{c as C}from"./clsx-B-dksMZM.js";import{r as D}from"./index-CTjT7uj6.js";const L={Small:"sm",Large:"lg"},k={Gray:"gray",Green:"green",Blue:"blue",Amber:"amber",Red:"red",Accent:"accent"},n=D.forwardRef(({children:r,rounded:e=!1,size:t="lg",variant:s="subtle",colorScheme:a="gray",className:_,skeleton:i},O)=>(i&&(a="gray"),l.jsx("span",{ref:O,className:C("fern-tag",{small:t==="sm",large:t==="lg","rounded-full":e},{"gray-subtle":a==="gray"&&s==="subtle","gray-solid":a==="gray"&&s==="solid","green-subtle":a==="green"&&s==="subtle","green-solid":a==="green"&&s==="solid","bg-blue-a3 text-blue-a11":a==="blue"&&s==="subtle","bg-blue-a10 text-blue-1 dark:text-blue-12":a==="blue"&&s==="solid","amber-subtle":a==="amber"&&s==="subtle","amber-solid":a==="amber"&&s==="solid","red-subtle":a==="red"&&s==="subtle","red-solid":a==="red"&&s==="solid","accent-subtle":a==="accent"&&s==="subtle","accent-solid":a==="accent"&&s==="solid"},_),children:i?l.jsx("span",{className:"contents invisible",children:r}):r})));n.displayName="FernTag";try{n.displayName="FernTag",n.__docgenInfo={description:"The `FernTag` component is used for items that need to be labeled, categorized, or organized using keywords that describe them.",displayName:"FernTag",props:{size:{defaultValue:{value:"lg"},description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"lg"'}]}},rounded:{defaultValue:{value:"false"},description:"",name:"rounded",required:!1,type:{name:"boolean"}},variant:{defaultValue:{value:"subtle"},description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:'"subtle"'},{value:'"solid"'}]}},colorScheme:{defaultValue:{value:"gray"},description:"",name:"colorScheme",required:!1,type:{name:"enum",value:[{value:'"accent"'},{value:'"gray"'},{value:'"blue"'},{value:'"green"'},{value:'"amber"'},{value:'"red"'}]}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}},skeleton:{defaultValue:null,description:"",name:"skeleton",required:!1,type:{name:"boolean"}}}}}catch{}const q=["test","get","post","put","patch","delete","stream","wss"],w={title:"General/FernTag",component:n,parameters:{layout:"centered"},tags:["autodocs"],args:{children:"Test",size:"lg",variant:"subtle",colorScheme:"gray"},argTypes:{size:{options:["sm","lg"],control:{type:"select"}}}},o={args:{}},c={argTypes:{colorScheme:{control:!1}},render:r=>{const e=Object.values(k);return l.jsx("div",{className:"flex flex-col gap-2",children:e.map((t,s)=>l.jsx(n,{...r,colorScheme:t},s))})}},d={argTypes:{size:{control:!1}},render:r=>{const e=Object.values(L);return l.jsx("div",{className:"flex gap-2",children:e.map((t,s)=>l.jsx(n,{...r,size:t},s))})}},u={args:{variant:"solid"}},m={args:{size:"sm",className:"w-11 uppercase"},render:r=>l.jsx("div",{className:"flex flex-col gap-2",children:q.map(e=>l.jsx(n,{...r,colorScheme:e==="GET"?"green":e==="DELETE"?"red":e==="POST"?"blue":e==="STREAM"||e==="WSS"?"accent":e==="PUT"||e==="PATCH"?"amber":"gray",children:e==="DELETE"?"DEL":e},e))})};var g,p,b;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {}
}`,...(b=(p=o.parameters)==null?void 0:p.docs)==null?void 0:b.source}}};var f,y,T;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
  argTypes: {
    colorScheme: {
      control: false
    }
  },
  render: args => {
    const colorSchemes = Object.values(FernTagColorSchemes);
    return <div className="flex flex-col gap-2">
                {colorSchemes.map((colorScheme, i) => <FernTag key={i} {...args} colorScheme={colorScheme} />)}
            </div>;
  }
}`,...(T=(y=c.parameters)==null?void 0:y.docs)==null?void 0:T.source}}};var v,x,S;d.parameters={...d.parameters,docs:{...(v=d.parameters)==null?void 0:v.docs,source:{originalSource:`{
  argTypes: {
    size: {
      control: false
    }
  },
  render: args => {
    const sizes = Object.values(FernTagSizes);
    return <div className="flex gap-2">
                {sizes.map((size, i) => <FernTag key={i} {...args} size={size} />)}
            </div>;
  }
}`,...(S=(x=d.parameters)==null?void 0:x.docs)==null?void 0:S.source}}};var E,h,z;u.parameters={...u.parameters,docs:{...(E=u.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    variant: "solid"
  }
}`,...(z=(h=u.parameters)==null?void 0:h.docs)==null?void 0:z.source}}};var N,j,F;m.parameters={...m.parameters,docs:{...(N=m.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    size: "sm",
    className: "w-11 uppercase"
  },
  render: args => {
    return <div className="flex flex-col gap-2">
                {methods.map(method => <FernTag key={method} {...args} colorScheme={method === "GET" ? "green" : method === "DELETE" ? "red" : method === "POST" ? "blue" : method === "STREAM" || method === "WSS" ? "accent" : method === "PUT" || method === "PATCH" ? "amber" : "gray"}>
                        {method === "DELETE" ? "DEL" : method}
                    </FernTag>)}
            </div>;
  }
}`,...(F=(j=m.parameters)==null?void 0:j.docs)==null?void 0:F.source}}};const G=["Default","ColorSchemes","Sizes","Solid","ClassNameOverrides"];export{m as ClassNameOverrides,c as ColorSchemes,o as Default,d as Sizes,u as Solid,G as __namedExportsOrder,w as default};
