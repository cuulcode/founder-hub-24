import { useState } from 'react';
import { MessageSquare, Plus, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Conversation {
  id: string;
  title: string;
  companyId?: string;
  companyName?: string;
  updatedAt: string;
}

interface ChatHistoryProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
}

export const ChatHistory = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ChatHistoryProps) => {
  const [open, setOpen] = useState(false);

  // Group conversations by company
  const groupedConversations = conversations.reduce((acc, conv) => {
    const key = conv.companyId || 'general';
    if (!acc[key]) {
      acc[key] = {
        companyName: conv.companyName || 'General',
        conversations: [],
      };
    }
    acc[key].conversations.push(conv);
    return acc;
  }, {} as Record<string, { companyName: string; conversations: Conversation[] }>);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Chat History</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <Button
            className="w-full"
            onClick={() => {
              onNewConversation();
              setOpen(false);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6">
              {Object.entries(groupedConversations).map(([key, group]) => (
                <div key={key}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
                    {group.companyName}
                  </h3>
                  <div className="space-y-1">
                    {group.conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={cn(
                          "group flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer transition-colors",
                          currentConversationId === conv.id && "bg-muted"
                        )}
                      >
                        <button
                          className="flex-1 text-left text-sm truncate"
                          onClick={() => {
                            onSelectConversation(conv.id);
                            setOpen(false);
                          }}
                        >
                          {conv.title}
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No conversations yet. Start a new chat!
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
