-- Add color fields to habits table
ALTER TABLE public.habits 
ADD COLUMN color text DEFAULT NULL;

-- Create dictionary table
CREATE TABLE public.dictionary (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  word text NOT NULL,
  definition text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for dictionary
ALTER TABLE public.dictionary ENABLE ROW LEVEL SECURITY;

-- Create policy for dictionary
CREATE POLICY "Users manage dictionary for their companies"
ON public.dictionary
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = dictionary.company_id
    AND companies.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = dictionary.company_id
    AND companies.user_id = auth.uid()
  )
);

-- Create trigger for dictionary updated_at
CREATE TRIGGER update_dictionary_updated_at
BEFORE UPDATE ON public.dictionary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'New Chat',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for chat_conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Create policy for chat_conversations
CREATE POLICY "Users manage their own conversations"
ON public.chat_conversations
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create trigger for chat_conversations updated_at
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for chat_messages
CREATE POLICY "Users view messages for their conversations"
ON public.chat_messages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND chat_conversations.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND chat_conversations.user_id = auth.uid()
  )
);