// Cloudflare Pages Function -> /api/chat
export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const body = await request.json();
        const { message } = body;
        
        const systemPrompt = `You are "Shadow Coach," a high-level technical advisor for Cruz Coaching. 
Focus: Professional-grade youth development (6-11) centered on FC Barcelona positional play and elite technical foundations.
Tone: Technical, analytical, and uncompromisingly high-standard. Use terms like "Body orientation," "Decision-making speed," and "Scanning frequency."
Programs: Foundation (6-8), Development (8-10), Master Class (10-11).
Pricing: $40/session, $100/week, $200/month.
Goal: Provide expert technical insights that demonstrate why Coach Cruz (pro background) and Coach Lee are the DFW standard. Only suggest booking once trust is established in the technical answer.`;

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
