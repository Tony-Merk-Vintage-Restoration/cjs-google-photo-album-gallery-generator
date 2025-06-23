window.onload = main;

function main() {
  console.log("Initializing...");

  let inputEmbedCode = document.getElementById("input-embed-code");
  let minifyOutputCheckbox = document.getElementById("minify-output-checkbox");
  let inputForm = document.getElementById("outer-generate-input-form");
  let outputTextarea = document.getElementById("generated-code-output");

  if (
    !inputEmbedCode ||
    !minifyOutputCheckbox ||
    !inputForm ||
    !outputTextarea
  ) {
    console.error("Missing elements!");
    console.debug(inputEmbedCode);
    console.debug(minifyOutputCheckbox);
    console.debug(inputForm);
    console.debug(outputTextarea);
    alert("Failed to initialize?!?!");
  }

  inputForm.onsubmit = (event) => {
    console.log("Transform input");

    event.preventDefault();
    event.stopPropagation();

    let inputCodeStr = inputEmbedCode.value?.trim();
    if (!inputCodeStr) {
      console.warn("No input embed code provided!");
    } else {
      onSubmit(
        inputCodeStr.trim(),
        minifyOutputCheckbox.checked,
        outputTextarea,
      );
    }
  };

  console.log("Initialized!");
}

function onSubmit(inputCodeStr, doMinifyOutput, outputTextarea) {
  // Get list of <object>'s from input
  let galleryData = inputCodeStr.match(
    /<div[^]*?data-link="[^]*?\/([^/"]*)"[^]*?>\s*([^]*?)\s*<\/div>/,
  );
  console.debug(galleryData);
  if (!galleryData || !galleryData.length >= 3) {
    console.error("Failed to match on gallery data!");
    return;
  }
  let galleryDataId = `glide-${galleryData[1]}`;
  let galleryDataStr = galleryData[2];

  // Replace the <object>'s with <li><img>'s using the `transformObjToImg` function
  let outputGalleryData = galleryDataStr.replaceAll(
    /\s*<object[^]*?<\/object>\s*/g,
    transformObjToImg,
  );

  // Generate output with the template
  let generatedOutput = generateOutput(galleryDataId, outputGalleryData);
  // Minify if requested
  let finalOutput;
  if (doMinifyOutput) {
    finalOutput = minifyOutput(generatedOutput);
    console.log(
      `Minifying saved ${generatedOutput.length - finalOutput.length} characters!`,
    );
  } else {
    finalOutput = generatedOutput;
  }
  if (finalOutput.length > 51200) {
    alert(
      `GoDaddy website builder HTML blocks have a limit of 51200 characters! This gallery won't fit on your page! ${generatedOutput.length - 51200} characters over the limit!`,
    );
  }

  // Write output
  outputTextarea.value = finalOutput;
}

function transformObjToImg(objTagStr) {
  // Extract image URL
  let dataUrl = objTagStr.match(/data="(.*?)"/);
  if (!dataUrl || !dataUrl[1]) {
    console.error('Failed to get image from object tag: "${objTagStr}"');
    return "";
  }

  // Return carousel element with template
  return `            <li class="slider__frame glide__slide"><img src="${dataUrl[1]}" /></li>\n`;
}

function generateOutput(galleryDataId, outputGalleryData) {
  return `
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@glidejs/glide@3.7.1/dist/css/glide.core.min.css"
    type="text/css"
/>
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@glidejs/glide@3.7.1/dist/css/glide.theme.min.css"
    type="text/css"
/>
<script src="https://cdn.jsdelivr.net/npm/@glidejs/glide@3.7.1/dist/glide.min.js"></script>

<style>
    #${galleryDataId} .glide__slide {
        height: 350px;
        aspect-ratio: 16/9;
    }
    #${galleryDataId} .glide__slide img {
        object-fit: contain;
        width: 100%;
        height: 100%;
    }

    #${galleryDataId} .glide__arrow {
        background-color: rgba(255, 255, 255, 0.8);
    }

    #${galleryDataId} .slider__arrow--next {
        right: 1.5em;
    }
    #${galleryDataId} .slider__arrow--prev {
        left: 1.5em;
    }
</style>

<div class="slide glide" id="${galleryDataId}">
    <div class="slider__track glide__track" data-glide-el="track">
        <ul class="slider__slides glide__slides">
${outputGalleryData}
        </ul>
    </div>

    <div data-glide-el="controls">
        <button
            class="slider__arrow slider__arrow--prev glide__arrow glide__arrow--prev"
            data-glide-dir="<"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
            >
                <path
                    d="M0 12l10.975 11 2.848-2.828-6.176-6.176H24v-3.992H7.646l6.176-6.176L10.975 1 0 12z"
                />
            </svg>
        </button>

        <button
            class="slider__arrow slider__arrow--next glide__arrow glide__arrow--next"
            data-glide-dir=">"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
            >
                <path
                    d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"
                />
            </svg>
        </button>
    </div>
</div>
<script>
    new Glide("#${galleryDataId}", {
      type: "carousel",
      perView: 3,
      animationDuration: 100,
      focusAt: 0,
      breakpoints: {
          1100: {
              perView: 2,
          },
          750: {
              perView: 1,
          },
      },
    }).mount();
</script>
  `.trim();
}

function minifyOutput(input) {
  const minify = require("html-minifier").minify;
  return minify(input, {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    minifyURLs: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortAttributes: true,
    sortClassName: true,
  });
}
