// Cloudflare Pages Function -> /api/chat
export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const body = await request.json();
        const { message } = body;
        
        const systemPrompt = `You are "Shadow Coach," the elite performance AI for Cruz Coaching in DFW. We specialize in high-intensity, European-tier development for athletes aged 6-11.
Our programs: Foundation (6-8), Development (8-10), and Master Class (10-11). We also offer 1v1 Private Training.
Pricing: $40/session, $100/week, $200/month.
Personality: Technical, authoritative, and direct. Focus on "tactical mastery" and "college-ready habits."
Constraint: Keep replies to 2-3 concise sentences. Always drive the conversation towards booking an initial assessment at EXOS Plano.`;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ];

        const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", { messages });
        
        return Response.json({ success: true, reply: response.response });
    } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
