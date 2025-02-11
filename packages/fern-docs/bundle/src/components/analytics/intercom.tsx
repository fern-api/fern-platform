import Script from "next/script";
import { ReactElement, useEffect } from "react";

import type { DocsV1Read } from "@fern-api/fdr-sdk";

// Should mirror or be a subset of InitType from @intercom/messenger-js-sdk
type IntercomInitType = { app_id?: string; api_base?: string };

/**
 * Transforms our internal representation of Intercom's Config into the type necessary to
 * bootstrap Intercom.
 *
 * @param config
 * @returns
 */
export function normalizeIntercomConfig(
  config: DocsV1Read.IntercomConfig
): IntercomInitType {
  return {
    app_id: config.appId,
    api_base: config.apiBase,
  };
}

/**
 * If the given intercom config is defined, intialize the Intercom script via the official npm sdk
 * in a `useEffect`.
 *
 * @param config
 */
export function useIntercomInitializer(
  config: DocsV1Read.IntercomConfig
): void {
  useEffect(() => {
    let interval: number;
    const retry = () => {
      if (window.Intercom) {
        window.Intercom("boot", normalizeIntercomConfig(config));
        window.clearInterval(interval);
      }
    };

    retry();

    interval = window.setInterval(retry, 100);
    return () => window.clearInterval(interval);
  }, [config]);
}

function IntercomScript(props: { config: DocsV1Read.IntercomConfig }) {
  useIntercomInitializer(props.config);
  return (
    <Script
      id="init-intercom"
      dangerouslySetInnerHTML={{
        __html: widgetBootstrapScript(props.config.appId),
      }}
    />
  );
}

function widgetBootstrapScript(appId: string) {
  return `(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${appId}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`;
}

export default IntercomScript;
