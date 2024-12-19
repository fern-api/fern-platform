import Script from "next/script";
import { ReactElement, useEffect } from "react";
import { useFernUser } from "../atoms";
import { useSafeListenTrackEvents } from "./track";

// copied from @intercom/messenger-js-sdk
interface IntercomSettings {
    app_id: string;
    api_base?: string;
    email?: string;
    created_at?: number;
    name?: string;
    user_id?: string;
    phone?: string;
    unsubscribed_from_emails?: boolean;
    language_override?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_medium?: string;
    utm_source?: string;
    utm_term?: string;
    avatar?: any;
    user_hash?: string;
    company?: any;
    companies?: [any];
    page_title?: string;
    custom_launcher_selector?: string;
    alignment?: string;
    vertical_padding?: number;
    horizontal_padding?: number;
    hide_default_launcher?: boolean;
    session_duration?: number;
    action_color?: string;
    background_color?: string;
    installation_type?: string;
}

export function IntercomScript(props: IntercomSettings): ReactElement {
    useIntercomInitializer(props);
    return <Script id="intercom" dangerouslySetInnerHTML={{ __html: widgetBootstrapScript(props.app_id) }} />;
}

/**
 * If the given intercom config is defined, intialize the Intercom script via the official npm sdk
 * in a `useEffect`.
 *
 * @param config
 */
function useIntercomInitializer(config: IntercomSettings): void {
    const user = useFernUser();

    useEffect(() => {
        try {
            if (window.Intercom) {
                window.Intercom("boot", { ...config, email: user?.email, name: user?.name } satisfies IntercomSettings);
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Error initializing Intercom", e);
        }
    }, [config, user?.email, user?.name]);

    useSafeListenTrackEvents(({ event, properties }) => {
        window.Intercom("trackEvent", event, properties);
    });
}

function widgetBootstrapScript(appId: string) {
    return `(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${appId}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`;
}
