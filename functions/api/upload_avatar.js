// Cloudflare Pages Function -> /api/upload_avatar
export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const body = await request.json();
        const { player_id, b64 } = body;
        
        await env.DB.prepare(
            `UPDATE players SET photo_b64 = ? WHERE id = ?`
        ).bind(b64, player_id).run();
        
        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
