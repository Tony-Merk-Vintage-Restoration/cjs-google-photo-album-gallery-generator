window.onload = main;

function main() {
  console.log("Initializing...");

  let inputEmbedCode = document.getElementById("input-embed-code");
  let inputForm = document.getElementById("outer-generate-input-form");
  let outputTextarea = document.getElementById("generated-code-output");

  if (!inputEmbedCode || !inputForm || !outputTextarea) {
    console.error("Missing elements!");
    console.debug(inputEmbedCode);
    console.debug(inputForm);
    console.debug(outputTextarea);
    alert("Failed to initialize?!?!");
  }

  inputForm.onsubmit = submitFn(inputEmbedCode, outputTextarea);

  console.log("Initialized!");
}

function submitFn(inputEmbedCode, outputTextarea) {
  return (event) => {
    console.log("Transform input");

    event.preventDefault();
    event.stopPropagation();

    let inputCodeStr = inputEmbedCode.value?.trim();
    if (!inputCodeStr) {
      console.warn("No input embed code provided!");
    } else {
      onSubmit(inputCodeStr.trim(), outputTextarea);
    }
  };
}

function onSubmit(inputCodeStr, outputTextarea) {
  // Get list of <object>'s from input
  let galleryData = inputCodeStr.match(
    /<div[^]*?class="pa-gallery-player-widget"[^]*?>\s*([^]*?)\s*<\/div>/,
  );
  if (!galleryData || !galleryData[1]) {
    console.error("Failed to match on gallery data!");
    return;
  }
  let galleryDataStr = galleryData[1];

  // Replace the <object>'s with <li><img>'s using the `transformObjToImg` function
  let outputGalleryData = galleryDataStr.replaceAll(
    /\s*<object[^]*?<\/object>\s*/g,
    transformObjToImg,
  );

  // Write output with template
  outputTextarea.value = `
<div class="glide">
    <div class="glide__track" data-glide-el="track">
        <ul class="glide__slides">
${outputGalleryData}
        </ul>
    </div>
</div>
  `.trim();
}

function transformObjToImg(objTagStr) {
  console.debug(`Transform: ${objTagStr}`);

  // Extract image URL
  let dataUrl = objTagStr.match(/data="(.*?)"/);
  if (!dataUrl || !dataUrl[1]) {
    console.error('Failed to get image from object tag: "${objTagStr}"');
    return "";
  }

  // Return carousel element with template
  return `            <li class="glide__slide"><img src="${dataUrl[1]}" /></li>\n`;
}
