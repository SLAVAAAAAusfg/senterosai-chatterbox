
import React, { useState } from 'react';
import { 
  ChevronRight, 
  MessageSquare, 
  PlusCircle, 
  Trash2,
  X,
  Edit,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat, type ChatSession } from '@/contexts/ChatContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getTranslation } from '@/utils/translations';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ChatHistoryProps {
  className?: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ className }) => {
  const { sessions, currentSession, setCurrentSession, createNewSession, deleteSession, renameSession } = useChat();
  const { language, isSidebarOpen, setSidebarOpen } = useSettings();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return getTranslation('today', language);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return getTranslation('yesterday', language);
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleCreateNewChat = () => {
    createNewSession();
  };

  const handleDeleteClick = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (chatToDelete) {
      deleteSession(chatToDelete);
      setIsDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };

  const handleEditClick = (chatId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setEditingTitle(title);
  };

  const handleSaveEdit = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingChatId && editingTitle.trim()) {
      renameSession(editingChatId, editingTitle);
      setEditingChatId(null);
    }
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // Group sessions by date
  const groupedSessions: Record<string, ChatSession[]> = {};
  sessions.forEach(session => {
    const dateKey = formatDate(new Date(session.lastUpdated));
    if (!groupedSessions[dateKey]) {
      groupedSessions[dateKey] = [];
    }
    groupedSessions[dateKey].push(session);
  });

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out transform",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex flex-col h-full pt-16">
          <div className="flex items-center justify-between px-4 py-4">
            <h2 className="text-lg font-semibold">
              {getTranslation('chatHistory', language)}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleCloseSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            className="mx-4 mb-4 flex items-center gap-2 bg-sidebar-accent hover:bg-sidebar-accent/80"
            onClick={handleCreateNewChat}
          >
            <PlusCircle className="h-4 w-4" />
            {getTranslation('newChat', language)}
          </Button>
          
          <div className="flex-1 overflow-y-auto px-2">
            {Object.keys(groupedSessions).length > 0 ? (
              Object.entries(groupedSessions).map(([date, dateSessions]) => (
                <div key={date} className="mb-4">
                  <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    {date}
                  </h3>
                  <ul className="space-y-1">
                    {dateSessions.map((session) => (
                      <li key={session.id}>
                        {editingChatId === session.id ? (
                          <form 
                            onSubmit={handleSaveEdit}
                            className="flex items-center gap-1 px-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              autoFocus
                              className="flex-1 h-8 text-sm"
                            />
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              type="submit"
                              className="h-7 w-7"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </form>
                        ) : (
                          <div
                            className={cn(
                              "flex items-center group px-2 py-2 rounded-md cursor-pointer hover:bg-sidebar-accent transition-all duration-150",
                              currentSession.id === session.id && "bg-sidebar-accent"
                            )}
                            onClick={() => setCurrentSession(session)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                              {session.title || getTranslation('newChat', language)}
                            </span>
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={(e) => handleEditClick(session.id, session.title, e)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => handleDeleteClick(session.id, e)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {getTranslation('emptyHistory', language)}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
      
      {/* Mobile overlay - clickable to close sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-10 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{getTranslation('deleteChat', language)}</DialogTitle>
            <DialogDescription>
              {getTranslation('confirmDelete', language)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {getTranslation('cancel', language)}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {getTranslation('delete', language)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatHistory;
