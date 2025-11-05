import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, text, instruction, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let tools = [];

    if (type === 'enhance') {
      // Text enhancement for sparkle button
      systemPrompt = instruction 
        ? `You are a helpful text editor. Improve the following text based on this instruction: "${instruction}". Return only the improved text, nothing else.`
        : 'You are a helpful text editor. Improve the following text to be clearer and more professional. Return only the improved text, nothing else.';
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        throw new Error('AI gateway error');
      }

      const data = await response.json();
      const enhanced = data.choices[0].message.content;

      return new Response(JSON.stringify({ enhanced }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (type === 'command') {
      // Command execution for AI command box with enhanced understanding
      const currentDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      systemPrompt = `You are the AI assistant for a productivity web app called Founder Hub.

CURRENT CONTEXT:
${JSON.stringify(context, null, 2)}

CURRENT DATE: ${currentDate}
YESTERDAY: ${yesterday}
TOMORROW: ${tomorrow}

YOUR ROLE:
You are a conversational, helpful assistant that helps users manage their companies, tasks, notes, kanban boards, and habits. You can execute commands AND have conversations to help plan, think through ideas, and clarify requirements.

CRITICAL INSTRUCTIONS:

1. PARSING & ENTITIES:
   - Extract: action verbs, item type, titles, descriptions, dates, times, company names, priority, status, habit names
   - Date parsing: "today" = ${currentDate}, "yesterday" = ${yesterday}, "tomorrow" = ${tomorrow}
   - Recognize synonyms: "tick/check/mark/complete" all mean complete, "kanban/board/backlog" refer to kanban items

2. MODULE MAPPING:
   - Tasks: Regular to-do items with priority (low/medium/high)
   - Kanban: Items with status (icebox/in-progress/done) for project management
   - Notes: Free-form text notes with colors
   - Habits: Recurring activities tracked by completion dates

3. KANBAN VS TASKS DISTINCTION:
   - Keywords "kanban", "board", "icebox", "in-progress", "done", "backlog" → use kanban tools
   - Keywords "task", "todo", "to-do" → use task tools
   - If user says "incomplete task", "backlog item", or mentions "icebox" → add_kanban_item with status 'icebox'

4. COMPANY CONTEXT:
   - If selectedCompanyId is provided in context, default to that company
   - If company is explicitly mentioned (e.g., "for Exchange AI", "Polygon Batteries"), use that company's ID
   - If no company mentioned and no selected company, ASK: "Which company is this for?" and list available companies
   - Match company names fuzzy: "exchange", "axchange", "Exchange AI" all match the same company

5. HABIT COMPLETIONS:
   - When user says "tick/mark/check [habit] today/yesterday/tomorrow", call mark_habit_complete with correct date
   - Find habit by fuzzy name matching within the target company
   - If habit not found, ask: "I couldn't find a habit named '[name]'. Did you mean [closest match]?"

6. CONVERSATIONAL MODE:
   - If user asks open questions like "what should I do today?" or "help me plan", respond conversationally
   - Provide suggestions, ask clarifying questions, help think through priorities
   - Don't always call tools - sometimes just chat and help plan
   - Be friendly, concise, and helpful

7. TOOL CALLS:
   - ALWAYS use tools to execute actions (add, update, delete, complete)
   - For ambiguous commands, ask ONE clarifying question before acting
   - Return brief confirmation after tool execution

8. ERROR HANDLING:
   - If you can't find an item, suggest the closest match
   - If information is missing, ask specifically what's needed
   - Never fail silently - always respond with what happened

COMMON PATTERNS:
- "Add task to drink water" → add_task
- "Add icebox item for new feature" → add_kanban_item (status: icebox)
- "Move X to in-progress" → update_kanban_item (status: in-progress)
- "Tick running habit today" → mark_habit_complete (date: ${currentDate})
- "Create note about meeting" → add_note
- "What should I focus on?" → conversational response analyzing their tasks/kanban
- "Complete task X" → update_task (completed: true)

Respond naturally and helpfully. Execute tools when actions are needed, converse when planning is needed.`;

      tools = [
        {
          type: 'function',
          function: {
            name: 'mark_habit_complete',
            description: 'Mark a habit as complete for a specific date',
            parameters: {
              type: 'object',
              properties: {
                habitId: { type: 'string', description: 'The habit ID' },
                date: { type: 'string', description: 'The date in YYYY-MM-DD format' }
              },
              required: ['habitId', 'date'],
              additionalProperties: false
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'add_task',
            description: 'Add a new task to a company',
            parameters: {
              type: 'object',
              properties: {
                companyId: { type: 'string' },
                title: { type: 'string' },
                priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                category: { type: 'string' }
              },
              required: ['companyId', 'title', 'priority'],
              additionalProperties: false
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'add_note',
            description: 'Add a new note to a company',
            parameters: {
              type: 'object',
              properties: {
                companyId: { type: 'string' },
                content: { type: 'string' },
                color: { type: 'string', enum: ['#fef3c7', '#fce7f3', '#dbeafe', '#d1fae5', '#e9d5ff'] }
              },
              required: ['companyId', 'content'],
              additionalProperties: false
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'update_task',
            description: 'Update a task (mark complete/incomplete)',
            parameters: {
              type: 'object',
              properties: {
                taskId: { type: 'string' },
                completed: { type: 'boolean' }
              },
              required: ['taskId', 'completed'],
              additionalProperties: false
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'add_kanban_item',
            description: 'Add a new item to the kanban board',
            parameters: {
              type: 'object',
              properties: {
                companyId: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                status: { type: 'string', enum: ['icebox', 'in-progress', 'done'] }
              },
              required: ['companyId', 'title', 'status'],
              additionalProperties: false
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'update_kanban_item',
            description: 'Update a kanban item (change status or details)',
            parameters: {
              type: 'object',
              properties: {
                itemId: { type: 'string' },
                status: { type: 'string', enum: ['icebox', 'in-progress', 'done'] },
                title: { type: 'string' },
                description: { type: 'string' }
              },
              required: ['itemId'],
              additionalProperties: false
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'delete_kanban_item',
            description: 'Delete a kanban item',
            parameters: {
              type: 'object',
              properties: {
                itemId: { type: 'string' }
              },
              required: ['itemId'],
              additionalProperties: false
            }
          }
        }
      ];

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          tools: tools,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        throw new Error('AI gateway error');
      }

      const data = await response.json();
      const message = data.choices[0].message;
      
      return new Response(JSON.stringify({ 
        message: message.content,
        toolCalls: message.tool_calls || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid request type');
  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
