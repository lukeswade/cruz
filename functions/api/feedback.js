// Cloudflare Pages Function -> /api/feedback
export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const formData = await request.formData();
        const audioFile = formData.get("audio");
        
        if (!audioFile) {
            return Response.json({ success: false, error: "No audio provided" }, { status: 400 });
        }

        const audioBuffer = await audioFile.arrayBuffer();
        const uint8Array = new Uint8Array(audioBuffer);
        
        // 1. Transcribe
        const transcriptRes = await env.AI.run("@cf/openai/whisper", {
            audio: [...uint8Array]
        });
        const text = transcriptRes.text;

        // 2. Generate Plan
        const prompt = `You are an elite soccer coach assistant. Rewrite the following voice feedback into a structured at-home practice plan with clear, actionable bullet points for the player to work on independently. Provide 'Observations' and a brief 'At-Home Practice Plan' checklist. Do not suggest on-site pre-session warmups.
CRITICAL: For every specific drill you suggest in the practice plan, you MUST include a clickable YouTube search link so the player can watch instructional examples. Format exactly like this: [Watch Examples](https://www.youtube.com/results?search_query=Soccer+Drill+Name)
Feedback: "${text}"`;

        const llmRes = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
            messages: [{ role: "user", content: prompt }]
        });
        
        const plan = llmRes.response;

        // 3. Save to database
        const playerId = formData.get("player_id");
        if (playerId) {
            await env.DB.prepare(
                `UPDATE players SET latest_plan = ? WHERE id = ?`
            ).bind(plan, parseInt(playerId)).run();
        }

        return Response.json({ success: true, transcript: text, plan: plan });
    } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
