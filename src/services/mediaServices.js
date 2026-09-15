// Service for 3D Generation & Video Export APIs

export async function generate3DModel(prompt) {
  const meshyKey = import.meta.env.VITE_MESHY_API_KEY;
  
  if (!meshyKey) {
    throw new Error("Meshy API key is missing in .env");
  }

  // 1. Submit Generation Task
  const response = await fetch('https://api.meshy.ai/v2/text-to-3d', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${meshyKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      mode: 'preview',
      prompt: prompt,
      art_style: 'realistic'
    })
  });

  const data = await response.json();
  const taskId = data.result;

  // 2. Poll status until completed
  let modelUrl = null;
  while (!modelUrl) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    const pollRes = await fetch(`https://api.meshy.ai/v2/text-to-3d/${taskId}`, {
      headers: { 'Authorization': `Bearer ${meshyKey}` }
    });
    const pollData = await pollRes.json();

    if (pollData.status === 'SUCCEEDED') {
      modelUrl = pollData.model_urls.glb;
    } else if (pollData.status === 'FAILED') {
      throw new Error('3D Generation task failed on Meshy API server.');
    }
  }

  return modelUrl;
}

// Export canvas frame to video status story via automated cloud rendering
export async function renderVideoStory(imageDataUrl) {
  const shotstackKey = import.meta.env.VITE_SHOTSTACK_API_KEY;
  if (!shotstackKey) return null;

  // Render a 5-second vertical video story (1080x1920)
  const editPayload = {
    timeline: {
      tracks: [
        {
          clips: [
            {
              asset: { type: 'image', src: imageDataUrl },
              start: 0,
              length: 5,
              effect: 'zoomIn'
            }
          ]
        }
      ]
    },
    output: { format: 'mp4', resolution: 'hd', aspect: '9:16' }
  };

  const response = await fetch('https://api.shotstack.io/v1/render', {
    method: 'POST',
    headers: {
      'x-api-key': shotstackKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(editPayload)
  });

  return await response.json();
}