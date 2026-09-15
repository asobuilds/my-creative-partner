// Service for OpenRouter & Gemini AI APIs

export async function enhancePromptWithAI(userPrompt, provider = 'openrouter') {
  const apiKey = provider === 'openrouter' 
    ? import.meta.env.VITE_OPENROUTER_API_KEY 
    : import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("API Key missing, returning raw prompt.");
    return userPrompt;
  }

  try {
    if (provider === 'openrouter') {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001', // Or 'anthropic/claude-3.5-sonnet'
          messages: [
            {
              role: 'system',
              content: 'You are an expert 3D model designer. Optimize the user prompt to generate high-detail 3D assets with texturing descriptions.'
            },
            { role: 'user', content: userPrompt }
          ]
        })
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || userPrompt;
    }
  } catch (error) {
    console.error("AI API Error:", error);
    return userPrompt;
  }
}