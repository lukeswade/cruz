// Cloudflare Pages Function -> /api/login
export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const body = await request.json();
        const { email, password } = body;

        // POC Hardcoded Fallback
        const pocUsers = {
            'luke@lukewade.net': { 
                password: 'lukewade', 
                id: 2, 
                players: [
                    { id: 1, parent_id: 2, firstname: 'Liam', lastname: 'Smith', initials: 'LS', group_name: 'U11-U12 Elite' },
                    { id: 2, parent_id: 2, firstname: 'Jackson', lastname: 'C', initials: 'JC', group_name: 'U11-U12 Elite' }
                ]
            },
            'cruz@lukewade.net': { 
                password: 'cruz', 
                id: 3, 
                players: [
                    { id: 3, parent_id: 3, firstname: 'Mateo', lastname: 'R', initials: 'MR', group_name: 'U11-U12 Elite' },
                    { id: 5, parent_id: 3, firstname: 'Noah', lastname: 'Smith', initials: 'NS', group_name: 'U13 Mastery Clinic' }
                ]
            },
            'lee@lukewade.net': { 
                password: 'lee', 
                id: 4, 
                players: [
                    { id: 4, parent_id: 4, firstname: 'Ethan', lastname: 'W', initials: 'EW', group_name: 'U11-U12 Elite' }
                ]
            }
        };

        if (pocUsers[email] && pocUsers[email].password === password) {
            const user = pocUsers[email];
            return Response.json({ success: true, parent_id: user.id, players: user.players });
        }

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
