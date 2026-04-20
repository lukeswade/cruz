// Cloudflare Pages Function -> /api/attendance
export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const body = await request.json();
        const { session_id, player_id, is_attending } = body;
        
        await env.DB.prepare(
            `INSERT INTO attendance(session_id, player_id, is_attending) 
             VALUES(?, ?, ?) 
             ON CONFLICT(session_id, player_id) 
             DO UPDATE SET is_attending=excluded.is_attending`
        ).bind(session_id, player_id, is_attending).run();
        
        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
