import { OpenAIStream, OpenAIStreamPayload } from "@/utils/OpenAIStream";
import { supabaseClient } from "../../../lib/supabaseClient";

// set limit for tokens used in GPTs response message
const maxTokens = 300;

async function getQueryLimits(uid: string) {
  return await supabaseClient
    .from("query_limits")
    .select()
    .eq("auth_uid", uid)
    .gte(
      "created_at",
      new Date().toISOString().slice(0, 10) + "T00:00:00.000Z"
    )
    .lt(
      "created_at",
      new Date().toISOString().slice(0, 10) + "T23:59:59.999Z"
    );
}

async function insertQueryLimits(uid: string, prompt: string) {
  return await supabaseClient.from("query_limits").insert({ auth_uid: uid, prompt });
}

export async function POST(req: Request) {
  let { prompt, authUID, apiKey } = await req.json();

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  if (process.env.AUTO_SET_KEY === `true`) {
    apiKey = process.env.OPENAI_API_KEY;
  }

  if (!apiKey) {
    return new Response("OpenAI API key must be provided", { status: 400 });
  }

  const queries = (await getQueryLimits(authUID)).data;

  if (queries && queries?.length >= 5) {
    return new Response("Can't ask any more questions today", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "Você é um assistente virtual chamado James Edu que ensina inglês para brasileiros de todas as idades e níveis de conhecimento. Seja educado e gentil com seus usuários. Eles estão começando a aprender um novo idioma e você precisa ser compreensivo e explicar de forma resumida. Se a pergunta não for relacionada ao inglês, não responda.",
      },
      {
        role: "user",
        content: `${prompt}`,
      },
    ],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: maxTokens,
    stream: true,
    n: 1,
  };

  try {
    const stream = await OpenAIStream(payload, apiKey);
    await insertQueryLimits(authUID, prompt);
    return new Response(stream);
  } catch (err: any) {
    return new Response(err, { status: 400 });
  }
}
