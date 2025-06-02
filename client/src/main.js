const responsesDiv = document.getElementById("responses");
const promptForm = document.querySelector("form");

promptForm.addEventListener("submit", sendIdeaRequest);

async function sendIdeaRequest(event) {
  event.preventDefault();

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

  responsesDiv.innerHTML = "";

  const ideaPara = document.createElement("p");
  ideaPara.textContent = data;
  responsesDiv.appendChild(ideaPara);
}
