const responsesDiv = document.getElementById("responses");
const promptForm = document.querySelector("form");
const saveButton = document.getElementById("save-button");
const loadingMessage = document.getElementById("loading-message");

let latestIdea = "";

promptForm.addEventListener("submit", sendIdeaRequest);
saveButton.addEventListener("click", saveIdeaToDatabase);

async function sendIdeaRequest(event) {
  event.preventDefault();

  loadingMessage.style.display = "block";
  loadingMessage.textContent = "Loading idea...";
  responsesDiv.innerHTML = "";
  responsesDiv.appendChild(loadingMessage);

  const interest = event.target.interest.value;
  const timeline = event.target.timeline.value;
  const budget = event.target.budget.value;
  const skillLevel = event.target.skillLevel.value;
  const businessModel = event.target.businessModel.value;

  const audienceBoxes = document.querySelectorAll(
    'input[name="audience"]:checked'
  );
  const targetAudience = Array.from(audienceBoxes).map((box) => box.value);

  const response = await fetch("http://localhost:8080/generate-idea", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      interest,
      timeline,
      budget,
      skillLevel,
      businessModel,
      targetAudience,
    }),
  });

  const data = await response.json();
  console.log("server response is:", data);

  loadingMessage.style.display = "none";

  responsesDiv.innerHTML = "";

  const ideaPara = document.createElement("p");
  ideaPara.id = "current-response-text";
  ideaPara.textContent = data;

  const copyBtn = document.createElement("button");
  copyBtn.id = "copy-current-response-btn";
  copyBtn.textContent = "Copy to Clipboard";

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(ideaPara.textContent).then(() => {
      alert("Current response copied to clipboard!");
    });
  });

  responsesDiv.appendChild(ideaPara);
  responsesDiv.appendChild(copyBtn);

  latestIdea = data;
  saveButton.disabled = false;
}

async function saveIdeaToDatabase() {
  const response = await fetch("http://localhost:8080/save-idea", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idea: latestIdea }),
  });
}

async function loadSavedIdeas() {
  const response = await fetch("http://localhost:8080/saved-ideas");
  const ideas = await response.json();

  const savedIdeasDiv = document.getElementById("saved-ideas");
  savedIdeasDiv.innerHTML = "";

  ideas.forEach((idea) => {
    const ideaContainer = document.createElement("div");
    ideaContainer.classList.add("saved-idea");

    const ideaText = document.createElement("p");
    ideaText.textContent = idea.idea_text;

    const ideaDate = document.createElement("small");
    const date = new Date(idea.created_at);
    ideaDate.textContent = `Saved on: ${date.toLocaleString()}`;

    ideaContainer.appendChild(ideaText);
    ideaContainer.appendChild(ideaDate);
    savedIdeasDiv.appendChild(ideaContainer);
  });
}
loadSavedIdeas();
