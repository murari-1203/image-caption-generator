const form = document.getElementById("uploadForm");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const captionDiv = document.getElementById("caption");
const instructionInput = document.getElementById("instructionInput");
const spinner = document.getElementById("spinner");

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) { 
    preview.style.display = "none"; 
    captionDiv.textContent = ""; 
    return; 
  }
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
  captionDiv.textContent = "";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = imageInput.files[0];
  const instruction = instructionInput.value.trim();

  if (!file) return alert("Choose an image");

  const formData = new FormData();
  formData.append("image", file);
  formData.append("instruction", instruction);

  spinner.style.display = "block";
  captionDiv.textContent = "";

  try {
    const resp = await fetch("/api/caption", {
      method: "POST",
      body: formData
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error || "Failed");

    captionDiv.textContent = data.caption || "No caption returned";
  } catch (err) {
    captionDiv.textContent = "Error: " + err.message;
  } finally {
    spinner.style.display = "none";
  }
});
