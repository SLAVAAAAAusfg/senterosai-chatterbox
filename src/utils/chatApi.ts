
export const sendMessage = async (
  prompt: string, 
  imageUrl: string | null = null, 
  thinkingMode = false
): Promise<Response> => {
  // For development in the Lovable environment, we need to proxy the request to the Flask backend
  const isProdOrDev = window.location.hostname.includes('lovableproject.com');
  // In production or development in Lovable, we'll use a proxy URL
  const API_URL = isProdOrDev 
    ? "https://flask-backend-7u8p.onrender.com/api/chat" 
    : "/api/chat";  // Local development path
  
  try {
    console.log('Sending message to API:', prompt, 'URL:', API_URL);
    
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
