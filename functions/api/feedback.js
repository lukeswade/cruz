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
        const prompt = `You are an elite soccer coach assistant. Rewrite the following voice feedback into a structured practice plan with clear, actionable bullet points. Provide 'Observations' and a brief 'Practice Plan' checklist.
Feedback: "${text}"`;

        const llmRes = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
            messages: [{ role: "user", content: prompt }]
        });

        return Response.json({ success: true, transcript: text, plan: llmRes.response });
    } catch (e) {
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
