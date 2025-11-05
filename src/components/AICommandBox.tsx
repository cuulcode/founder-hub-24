import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';

interface AICommandBoxProps {
  companies: Company[];
  onCommandExecuted: () => void;
  selectedCompanyId?: string;
  showHistory?: boolean;
}

export const AICommandBox = ({ companies, onCommandExecuted, selectedCompanyId, showHistory = true }: AICommandBoxProps) => {
  const [command, setCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState('');
  const { toast } = useToast();
  const [recognition, setRecognition] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    setResponse('');

    try {
      // Prepare context for AI
      const context = {
        selectedCompanyId,
        companies: companies.map(c => ({
          id: c.id,
          name: c.name,
          habits: c.habits.map(h => ({ id: h.id, name: h.name, completedDates: h.completedDates })),
          tasks: c.tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed, priority: t.priority })),
          kanbanItems: c.kanbanItems.map(k => ({ id: k.id, title: k.title, status: k.status })),
          notes: c.notes.map(n => ({ id: n.id, content: n.content.substring(0, 100) }))
        }))
      };

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { type: 'command', text: command, context }
      });

      if (error) throw error;

      setResponse(data.message || 'Command executed successfully');

      // Execute tool calls
      if (data.toolCalls && data.toolCalls.length > 0) {
        for (const toolCall of data.toolCalls) {
          const args = JSON.parse(toolCall.function.arguments);
          await executeToolCall(toolCall.function.name, args);
        }
        onCommandExecuted();
      }

      toast({
        title: "Success",
        description: data.message || "Command executed",
      });

      setCommand('');
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

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <Card className="p-4">
        <div className="flex gap-2 items-start">
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
            placeholder="Type or speak to manage your habits, tasks, notes... (e.g., 'Mark my workout habit as done', 'Add a note about the meeting', 'Create a high priority task for the proposal')"
            disabled={isProcessing}
            className="flex-1 min-h-[120px] resize-none"
            rows={3}
          />
          <div className="flex flex-col gap-2">
            <Button
              size="icon"
              variant={isListening ? "destructive" : "outline"}
              onClick={toggleListening}
              disabled={isProcessing}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              onClick={executeCommand}
              disabled={isProcessing || !command.trim()}
              title="Send command"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {response && (
          <div className="mt-3 p-3 bg-muted rounded-md">
            <p className="text-sm">{response}</p>
          </div>
        )}
      </Card>
    </div>
  );
};
