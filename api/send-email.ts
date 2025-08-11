export const config = { runtime: 'edge', regions: ['sin1'] };

export default async function handler(req: Request): Promise<Response> {
  const cors = {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS,GET',
    'Access-Control-Allow-Headers': 'content-type'
  };

  // CORS preflight
  if (req.method === 'OPTIONS') return new Response('', { headers: cors });
  // Simple health on GET
  if (req.method === 'GET') return new Response('OK', { headers: cors });
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors });

  try {
    const body = await req.json().catch(() => ({}));
    let { to, subject, html } = body as { to?: string | string[]; subject?: string; html?: string };

    // Backward compatible: allow passing "to" from client OR fall back to env
    if (!to && process.env.TO_EMAIL) to = process.env.TO_EMAIL;

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing fields: to, subject, html' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // Resend call
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY!}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'Support <support@kitecab.com>',
        to,
        subject,
        html
      })
    });

    const out = await r.json();

    if (!r.ok) {
      return new Response(JSON.stringify({ ok: false, error: out }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ ok: true, result: out }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
}
