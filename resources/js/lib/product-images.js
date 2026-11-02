export function productImageSrcSet(src) {
  if (typeof src !== "string" || !src.includes("/products/") || !/\.webp(?:[?#]|$)/i.test(src)) {
    return undefined;
  }

  const thumbnail = src.replace(/\.webp(?=([?#]|$))/i, "-400w.webp");

  return `${thumbnail} 400w, ${src} 800w`;
}
