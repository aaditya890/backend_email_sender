export const config = { runtime: 'edge' };

export default async function handler(_req: Request): Promise<Response> {
  const headers = {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type'
  };
  return new Response('✅ Resend Email API is running', { headers });
}
