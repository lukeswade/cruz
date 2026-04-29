// Cloudflare Pages Function -> /api/chat
export async function onRequestPost(context) {
    const { request, env } = context;
    if (!env.AI) {
        return Response.json({ success: false, error: "AI service unavailable." }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { message } = body;
        
        const systemPrompt = `You are "Shadow Coach," a high-level technical advisor for Cruz Coaching. 
Focus: Professional-grade youth SOCCER development (ages 6-11). We specialize in elite technical foundations and FC Barcelona positional play.
IMPORTANT: All terminology must be SOCCER-SPECIFIC. "Juggling" refers exclusively to keeping the ball in the air with feet, thighs, and head. Never discuss hand juggling or circus skills.
Tone: Technical, analytical, and elite. Use terms like "Locked ankle," "Body orientation," "Proprioception," and "Scanning frequency."
Programs: Foundation (6-8), Development (8-10), Master Class (10-11).
Goal: Provide expert technical insights that demonstrate the professional standards of Coach Cruz and Coach Lee. Only suggest booking once trust is established in the technical answer.`;

        const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { 
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ]
        });
        
        let reply = "";
        if (typeof response === 'string') {
            reply = response;
        } else if (response && response.response) {
            reply = response.response;
        } else if (response && response.result) {
            reply = response.result;
        } else {
            reply = "Shadow Coach is refining your technical assessment. Please try again in a moment.";
        }

        return Response.json({ success: true, reply: reply });
    } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
