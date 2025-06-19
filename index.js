window.onload = main;

async function main() {
  console.log("Initializing...");

  let shareLinkInput = document.getElementById("google-photos-share-link");
  let inputForm = document.getElementById("outer-generate-input-form");
  let outputTextarea = document.getElementById("generated-code-output");

  if (!shareLinkInput || !inputForm || !outputTextarea) {
    console.error("Missing elements!");
    console.debug(shareLinkInput);
    console.debug(inputForm);
    console.debug(outputTextarea);
  }

  inputForm.onsubmit = async (e) => {
    e.preventDefault();
    let albumLink = shareLinkInput.value;
    if (!albumLink) {
      console.warn("No Google Album URL provided");
      return;
    }
    await generateForAlbum(albumLink);
  };

  console.log("Initialized!");
}

async function generateForAlbum(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const txt = await response.text();
    console.log(txt);
  } catch (error) {
    console.error(error.message);
  }
}
