import{j as r}from"./jsx-runtime-Cw0GR0a5.js";import{J as e}from"./index-CChy_tUj.js";import"./index-CTjT7uj6.js";import"./index-9r8iugjR.js";const P={title:"General/toast",component:e},s={render:()=>r.jsx("div",{onClick:()=>e("This is a toast message!"),children:"Create toast"})},o={render:()=>r.jsx("div",{onClick:()=>e.success("This is a success toast!"),children:"Create success toast"})},t={render:()=>r.jsx("div",{onClick:()=>e.error("This is an error toast!"),children:"Create error toast"})},a={render:()=>r.jsx("div",{onClick:()=>e.promise(new Promise(S=>{setTimeout(S,2e3)}),{loading:"Loading...",success:"Loaded!",error:"Error!"}),children:"Create promise toast"})},i={render:()=>r.jsx("div",{onClick:()=>e("This is a toast message!",{description:"And a little description to accompany"}),children:"Create promise toast"})};var n,c,d;s.parameters={...s.parameters,docs:{...(n=s.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: () => {
    return <div onClick={() => toast("This is a toast message!")}>Create toast</div>;
  }
}`,...(d=(c=s.parameters)==null?void 0:c.docs)==null?void 0:d.source}}};var m,p,u;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => {
    return <div onClick={() => toast.success("This is a success toast!")}>Create success toast</div>;
  }
}`,...(u=(p=o.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var l,C,v;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => {
    return <div onClick={() => toast.error("This is an error toast!")}>Create error toast</div>;
  }
}`,...(v=(C=t.parameters)==null?void 0:C.docs)==null?void 0:v.source}}};var T,h,g;a.parameters={...a.parameters,docs:{...(T=a.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <div onClick={() => toast.promise(new Promise(resolve => {
    setTimeout(resolve, 2000);
  }), {
    loading: "Loading...",
    success: "Loaded!",
    error: "Error!"
  })}>
            Create promise toast
        </div>
}`,...(g=(h=a.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};var k,x,j;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <div onClick={() => toast("This is a toast message!", {
    description: "And a little description to accompany"
  })}>
            Create promise toast
        </div>
}`,...(j=(x=i.parameters)==null?void 0:x.docs)==null?void 0:j.source}}};const w=["Default","SuccessToast","ErrorToast","PromiseToast","WithDescription"];export{s as Default,t as ErrorToast,a as PromiseToast,o as SuccessToast,i as WithDescription,w as __namedExportsOrder,P as default};
