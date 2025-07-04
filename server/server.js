import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL:
    "https://webapp.v2.vortex.upscale.tech/proxy/techeducators/ee155667/di-openai/v1/",
  defaultHeaders: {
    apiKey: process.env.OPENAI_API_KEY,
  },
});

app.get("/", (request, response) => {
  response.json("Startup Idea Generator API Root");
});

app.post("/generate-idea", async function (request, response) {
  const interest = request.body.interest;
  const timeline = request.body.timeline;
  const budget = request.body.budget;
  const skillLevel = request.body.skillLevel;
  const businessModel = request.body.businessModel;
  const targetAudience = request.body.targetAudience;

  let prompt = `Generate a startup idea based on the following preferences:`;

  if (interest) prompt += `Industry/Product Interest: ${interest}. `;
  if (timeline) prompt += `Timeline: ${timeline}. `;
  if (budget) prompt += `Budget: ${budget}. `;
  if (skillLevel) prompt += `Skill Level: ${skillLevel}. `;
  if (businessModel) prompt += `Business Model: ${businessModel}. `;
  if (targetAudience && targetAudience.length > 0) {
    prompt += `Target Audience: ${targetAudience.join(", ")}. `;
  }

  prompt +=
    "Provide a unique and viable startup idea. Be clear and concise and limit the words to 200 words.";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates unique startup ideas based on user preferences.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    store: true,
  });

  console.log("The completions variable is:, ", completion);
  console.log("Completions choices is:", completion.choices);

  response.json(completion.choices[0].message.content);
});

const PORT = 8080;

app.listen(PORT, function () {
  console.log(`Server is runnnning port ${PORT}`);
});

const db = new pg.Pool({
  connectionString: process.env.DB_CONN_STRING,
});

app.post("/save-idea", async function (request, response) {
  console.log("POST route of /save-idea has been hit");
  console.log("The request body is: ", request.body);

  const formValues = request.body;

  const dbResponse = await db.query(
    `
    INSERT INTO saved_ideas
  (idea_text, created_at)
  VALUES ($1, NOW())`,
    [formValues.idea]
  );
});

app.get("/saved-ideas", async function (request, response) {
  const dbResponse = await db.query(
    `SELECT idea_text, created_at FROM saved_ideas`
  );
  response.json(dbResponse.rows);
});
