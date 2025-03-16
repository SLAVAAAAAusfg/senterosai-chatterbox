
export const sendMessage = async (
  prompt: string, 
  imageUrl: string | null = null, 
  thinkingMode = false
): Promise<Response> => {
  const API_URL = "/api/chat";  // This will use the relative path which will work with the Flask app
  
  try {
    console.log('Sending message to API:', prompt);
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
      throw new Error(`Failed to send message: ${response.statusText || 'API not available'}`);
    }
    
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
