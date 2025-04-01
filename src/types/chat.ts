
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  thinking?: boolean;
  pending?: boolean;
  imageUrl?: string | null;
  thoughtProcess?: string;
  memory?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastUpdated: Date;
  messages: Message[];
  context?: string; // For memory/context between messages
}
