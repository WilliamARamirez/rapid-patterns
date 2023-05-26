import ClipBoard from "clipboard";

export const initClipboard = (selector) => {
  const elements = document.querySelectorAll(selector);
  return new ClipBoard(elements);
};
