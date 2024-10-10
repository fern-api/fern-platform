import fastdom from "fastdom";
import { noop } from "ts-essentials";

let stopMeasuring = noop;
export function scrollToCenter(
    scrollContainer: HTMLElement | null,
    target: HTMLElement | null,
    smooth: boolean = true,
): void {
    if (scrollContainer == null || target == null) {
        return;
    }

    setTimeout(() => {
        fastdom.clear(stopMeasuring);
        stopMeasuring = fastdom.measure(() => {
            const offsetTop = getOffsetTopRelativeToScrollContainer(target, scrollContainer);

            // if the target is not a child of the scroll container, bail
            if (offsetTop == null) {
                return;
            }

            // if the target is already in view, don't scroll
            if (
                offsetTop >= scrollContainer.scrollTop &&
                offsetTop + target.clientHeight <= scrollContainer.scrollTop + scrollContainer.clientHeight
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

function getOffsetTopRelativeToScrollContainer(targetElement: HTMLElement, scrollContainer: HTMLElement) {
    let offsetTop = 0;
    let currentElement: HTMLElement | null = targetElement;
    while (currentElement && currentElement !== scrollContainer) {
        offsetTop += currentElement.offsetTop;
        currentElement = currentElement.offsetParent as HTMLElement | null;
    }

    // if the target is not a child of the scroll container, return undefined
    if (currentElement == null) {
        return undefined;
    }

    return offsetTop;
}
