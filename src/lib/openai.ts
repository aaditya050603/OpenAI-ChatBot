import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function createEmbedding(text: string) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

export async function chatCompletion(messages: any[]) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });
  return res.choices[0].message?.content;
}
