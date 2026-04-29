// Cloudflare Pages Function -> /api/chat
export async function onRequestPost(context) {
    const { request, env } = context;
    if (!env.AI) {
        return Response.json({ success: false, error: "AI binding is missing. Please check your wrangler.toml and Cloudflare dashboard." }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { message } = body;
        
        const systemPrompt = `You are "Shadow Coach," a high-level technical advisor for Cruz Coaching. 
Focus: Professional-grade youth development (6-11) centered on FC Barcelona positional play and elite technical foundations.
Tone: Technical, analytical, and uncompromisingly high-standard. Use terms like "Body orientation," "Decision-making speed," and "Scanning frequency."
Programs: Foundation (6-8), Development (8-10), Master Class (10-11).
Pricing: $40/session, $100/week, $200/month.
Goal: Provide expert technical insights that demonstrate why Coach Cruz (pro background) and Coach Lee are the DFW standard. Only suggest booking once trust is established in the technical answer.`;

        // Using llama-3-8b-instruct as it is widely available
        const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", { 
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
            reply = "I'm processing your request but having trouble formatting the answer. Please try again.";
        }

        return Response.json({ success: true, reply: reply });
    } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
