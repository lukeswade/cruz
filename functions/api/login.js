// Cloudflare Pages Function -> /api/login
export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const body = await request.json();
        const { email, password } = body;



        // Standard D1 lookup
        const parent = await env.DB.prepare("SELECT * FROM parents WHERE email = ? AND password = ?").bind(email, password).first();
        
        if (parent) {
            const { results } = await env.DB.prepare("SELECT * FROM players WHERE parent_id = ?").bind(parent.id).all();
            return Response.json({ success: true, parent_id: parent.id, players: results });
        }
        return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
