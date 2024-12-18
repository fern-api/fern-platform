import Script from "next/script";
import { ReactNode, useEffect } from "react";
import { useFernUser } from "../atoms";
import { useSafeListenTrackEvents } from "./track";

export default function HeapScript({ appId }: { appId: string }): ReactNode {
    useSafeListenTrackEvents(({ event, properties }) => {
        if (window.heap) {
            window.heap.track(event, properties);
        }
    });

    const user = useFernUser();
    useEffect(() => {
        if (!window.heap) {
            return;
        }
        try {
            if (user && user.email) {
                window.heap.identify(user.email);
            } else {
                window.heap.resetIdentity();
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn("Error identifying user with Heap", error);
        }
    }, [user]);
    return <Script id="heap" type="text/javascript" dangerouslySetInnerHTML={{ __html: initHeapScript(appId) }} />;
}

function initHeapScript(appId: string) {
    return `
window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};   
heap.load("${appId}"); 
`;
}
