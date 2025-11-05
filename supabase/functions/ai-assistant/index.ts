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
      systemPrompt = `You are the assistant for a productivity web app.\n\nAvoid altering per-field AI buttons or their logic.\n\nCurrent context:\n${JSON.stringify(context, null, 2)}\n\nCRITICAL INSTRUCTIONS FOR COMMAND INTERPRETATION:\n1. Parse natural language with high precision — extract intent and entities (action verbs, item type, titles, dates, times, time zones, recurrence, company names, tags, priority, habit names).\n2. Map the intent to one of these modules: task, note, habit tracker.\n3. ALWAYS return function tool calls using the defined tools to perform actions. Do not merely describe actions.\n4. If information is missing, infer sensible defaults (e.g., “today”) or ask a concise follow‑up question, but still call a tool when safe.\n5. Normalize dates to ISO format YYYY-MM-DD. Interpret phrases like “today”, “tomorrow”, “next week”.\n6. For edit/update/delete/complete/undo commands, find the best match using fuzzy matching against existing items in the provided context.\n7. If multiple companies are mentioned, call tools for each; if none is mentioned, default to the currently selected or most relevant company in context.\n\nCommon command patterns to recognize and the tool to call:\n- “Add/Create a [priority] task [description] for [company]” → add_task\n- “Create/Save note [content] for [company]” → add_note\n- “Complete/Finish/Mark done [task]” → update_task with completed=true\n- “Undo/Mark incomplete/Not done [task]” → update_task with completed=false\n- “Mark/Check/Tick [habit] today” → mark_habit_complete\n\nRespond with a very brief confirmation message AND function tool calls. If action is ambiguous, ask one short clarifying question.`;

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
