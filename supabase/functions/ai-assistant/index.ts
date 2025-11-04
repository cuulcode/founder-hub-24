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
      systemPrompt = `You are an advanced AI assistant for a comprehensive project management hub. You have full awareness of the user's habits, tasks, notes, and company projects.

Current context:
${JSON.stringify(context, null, 2)}

CRITICAL INSTRUCTIONS FOR COMMAND INTERPRETATION:
1. Parse natural language with high precision - understand intent even with casual phrasing
2. Handle variations: "mark done", "check off", "complete", "finished" all mean the same
3. Infer missing information intelligently:
   - "today" means current date
   - "workout" or "exercise" should match habit names containing those words
   - Company names can be partial matches if clear
4. For ambiguous commands, make the most reasonable assumption based on context
5. Always use the appropriate tool for the action requested
6. Provide clear confirmation of what was done

Common command patterns to recognize:
- "Mark [habit] as done/complete" → mark_habit_complete
- "Add/Create a note about [topic] for [company]" → add_note
- "Add/Create a [priority] task [description] for [company]" → add_task
- "Complete/Finish [task]" → update_task with completed=true
- "Mark [task] as incomplete/not done" → update_task with completed=false

Be extremely flexible with language variations and always confirm the action taken.`;

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
