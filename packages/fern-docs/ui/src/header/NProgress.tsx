/**
 *
 * NProgress
 *
 */

import Router from "next/router";
import NProgress from "nprogress";
import * as React from "react";

export interface NextNProgressProps {
  /**
   * The start position of the bar.
   * @default 0.3
   */
  startPosition?: number;
  /**
   * Whether to show the bar on shallow routes.
   * @default true
   */
  showOnShallow?: boolean;
  /**
   * The other NProgress configuration options to pass to NProgress.
   * @default null
   */
  options?: Partial<NProgress.NProgressOptions>;

  /**
   * Use your custom CSS tag instead of the default one.
   * This is useful if you want to use a different style or minify the CSS.
   * @default (css) => <style nonce={nonce}>{css}</style>
   */
  transformCSS?: (css: string) => React.ReactNode;
}

let timer: number;

const NextNProgressInternal = ({
  startPosition = 0.3,
  showOnShallow = true,
  options,
}: NextNProgressProps) => {
  React.useEffect(() => {
    if (options) {
      NProgress.configure(options);
    }

    const routeChangeStart = (
      _: string,
      {
        shallow,
      }: {
        shallow: boolean;
      }
    ) => {
      if (!shallow || showOnShallow) {
        if (timer) {
          clearTimeout(timer);
        }
        timer = window.setTimeout(() => {
          NProgress.set(startPosition);
          NProgress.start();
          document
            .querySelector("#nprogress .bar")
            ?.classList.remove("blurout");
        }, 400);
      }
    };

    const routeChangeEnd = (
      _: string,
      {
        shallow,
      }: {
        shallow: boolean;
      }
    ) => {
      if (!shallow || showOnShallow) {
        if (timer) {
          clearTimeout(timer);
        }
        NProgress.done(false);
        document.querySelector("#nprogress .bar")?.classList.add("blurout");
      }
    };

    const routeChangeError = (
      _err: Error,
      _url: string,
      {
        shallow,
      }: {
        shallow: boolean;
      }
    ) => {
      if (!shallow || showOnShallow) {
        if (timer) {
          clearTimeout(timer);
        }
        NProgress.done(false);
        document.querySelector("#nprogress .bar")?.classList.add("blurout");
      }
    };

    Router.events.on("routeChangeStart", routeChangeStart);
    Router.events.on("routeChangeComplete", routeChangeEnd);
    Router.events.on("routeChangeError", routeChangeError);
    return () => {
      Router.events.off("routeChangeStart", routeChangeStart);
      Router.events.off("routeChangeComplete", routeChangeEnd);
      Router.events.off("routeChangeError", routeChangeError);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export const NextNProgress = React.memo(NextNProgressInternal);
