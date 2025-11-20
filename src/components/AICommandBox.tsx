import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';
import { ChatHistory } from '@/components/ChatHistory';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AICommandBoxProps {
  companies: Company[];
  onCommandExecuted: () => void;
  selectedCompanyId?: string;
  showHistory?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  company_id?: string;
  updated_at: string;
}

export const AICommandBox = ({ companies, onCommandExecuted, selectedCompanyId, showHistory = true }: AICommandBoxProps) => {
  const [command, setCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const { toast } = useToast();
  const [recognition, setRecognition] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('id, title, company_id, updated_at')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setConversations(data);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
    }
  };

  const createNewConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        company_id: selectedCompanyId || null
      })
      .select()
      .single();

    if (!error && data) {
      setCurrentConversationId(data.id);
      setMessages([]);
      await loadConversations();
      toast({
        title: "New Chat Started",
        description: "Your conversation is ready.",
      });
    }
  };

  const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (!error) {
      if (currentConversationId === conversationId) {
        setCurrentConversationId(undefined);
        setMessages([]);
      }
      await loadConversations();
      toast({
        title: "Conversation Deleted",
        description: "The conversation has been removed.",
      });
    }
  };

  const updateConversationTitle = async (conversationId: string, firstMessage: string) => {
    const title = firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '');
    await supabase
      .from('chat_conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  };

  useEffect(() => {
    // Initialize Web Speech API with continuous listening
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true; // Enable continuous listening
      recognitionInstance.interimResults = true; // Enable real-time results
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 1;

      let finalTranscript = '';

      recognitionInstance.onstart = () => {
        finalTranscript = '';
      };

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update command with both final and interim transcripts
        setCommand(finalTranscript + interimTranscript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          toast({
            title: "Speech Error",
            description: "Failed to recognize speech. Please try again.",
            variant: "destructive",
          });
          setIsListening(false);
        }
      };

      recognitionInstance.onend = () => {
        // Auto-restart if still in listening mode
        if (isListening) {
          try {
            recognitionInstance.start();
          } catch (e) {
            console.log('Recognition restart failed:', e);
            setIsListening(false);
          }
        }
      };

      setRecognition(recognitionInstance);
    }
  }, [toast, isListening]);

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak now. Click the mic button again to stop.",
        });
      } catch (e) {
        console.error('Failed to start recognition:', e);
        toast({
          title: "Error",
          description: "Failed to start speech recognition.",
          variant: "destructive",
        });
      }
    }
  };

  const executeCommand = async () => {
    if (!command.trim()) return;

    setIsProcessing(true);

    const userMessage = command;
    setCommand('');

    try {
      // Create conversation if none exists
      let conversationId = currentConversationId;
      if (!conversationId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            company_id: selectedCompanyId || null
          })
          .select()
          .single();

        if (error) throw error;
        conversationId = data.id;
        setCurrentConversationId(conversationId);
        await loadConversations();
      }

      // Save user message
      const { data: userMsgData, error: userMsgError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: userMessage
        })
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      // Update messages immediately
      setMessages(prev => [...prev, userMsgData as Message]);

      // Update conversation title if it's the first message
      if (messages.length === 0) {
        await updateConversationTitle(conversationId, userMessage);
        await loadConversations();
      }

      // Prepare context for AI with message history
      const context = {
        selectedCompanyId,
        companies: companies.map(c => ({
          id: c.id,
          name: c.name,
          habits: c.habits.map(h => ({ id: h.id, name: h.name, completedDates: h.completedDates, color: h.color })),
          tasks: c.tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed, priority: t.priority })),
          kanbanItems: c.kanbanItems.map(k => ({ id: k.id, title: k.title, status: k.status })),
          notes: c.notes.map(n => ({ id: n.id, content: n.content.substring(0, 100) }))
        }))
      };

      // Get conversation history
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          type: 'command', 
          text: userMessage, 
          context,
          conversationHistory
        }
      });

      if (error) throw error;

      // Execute tool calls
      if (data.toolCalls && data.toolCalls.length > 0) {
        for (const toolCall of data.toolCalls) {
          const args = JSON.parse(toolCall.function.arguments);
          await executeToolCall(toolCall.function.name, args);
        }
        onCommandExecuted();
      }

      // Save assistant response
      const { data: assistantMsgData, error: assistantMsgError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: data.message || 'Command executed successfully'
        })
        .select()
        .single();

      if (assistantMsgError) throw assistantMsgError;

      // Update messages
      setMessages(prev => [...prev, assistantMsgData as Message]);

      // Update conversation timestamp
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error executing command:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to execute command",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const executeToolCall = async (toolName: string, args: any) => {
    switch (toolName) {
      case 'mark_habit_complete': {
        const { error } = await supabase.from('habit_completions').insert({
          habit_id: args.habitId,
          completed_date: args.date
        });
        if (error) throw error;
        break;
      }
      case 'add_task': {
        const { error } = await supabase.from('tasks').insert({
          company_id: args.companyId,
          title: args.title,
          completed: false,
          priority: args.priority,
          category: args.category || 'general'
        });
        if (error) throw error;
        break;
      }
      case 'add_note': {
        const { error } = await supabase.from('notes').insert({
          company_id: args.companyId,
          content: args.content,
          title: '',
          color: args.color || '#fef3c7'
        });
        if (error) throw error;
        break;
      }
      case 'update_task': {
        const { error } = await supabase.from('tasks').update({
          completed: args.completed
        }).eq('id', args.taskId);
        if (error) throw error;
        break;
      }
      case 'add_kanban_item': {
        const { error } = await supabase.from('kanban_items').insert({
          company_id: args.companyId,
          title: args.title,
          description: args.description || '',
          status: args.status
        });
        if (error) throw error;
        break;
      }
      case 'update_kanban_item': {
        const updates: any = {};
        if (args.status) updates.status = args.status;
        if (args.title) updates.title = args.title;
        if (args.description !== undefined) updates.description = args.description;
        
        const { error } = await supabase.from('kanban_items').update(updates).eq('id', args.itemId);
        if (error) throw error;
        break;
      }
      case 'delete_kanban_item': {
        const { error } = await supabase.from('kanban_items').delete().eq('id', args.itemId);
        if (error) throw error;
        break;
      }
      case 'add_dictionary_entry': {
        const { error } = await supabase.from('dictionary').insert({
          company_id: args.companyId,
          word: args.word,
          definition: args.definition
        });
        if (error) throw error;
        break;
      }
      case 'update_dictionary_entry': {
        const { error } = await supabase.from('dictionary').update({
          word: args.word,
          definition: args.definition
        }).eq('id', args.entryId);
        if (error) throw error;
        break;
      }
      case 'delete_dictionary_entry': {
        const { error } = await supabase.from('dictionary').delete().eq('id', args.entryId);
        if (error) throw error;
        break;
      }
      default:
        console.warn('Unknown tool call:', toolName, args);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [command]);

  const conversationsWithCompanyNames = conversations.map(conv => ({
    id: conv.id,
    title: conv.title,
    companyId: conv.company_id,
    companyName: companies.find(c => c.id === conv.company_id)?.name || 'General',
    updatedAt: conv.updated_at
  }));

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <Card className="p-4">
        {showHistory && (
          <div className="mb-3 flex items-center gap-2">
            <ChatHistory
              conversations={conversationsWithCompanyNames}
              currentConversationId={currentConversationId}
              onSelectConversation={setCurrentConversationId}
              onNewConversation={createNewConversation}
              onDeleteConversation={deleteConversation}
            />
            <div className="text-sm text-muted-foreground">
              {currentConversationId ? 
                conversationsWithCompanyNames.find(c => c.id === currentConversationId)?.title || 'Chat' 
                : 'No conversation selected'}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <ScrollArea className="h-64 mb-4 rounded-md border p-3">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}

        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                executeCommand();
              }
            }}
            placeholder={currentConversationId 
              ? "Type or speak to continue the conversation..." 
              : "Start a new conversation by typing or clicking 'New Chat'..."}
            disabled={isProcessing}
            className="flex-1 min-h-[80px] resize-none"
            rows={2}
          />
          <div className="flex flex-col gap-2">
            <Button
              size="icon"
              variant={isListening ? "destructive" : "outline"}
              onClick={toggleListening}
              disabled={isProcessing || !currentConversationId}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              onClick={executeCommand}
              disabled={isProcessing || !command.trim()}
              title="Send message"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
