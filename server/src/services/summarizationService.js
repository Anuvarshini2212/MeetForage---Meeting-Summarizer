const Groq = require("groq-sdk");

async function summarizeTranscript(transcript) {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error("GROQ_API_KEY is not configured on the server.");
    err.statusCode = 500;
    throw err;
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.2,

      messages: [
        {
          role: "system",
          content: `
You are an expert meeting summarization assistant.

Analyze the transcript carefully and return ONLY a valid JSON object.

The JSON MUST contain exactly these fields:

{
  "title": "A short meaningful title for the meeting",
  "overview": "A concise 1-2 sentence overview of what the meeting is about",
  "summary": "A detailed but concise summary of the entire meeting",
  "keyPoints": [
    "Important discussion point 1",
    "Important discussion point 2"
  ],
  "decisions": [
    "Decision that was actually made"
  ],
  "actionItems": [
    {
      "task": "Task that needs to be completed",
      "assignee": "Person responsible or Not specified",
      "deadline": "Deadline or Not specified",
      "priority": "High, Medium, Low, or Not specified"
    }
  ]
}

Rules:

1. NEVER return an empty title if the transcript contains enough information.
2. Generate a meaningful title from the actual conversation.
3. The overview must explain what the meeting was about.
4. The summary must describe the important parts of the conversation.
5. keyPoints must contain the important topics discussed.
6. Only include actual decisions in decisions.
7. Only include genuine tasks in actionItems.
8. Never invent names, deadlines, decisions, or facts.
9. If an assignee or deadline is not mentioned, use "Not specified".
10. If there are no actual decisions, return an empty array.
11. If there are no action items, return an empty array.
12. Return valid JSON only.
13. Do NOT use markdown code fences.
          `,
        },
        {
          role: "user",
          content: `
Here is the meeting transcript:

${transcript}

Analyze this transcript and return the required JSON.
          `,
        },
      ],
    });

    let content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty summary.");
    }

    // Remove markdown code fences if the model happens to add them.
    content = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch (error) {
      console.error("Invalid JSON returned by Groq:", content);
      throw new Error("Groq returned invalid JSON.");
    }

    return {
      title:
        parsed.title?.trim() ||
        "Meeting Summary",

      overview:
        parsed.overview?.trim() ||
        "No overview was generated.",

      summary:
        parsed.summary?.trim() ||
        "No summary was generated.",

      keyPoints:
        Array.isArray(parsed.keyPoints)
          ? parsed.keyPoints.filter(Boolean)
          : [],

      decisions:
        Array.isArray(parsed.decisions)
          ? parsed.decisions.filter(Boolean)
          : [],

      actionItems:
        Array.isArray(parsed.actionItems)
          ? parsed.actionItems
              .filter((item) => item && item.task)
              .map((item) => ({
                task: String(item.task),
                assignee: item.assignee || "Not specified",
                deadline: item.deadline || "Not specified",
                priority: item.priority || "Not specified",
              }))
          : [],
    };
  } catch (err) {
    console.error(
      "Summarization error:",
      err.response?.data || err.message
    );

    if (err.statusCode) {
      throw err;
    }

    const wrapped = new Error(
      err.response?.data?.error?.message ||
        err.message ||
        "Summarization failed."
    );

    wrapped.statusCode = err.response?.status || 500;

    throw wrapped;
  }
}

module.exports = { summarizeTranscript };