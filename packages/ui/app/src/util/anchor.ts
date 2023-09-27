export function getAnchorNode(anchorId: string): Element | null {
    return document.querySelector(`div[data-anchor="${anchorId}"]`);
}
