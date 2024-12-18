import Script from "next/script";
import { ReactNode } from "react";

export default function HeapScript({ appId }: { appId: string }): ReactNode {
    return <Script id="heap" type="text/javascript" dangerouslySetInnerHTML={{ __html: initHeapScript(appId) }} />;
}

function initHeapScript(appId: string) {
    return `
window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};   
heap.load("${appId}"); 
`;
}
