import fastdom from "fastdom";
import { noop } from "ts-essentials";

let stopMeasuring = noop;
export function scrollToCenter(scrollContainer: HTMLElement | null, target: HTMLElement | null): void {
    if (scrollContainer == null || target == null) {
        return;
    }

    setTimeout(() => {
        fastdom.clear(stopMeasuring);
        stopMeasuring = fastdom.measure(() => {
            // if the target is already in view, don't scroll
            if (
                target.offsetTop >= scrollContainer.scrollTop &&
                target.offsetTop + target.clientHeight <= scrollContainer.scrollTop + scrollContainer.clientHeight
            ) {
                return;
            }
            // if the target is outside of the scroll container, scroll to it (centered)
            scrollContainer.scrollTo({
                top: target.offsetTop - scrollContainer.clientHeight / 3,
                behavior: "smooth",
            });
        });
    }, 0);
}
