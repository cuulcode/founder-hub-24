import { useState, useRef } from 'react';
import { Sparkles, Check, X, RotateCw, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIEnhancedInputProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'input' | 'textarea';
  placeholder?: string;
  className?: string;
}

export const AIEnhancedInput = ({ value, onChange, type = 'input', placeholder, className }: AIEnhancedInputProps) => {
  const [showPanel, setShowPanel] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const { toast } = useToast();

  const enhanceText = async () => {
    if (!value.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { type: 'enhance', text: value, instruction: instruction.trim() }
      });

      if (error) throw error;

      setSuggestion(data.enhanced);
      setShowPanel(true);
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enhance text",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    const newHistory = [...history.slice(0, historyIndex + 1), suggestion];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onChange(suggestion);
    setShowPanel(false);
    setSuggestion('');
    setInstruction('');
  };

  const handleDecline = () => {
    setShowPanel(false);
    setSuggestion('');
    setInstruction('');
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const InputComponent = type === 'textarea' ? Textarea : Input;

  return (
    <div className="relative w-full">
      <div className="flex gap-2 items-start">
        <InputComponent
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            const newHistory = [...history.slice(0, historyIndex + 1), newValue];
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
            onChange(newValue);
          }}
          placeholder={placeholder}
          className={className}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={enhanceText}
          disabled={isLoading}
          className="shrink-0"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>

      {showPanel && (
        <Card className="absolute z-50 mt-2 p-4 w-full border shadow-lg">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">AI Suggestion:</label>
              <p className="mt-1 text-sm text-muted-foreground">{suggestion}</p>
            </div>
            <Input
              placeholder="Optional: Add instruction for enhancement"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="text-sm"
            />
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={handleAccept}>
                <Check className="h-3 w-3 mr-1" />
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={handleDecline}>
                <X className="h-3 w-3 mr-1" />
                Decline
              </Button>
              <Button size="sm" variant="outline" onClick={enhanceText} disabled={isLoading}>
                <RotateCw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleUndo}
                disabled={historyIndex === 0}
              >
                <Undo className="h-3 w-3 mr-1" />
                Undo
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
              >
                <Redo className="h-3 w-3 mr-1" />
                Redo
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
