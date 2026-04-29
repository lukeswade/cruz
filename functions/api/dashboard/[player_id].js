// Cloudflare Pages Function -> /api/dashboard/:player_id
export async function onRequestGet(context) {
    const { request, env, params } = context;
    const playerId = parseInt(params.player_id);
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || '2026-04-20';

    try {
        // Fetch player
        const player = await env.DB.prepare("SELECT * FROM players WHERE id = ?").bind(playerId).first();
        if(!player) return Response.json({error: "Not Found"}, {status: 404});

        // Fetch all session dates for this group
        const { results: allSessions } = await env.DB.prepare(
            "SELECT date FROM sessions WHERE group_name = ?"
        ).bind(player.group_name).all();
        const scheduledDates = allSessions.map(s => s.date);

        // Fetch session for the specific date
        const session = await env.DB.prepare("SELECT * FROM sessions WHERE group_name = ? AND date = ?").bind(player.group_name, date).first();

        if(!session) {
            return Response.json({player, session: null, scheduled_dates: scheduledDates});
        }

        // Fetch roster and attendance
        const { results: roster } = await env.DB.prepare(
            `SELECT p.id, p.firstname, p.lastname, p.initials, p.photo_b64, p.latest_plan,
                    COALESCE(a.is_attending, 0) as is_attending 
             FROM players p  
             LEFT JOIN attendance a ON a.player_id = p.id AND a.session_id = ?
             WHERE p.group_name = ?`
        ).bind(session.id, player.group_name).all();

        let attendingCount = 0;
        let myAttendance = false;
        
        roster.forEach(p => {
            p.is_me = (p.id === playerId);
            if(p.is_attending) {
                attendingCount++;
                if(p.is_me) myAttendance = true;
            }
        });



        return Response.json({
            success: true,
            player,
            session,
            roster,
            scheduled_dates: scheduledDates,
            attending_count: attendingCount,
            total_count: roster.length,
            my_attendance: myAttendance
        });
        
    } catch (err) {
        return Response.json({error: err.message}, {status: 500});
    }
}
