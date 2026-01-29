
# Plan: Fix Bugs and Add Small Improvements

## Summary
Based on my analysis of your codebase, I found several issues that need fixing while keeping everything that's currently working intact.

## Issues Found

1. **Kanban "drag-and-drop" not persisting** - The Move buttons work but data might not refresh immediately
2. **Daily calendar habits can't be toggled** - Habits display in the calendar popup but clicking doesn't do anything
3. **Habit editing works on company pages but not Dashboard** - The Dashboard only shows the calendar, not the editable Weekly Habit Tracker
4. **Voice input requires existing conversation** - Mic button is disabled until you manually create a chat first

## Fixes to Implement

### 1. Kanban Persistence Fix
- Add proper data refresh after Kanban status updates
- Ensure the "Move" button updates persist immediately by calling the refresh function

### 2. Calendar Day View - Enable Habit Toggling
- Add click-to-toggle functionality for habits in the calendar day dialog
- Show a clickable checkbox that marks habits complete/incomplete for that specific date

### 3. Dashboard Weekly Habit Tracker
- Add the Weekly Habit Tracker component to the Dashboard (below the calendar)
- Pass editing and delete capabilities so habits can be managed from the Dashboard too

### 4. Voice Input for New Conversations
- Remove the requirement to have an existing conversation before using voice
- Auto-create a conversation when voice input starts (just like typing does)

### 5. Small UI Improvements
- Make habit checkmarks in calendar clickable with visual feedback
- Better disabled state messaging for the command box

## Technical Details

**Files to modify:**
- `src/components/EnhancedCalendar.tsx` - Add habit toggle functionality to day dialog
- `src/pages/Dashboard.tsx` - Add Weekly Habit Tracker with edit/delete props
- `src/components/AICommandBox.tsx` - Enable voice for new conversations
- `src/pages/CompanyDetail.tsx` - Ensure Kanban updates trigger data refresh

**No breaking changes:**
- All existing functionality will remain intact
- Only additive changes to enable missing features
- Chat history, dictionary, notes, tasks all continue working as-is
