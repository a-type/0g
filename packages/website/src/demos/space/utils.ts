export function createSVGElement<Tag extends keyof SVGElementTagNameMap>(
  tagName: Tag
) {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}
