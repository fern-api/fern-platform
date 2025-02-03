import fastdom from "fastdom";
import { noop } from "ts-essentials";

let stopMeasuring = noop;
export function scrollToCenter(
  scrollContainer: HTMLElement | null,
  target: HTMLElement | null,
  smooth = true
): void {
  if (scrollContainer == null || target == null) {
    return;
  }

  setTimeout(() => {
    fastdom.clear(stopMeasuring);
    stopMeasuring = fastdom.measure(() => {
      const offsetTop = getOffsetTopRelativeToScrollContainer(
        target,
        scrollContainer
      );

      // if the target is not a child of the scroll container, bail
      if (offsetTop == null) {
        return;
      }

      // if the target is already in view, don't scroll
      if (
        offsetTop >= scrollContainer.scrollTop &&
        offsetTop + target.clientHeight <=
          scrollContainer.scrollTop + scrollContainer.clientHeight
      ) {
        return;
      }
      // if the target is outside of the scroll container, scroll to it (centered)
      scrollContainer.scrollTo({
        top: offsetTop - scrollContainer.clientHeight / 3,
        behavior: smooth ? "smooth" : "auto",
      });
    });
  }, 0);
}

function getOffsetTopRelativeToScrollContainer(
  targetElement: HTMLElement,
  scrollContainer: HTMLElement
) {
  if (targetElement === scrollContainer) {
    return 0;
  }

  if (!scrollContainer.contains(targetElement)) {
    return undefined;
  }

  let offsetTop = 0;
  let currentElement: HTMLElement | null = targetElement;
  while (currentElement && currentElement !== scrollContainer) {
    offsetTop += currentElement.offsetTop;
    currentElement = currentElement.offsetParent as HTMLElement | null;
    if (!currentElement) {
      // if the offset parent is null, we've accidentally reached the root element
      return undefined;
    } else if (!scrollContainer.contains(currentElement)) {
      // if the offset parent jumps beyond the scroll container, bail
      break;
    }
  }

  return offsetTop;
}
