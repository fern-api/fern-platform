import Script from "next/script";
import { ReactNode, useEffect } from "react";
import { useFernUser } from "../atoms";
import { useSafeListenTrackEvents } from "./use-track";

export function KoalaScript({ apiKey }: { apiKey: string }): ReactNode {
    const user = useFernUser();

    useEffect(() => {
        if (user && user.email && window.ko) {
            window.ko.identify(user.email);
        }
    }, [user]);

    useSafeListenTrackEvents(({ event, properties }) => {
        if (window.ko) {
            window.ko.track(event, properties);
        }
    });

    return <Script id="koala" type="text/javascript" dangerouslySetInnerHTML={{ __html: initKoala(apiKey) }} />;
}

function initKoala(apiKey: string): string {
    return `
  !(function (t) {
    if (window.ko) return;
    (window.ko = []),
      [
        "identify",
        "track",
        "removeListeners",
        "open",
        "on",
        "off",
        "qualify",
        "ready",
      ].forEach(function (t) {
        ko[t] = function () {
          var n = [].slice.call(arguments);
          return n.unshift(t), ko.push(n), ko;
        };
      });
    var n = document.createElement("script");
    (n.async = !0),
      n.setAttribute(
        "src",
        "https://cdn.getkoala.com/v1/${apiKey}/sdk.js"
      ),
      (document.body || document.head).appendChild(n);
  })();
    `;
}
