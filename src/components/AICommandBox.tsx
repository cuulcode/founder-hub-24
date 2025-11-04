import { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';

interface AICommandBoxProps {
  companies: Company[];
  onCommandExecuted: () => void;
}

export const AICommandBox = ({ companies, onCommandExecuted }: AICommandBoxProps) => {
  const [command, setCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState('');
  const { toast } = useToast();
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCommand(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Error",
          description: "Failed to recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [toast]);

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const executeCommand = async () => {
    if (!command.trim()) return;

    setIsProcessing(true);
    setResponse('');

    try {
      // Prepare context for AI
      const context = {
        companies: companies.map(c => ({
          id: c.id,
          name: c.name,
          habits: c.habits.map(h => ({ id: h.id, name: h.name })),
          tasks: c.tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed })),
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
      case 'mark_habit_complete':
        await supabase.from('habit_completions').insert({
          habit_id: args.habitId,
          completed_date: args.date
        });
        break;
      case 'add_task':
        await supabase.from('tasks').insert({
          company_id: args.companyId,
          title: args.title,
          priority: args.priority,
          category: args.category || 'general'
        });
        break;
      case 'add_note':
        await supabase.from('notes').insert({
          company_id: args.companyId,
          content: args.content,
          title: '',
          color: args.color || '#fef3c7'
        });
        break;
      case 'update_task':
        await supabase.from('tasks').update({
          completed: args.completed
        }).eq('id', args.taskId);
        break;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <Card className="p-4">
        <div className="flex gap-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
            placeholder="Ask me to manage your habits, tasks, or notes..."
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            size="icon"
            variant={isListening ? "destructive" : "outline"}
            onClick={toggleListening}
            disabled={isProcessing}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            onClick={executeCommand}
            disabled={isProcessing || !command.trim()}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
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
