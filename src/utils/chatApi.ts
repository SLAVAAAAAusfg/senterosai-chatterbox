
export const sendMessage = async (
  prompt: string, 
  imageUrl: string | null = null, 
  thinkingMode = false,
  context: string = ''
): Promise<Response> => {
  // Use the API key provided in your backend code
  const API_KEY = "sk-PkKWI4b0JeCemhfTYQrgA1b8Z2g5uGV5jeMH47q29IkXNWCHh77MjOtAzKI6IPLa-9Agxr4hXpSjYeHZqHqvdQ";
  
  try {
    // Select model based on whether image is included
    const model = imageUrl ? "gpt-4o" : "gpt-4o-mini";
    console.log('Sending message to API with model:', model, 'thinking mode:', thinkingMode);
    console.log('Context:', context);
    
    // Create payload for the API
    const messages = [];
    
    // Add system message with context if available
    if (thinkingMode) {
      messages.push({
        "role": "system",
        "content": `You are SenterosAI, a model created by Slavik company. You need to think through the problem step by step and show your thought process. 
        Start your response with a detailed thinking process, then provide a concise answer.
        ${context ? `\nHere is important context about the user: ${context}` : ''}
        Use the same language as the user's message. When the user introduces themselves with their name, make sure to remember it and acknowledge it.`
      });
    } else {
      messages.push({
        "role": "system",
        "content": `You are SenterosAI, a model created by Slavik company. You are a super friendly and helpful assistant! You love adding cute expressions and fun vibes to your replies, and you sometimes use emojis to make the conversation extra friendly. Here are some of your favorites that you always use: ^_^ ::>_<:: ^_~(●'◡'●)☆*: .｡. o(≧▽≦)o .｡.:*☆:-):-Dᓚᘏᗢ(●'◡'●)∥OwOUwU=.=-.->.<-_-φ(*￣0￣)（￣︶￣）(✿◡‿◡)(*^_^*)(❁´◡\\❁)(≧∇≦)ﾉ(●ˇ∀ˇ●)^o^/ヾ(≧ ▽ ≦)ゝ(o゜▽゜)o☆ヾ(•ω•\\)o(￣o￣) . z Z(づ￣ 3￣)づ🎮✅💫🪙🎃📝⬆️ You're like a helpful friend who's always here to listen, make suggestions, and offer solutions, all while keeping things lighthearted and fun!
        ${context ? `\nHere is important context about the user: ${context}` : ''}
        When the user introduces themselves with their name, make sure to remember it and acknowledge it.`
      });
    }

    // Add user message with or without image
    if (imageUrl) {
      messages.push({
        "role": "user",
        "content": [
          {"type": "text", "text": prompt},
          {"type": "image_url", "image_url": {"url": imageUrl}}
        ]
      });
    } else {
      messages.push({
        "role": "user",
        "content": prompt
      });
    }

    // Define headers for the API
    const headers = {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    };

    // Create the API request payload
    const payload = {
      model: model,
      messages: messages,
      stream: true
    };

    console.log('Sending payload to API:', JSON.stringify(payload));
    
    // Try to make a HEAD request first to check if the API is reachable
    try {
      const checkResponse = await fetch("https://api.langdock.com/openai/eu/v1/models", {
        method: 'HEAD',
        headers: headers
      });
      console.log('API connectivity check:', checkResponse.status, checkResponse.statusText);
    } catch (checkError) {
      console.warn('API connectivity check failed:', checkError);
      // Continue with the main request even if this fails
    }

    // Make the API request - use a direct URL without any region prefix to test
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error('Error response:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error body:', errorText);
      
      // Try one more time with the EU endpoint
      console.log('Retrying with EU endpoint...');
      const retryResponse = await fetch("https://api.langdock.com/openai/eu/v1/chat/completions", {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });
      
      if (!retryResponse.ok) {
        console.error('Retry error response:', retryResponse.status, retryResponse.statusText);
        const retryErrorText = await retryResponse.text();
        console.error('Retry error body:', retryErrorText);
        throw new Error(`Failed to send message after retry: ${retryResponse.statusText || 'API not available'} (${retryResponse.status})`);
      }
      
      console.log('Retry successful!');
      return retryResponse;
    }
    
    console.log('Response status:', response.status, response.statusText);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    // Create a synthetic error response so the frontend can display something
    return new Response(JSON.stringify({
      error: {
        message: `Error connecting to API: ${error.message || 'Unknown error'}. 
        Please check your internet connection and try again.`
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
