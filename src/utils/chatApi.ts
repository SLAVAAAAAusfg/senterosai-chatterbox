
export const sendMessage = async (
  prompt: string, 
  imageUrl: string | null = null, 
  thinkingMode = false
): Promise<Response> => {
  const API_URL = "/api/chat";
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_url: imageUrl,
        thinking_mode: thinkingMode
      })
    });
    
    if (!response.ok) {
      console.error('Error response:', response.status, response.statusText);
      throw new Error(`Failed to send message: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
