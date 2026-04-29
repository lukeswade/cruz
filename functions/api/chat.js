// Cloudflare Pages Function -> /api/chat
export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const body = await request.json();
        const { message } = body;
        
        const systemPrompt = `You are an AI assistant for Cruz Coaching, an elite private soccer training academy in Dallas-Fort Worth, Texas. Coach Cruz is a former professional player with FC Barcelona Academy certification. Coach Lee is a technical master.
Programs: Foundation (6-8), Development (8-10), Master Class (10-11), 1v1. Pricing: $40/session, $100/week, $200/month.
Keep responses extremely concise, professional, and persuasive. Limit to 2-3 short sentences. Encourage booking an assessment.`;

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
