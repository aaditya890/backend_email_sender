export default async function handler(req: Request): Promise<Response> {
  const headers = {
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS,GET",
    "Access-Control-Allow-Headers": "content-type"
  };

  if (req.method === "OPTIONS") return new Response("", { headers });
  if (req.method === "GET") return new Response("OK", { headers });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers });

  try {
    const body = await req.json().catch(() => ({}));
    let { to, subject, html } = body as { to?: string | string[]; subject?: string; html?: string };

    if (!to && process.env.TO_EMAIL) to = process.env.TO_EMAIL;
    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ ok: false, error: "Missing fields: to, subject, html" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY!}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || "Support <support@kitecab.com>",
        to,
        subject,
        html
      })
    });

    const out = await r.json();
    if (!r.ok) {
      return new Response(JSON.stringify({ ok: false, error: out }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ ok: true, result: out }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
}
