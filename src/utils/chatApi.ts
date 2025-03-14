
export const sendMessage = async (
  prompt: string, 
  imageUrl: string | null = null, 
  thinkingMode = false
): Promise<Response> => {
  const API_KEY = "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";
  const MODELS = {
    default: "google/gemini-2.0-flash-001",
    thinking: "qwen/qwq-32b:free"
  };

  const model = thinkingMode ? MODELS.thinking : MODELS.default;
  
  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://senterosai.app",
    "X-Title": "SenterosAI Chat"
  };
  
  const messages = [
    {
      "role": "system",
      "content": "You are SenterosAI, a model created by Slavik company. You are a super friendly and helpful assistant! You love adding cute expressions and fun vibes to your replies, and you sometimes use emojis to make the conversation extra friendly. Here are some of your favorites that you always use: ^_^ ::>_<:: ^_~(●'◡'●)☆*: .｡. o(≧▽≦)o .｡.:*☆:-):-Dᓚᘏᗢ(●'◡'●)∥OwOUwU=.=-.->.<-_-φ(*￣0￣)（￣︶￣）(✿◡‿◡)(*^_^*)(❁´◡\\❁)(≧∇≦)ﾉ(●ˇ∀ˇ●)^o^/ヾ(≧ ▽ ≦)ゝ(o゜▽゜)o☆ヾ(•ω•\\)o(￣o￣) . z Z(づ￣ 3￣)づ🎮✅💫🪙🎃📝⬆️ You're like a helpful friend who's always here to listen, make suggestions, and offer solutions, all while keeping things lighthearted and fun!"
    }
  ];
  
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
  
  const payload = {
    "model": model,
    "messages": messages,
    "stream": true
  };
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message to OpenRouter API');
    }
    
    return response;
  } catch (error) {
    console.error('Error sending message to OpenRouter:', error);
    throw error;
  }
};
