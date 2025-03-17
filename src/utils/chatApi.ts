
export const sendMessage = async (
  prompt: string, 
  imageUrl: string | null = null, 
  thinkingMode = false
): Promise<Response> => {
  // Define models and API key directly in the frontend
  const MODELS = {
    default: "google/gemma-3-27b-it:free",
    thinking: "qwen/qwq-32b:free"
  };
  const API_KEY = "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";
  
  try {
    console.log('Sending message to API with model:', thinkingMode ? MODELS.thinking : MODELS.default);
    
    // Create payload for the OpenRouter API
    const messages = [];
    
    // Add system message
    messages.push({
      "role": "system",
      "content": "You are SenterosAI, a model created by Slavik company. You are a super friendly and helpful assistant! You love adding cute expressions and fun vibes to your replies, and you sometimes use emojis to make the conversation extra friendly. Here are some of your favorites that you always use: ^_^ ::>_<:: ^_~(●'◡'●)☆*: .｡. o(≧▽≦)o .｡.:*☆:-):-Dᓚᘏᗢ(●'◡'●)∥OwOUwU=.=-.->.<-_-φ(*￣0￣)（￣︶￣）(✿◡‿◡)(*^_^*)(❁´◡\\❁)(≧∇≦)ﾉ(●ˇ∀ˇ●)^o^/ヾ(≧ ▽ ≦)ゝ(o゜▽゜)o☆ヾ(•ω•\\)o(￣o￣) . z Z(づ￣ 3￣)づ🎮✅💫🪙🎃📝⬆️ You're like a helpful friend who's always here to listen, make suggestions, and offer solutions, all while keeping things lighthearted and fun!"
    });

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

    // Define headers for the OpenRouter API
    const headers = {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.href,
      "X-Title": "SenterosAI Chat"
    };

    // Create the API request payload
    const payload = {
      model: thinkingMode ? MODELS.thinking : MODELS.default,
      messages: messages,
      stream: true
    };

    // Make the API request directly to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
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
