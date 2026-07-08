-- Ensure the app roles have the minimum table access needed for RLS to apply.
GRANT SELECT ON public.allowed_emails TO authenticated;
GRANT ALL ON public.allowed_emails TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO authenticated;
GRANT ALL ON public.habits TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_completions TO authenticated;
GRANT ALL ON public.habit_completions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.kanban_items TO authenticated;
GRANT ALL ON public.kanban_items TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dictionary TO authenticated;
GRANT ALL ON public.dictionary TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;

-- Remove anonymous/public table access where user data could be inferred.
REVOKE ALL ON public.allowed_emails FROM anon;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.companies FROM anon;
REVOKE ALL ON public.habits FROM anon;
REVOKE ALL ON public.habit_completions FROM anon;
REVOKE ALL ON public.tasks FROM anon;
REVOKE ALL ON public.kanban_items FROM anon;
REVOKE ALL ON public.notes FROM anon;
REVOKE ALL ON public.dictionary FROM anon;
REVOKE ALL ON public.calendar_events FROM anon;
REVOKE ALL ON public.chat_conversations FROM anon;
REVOKE ALL ON public.chat_messages FROM anon;

-- Helper for validating company ownership from policies.
CREATE OR REPLACE FUNCTION public.user_owns_company(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.companies
    WHERE id = _company_id
      AND user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.user_owns_company(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_owns_company(uuid) TO service_role;

-- Rebuild policies with explicit authenticated-only isolation.
DROP POLICY IF EXISTS "Email whitelist is publicly readable" ON public.allowed_emails;
DROP POLICY IF EXISTS "Authenticated users can view their own allowed email" ON public.allowed_emails;
CREATE POLICY "Authenticated users can view their own allowed email"
ON public.allowed_emails
FOR SELECT
TO authenticated
USING (lower(email) = lower((auth.jwt() ->> 'email'::text)));

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Whitelisted users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Whitelisted users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Whitelisted users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile only" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid() AND public.is_email_allowed(auth.jwt() ->> 'email'::text));
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
CREATE POLICY "Users can delete their own profile only"
ON public.profiles
FOR DELETE
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "Users manage own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can manage their own companies" ON public.companies;
CREATE POLICY "Users can manage their own companies"
ON public.companies
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users manage habits for their companies" ON public.habits;
DROP POLICY IF EXISTS "Users can manage habits for their own companies" ON public.habits;
CREATE POLICY "Users can manage habits for their own companies"
ON public.habits
FOR ALL
TO authenticated
USING (public.user_owns_company(company_id))
WITH CHECK (public.user_owns_company(company_id));

DROP POLICY IF EXISTS "Users manage completions for their habits" ON public.habit_completions;
DROP POLICY IF EXISTS "Users can manage completions for their own habits" ON public.habit_completions;
CREATE POLICY "Users can manage completions for their own habits"
ON public.habit_completions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.habits h
    WHERE h.id = habit_completions.habit_id
      AND public.user_owns_company(h.company_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.habits h
    WHERE h.id = habit_completions.habit_id
      AND public.user_owns_company(h.company_id)
  )
);

DROP POLICY IF EXISTS "Users manage tasks for their companies" ON public.tasks;
DROP POLICY IF EXISTS "Users can manage tasks for their own companies" ON public.tasks;
CREATE POLICY "Users can manage tasks for their own companies"
ON public.tasks
FOR ALL
TO authenticated
USING (public.user_owns_company(company_id))
WITH CHECK (public.user_owns_company(company_id));

DROP POLICY IF EXISTS "Users manage kanban items for their companies" ON public.kanban_items;
DROP POLICY IF EXISTS "Users can manage kanban items for their own companies" ON public.kanban_items;
CREATE POLICY "Users can manage kanban items for their own companies"
ON public.kanban_items
FOR ALL
TO authenticated
USING (public.user_owns_company(company_id))
WITH CHECK (public.user_owns_company(company_id));

DROP POLICY IF EXISTS "Users manage notes for their companies" ON public.notes;
DROP POLICY IF EXISTS "Users can manage notes for their own companies" ON public.notes;
CREATE POLICY "Users can manage notes for their own companies"
ON public.notes
FOR ALL
TO authenticated
USING (public.user_owns_company(company_id))
WITH CHECK (public.user_owns_company(company_id));

DROP POLICY IF EXISTS "Users manage dictionary for their companies" ON public.dictionary;
DROP POLICY IF EXISTS "Users can manage dictionary for their own companies" ON public.dictionary;
CREATE POLICY "Users can manage dictionary for their own companies"
ON public.dictionary
FOR ALL
TO authenticated
USING (public.user_owns_company(company_id))
WITH CHECK (public.user_owns_company(company_id));

DROP POLICY IF EXISTS "Users can view their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can manage their own calendar events" ON public.calendar_events;
CREATE POLICY "Users can manage their own calendar events"
ON public.calendar_events
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND (company_id IS NULL OR public.user_owns_company(company_id))
);

DROP POLICY IF EXISTS "Users manage their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can manage their own conversations" ON public.chat_conversations;
CREATE POLICY "Users can manage their own conversations"
ON public.chat_conversations
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND (company_id IS NULL OR public.user_owns_company(company_id))
);

DROP POLICY IF EXISTS "Users view messages for their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can manage messages in their own conversations" ON public.chat_messages;
CREATE POLICY "Users can manage messages in their own conversations"
ON public.chat_messages
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.chat_conversations c
    WHERE c.id = chat_messages.conversation_id
      AND c.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.chat_conversations c
    WHERE c.id = chat_messages.conversation_id
      AND c.user_id = auth.uid()
  )
);