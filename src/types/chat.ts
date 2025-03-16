
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  thinking?: boolean;
  pending?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastUpdated: Date;
  messages: Message[];
}
