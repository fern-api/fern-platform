import { FC, useEffect, useState } from "react";

export const AnimatedTitle: FC<{ children: string }> = ({
  children: nextChild,
}) => {
  const [displayText, setDisplayText] = useState(nextChild);
  const [prevChild, setPrevChild] = useState(nextChild);

  useEffect(() => {
    if (prevChild !== nextChild) {
      const commonPrefix = getCommonPrefix(prevChild, nextChild);
      const contractText = prevChild.slice(commonPrefix.length);
      const expandText = nextChild.slice(commonPrefix.length);

      let currentIndex = 0;
      const intervalId = setInterval(() => {
        setDisplayText((prevText) => {
          if (currentIndex >= contractText.length) {
            clearInterval(intervalId);
            animateExpand(commonPrefix, expandText);
            return prevText;
          }
          currentIndex++;
          return commonPrefix + contractText.slice(0, -currentIndex);
        });
      }, 50);

      return () => {
        clearInterval(intervalId);
      };
    }
    return;
  }, [nextChild, prevChild]);

  const animateExpand = (commonPrefix: string, expandText: string) => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      setDisplayText(() => {
        if (currentIndex >= expandText.length) {
          clearInterval(intervalId);
          setPrevChild(commonPrefix + expandText);
          return commonPrefix + expandText;
        }
        currentIndex++;
        return commonPrefix + expandText.slice(0, currentIndex);
      });
    }, 50);
  };

  return <>{displayText}</>;
};

const getCommonPrefix = (str1: string, str2: string): string => {
  let i = 0;
  while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
    i++;
  }
  return str1.slice(0, i);
};
