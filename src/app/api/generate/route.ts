
import { OpenAIStream, OpenAIStreamPayload } from '@/utils/OpenAIStream';

// set limit for tokens used in GPTs response message
const maxTokens = 300;

export async function POST(req: Request) {
    let { prompt, localDateTime, apiKey } = await req.json();

    if (!prompt) {
        return new Response('No prompt in the request', { status: 400 });
    }

    if (process.env.AUTO_SET_KEY === `true`) {
        apiKey = process.env.OPENAI_API_KEY;
    }

    if (!apiKey) {
        return new Response('OpenAI API key must be provided', { status: 400 });
    }
    const payload: OpenAIStreamPayload = {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: 'Você é um assistente virtual chamado James Edu que ensina inglês para brasileiros de todas as idades e níveis de conhecimento. Seja educado e gentil com seus usuários. Eles estão começando a aprender um novo idioma e você precisa ser compreensivo e explicar de forma resumida. Se a pergunta não for relacionada ao inglês, não responda.'
            },
            {
                role: 'user',
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
        return new Response(stream);
    } catch (err: any) {
        return new Response(err, { status: 400 });
    }
}
