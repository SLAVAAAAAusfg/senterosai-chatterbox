
export const sendMessage = async (
  prompt: string, 
  imageUrl: string | null = null, 
  thinkingMode = false
): Promise<Response> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_url: imageUrl,
      thinking_mode: thinkingMode,
      user_authenticated: true, // Assume authenticated for image uploads
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to send message');
  }

  return response;
};
