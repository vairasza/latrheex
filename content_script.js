let inject = null;

chrome.runtime.onMessage.addListener((request, sender) => {
  console.log(sender, request);
  console.log(window.getSelection());

  const r = window.getSelection().getRangeAt(0).getClientRects()[0];

  inject = document.createElement("div");
  inject.id = "trallala";
  inject.textContent = "test";
  //calc height; put it to the right or bottom if there is not enough place
  inject.style.cssText = `background-color: rgb(150,150,150);
  position: absolute;
  left: ${r.x + 10}px;
  top: ${r.y - 80}px;
  width: 200px;
  height: 70px;
  z-index: 20;`;
  document.body.appendChild(inject);
});

function getSelectionCoords(atStart) {
  const sel = window.getSelection();

  // check if selection exists
  if (!sel.rangeCount) return null;

  // get range
  let range = sel.getRangeAt(0).cloneRange();
  if (!range.getClientRects) return null;

  // get client rect
  range.collapse(atStart);
  let rects = range.getClientRects();
  if (rects.length <= 0) return null;

  // return coord
  let rect = rects[0];
  return { x: rect.x, y: rect.y };
}

document.addEventListener(
  "scroll",
  () => {
    let d = document.getElementById("trallala");
    if (d !== null) d.remove();
  },
  true
);
