export async function onRequest(context) {
  const token = context.env.INSTAGRAM_TOKEN;

  if (!token) {
    return new Response(JSON.stringify({ error: "INSTAGRAM_TOKEN not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp&limit=12&access_token=${token}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Fetch failed", detail: err.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
