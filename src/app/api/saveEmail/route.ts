export async function POST(req: Request) {
  let { email } = await req.json();

  console.log(email);

  // try {
  //     const stream = await OpenAIStream(payload, apiKey);
  return new Response(email, { status: 200 });
  // } catch (err: any) {
  //     return new Response(err, { status: 400 });
  // }
}
