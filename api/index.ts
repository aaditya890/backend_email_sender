export const config = { runtime: 'edge', regions: ['sin1'] }; // Singapore (fast for India)

export default async function handler(_req: Request): Promise<Response> {
  const cors = {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type'
  };
  return new Response('✅ Resend Email API is running', { headers: cors });
}
