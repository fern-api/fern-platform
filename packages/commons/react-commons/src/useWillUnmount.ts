import { useLayoutEffect, useRef } from "react";
import createHandlerSetter, {
  CallbackSetter,
} from "./factory/createHandlerSetter";

/**
 * Returns a callback setter for a callback to be performed when the component will unmount.
 */
const useWillUnmount = <TCallback extends (...args: any[]) => void>(
  callback?: TCallback
): CallbackSetter<undefined> => {
  const mountRef = useRef(false);
  const [handler, setHandler] = createHandlerSetter<undefined>(callback);

  useLayoutEffect(() => {
    mountRef.current = true;

    return () => {
      if (typeof handler?.current === "function" && mountRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        handler.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return setHandler;
};

export default useWillUnmount;
