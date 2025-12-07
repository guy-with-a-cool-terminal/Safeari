# 🚨 Critical Fix: 1-Day Filter Backend Bug

## Problem Statement

**The Issue:**
The 1d (1-day) time range filter consistently fails to return new queries from the backend API. This causes users to see empty analytics dashboards even when they have recent activity.

**User Impact:**
- Users set up DNS, generate queries, but see "no activity" message
- Analytics appear broken (no data shown)
- Users think Safeari isn't working
- Extremely poor first-run experience

**Root Cause:**
Backend bug affecting the 1d filter specifically. The 7d (7-day) and 30d filters work reliably.

---

## Solution Implemented

### 1. Changed Default Time Range
**File:** `src/pages/AnalyticsDashboard.tsx:64`

```tsx
// BEFORE (broken):
const [timeRange, setTimeRange] = useState("1d");

// AFTER (fixed):
const [timeRange, setTimeRange] = useState("7d"); // Now users see data!
```

**Why This Works:**
- 7d filter is reliable and consistently returns data
- Users now see their analytics on first load
- DNS setup confirmation works immediately

---

### 2. Added Intelligent Error Handling
**File:** `src/pages/AnalyticsDashboard.tsx:112-127`

```tsx
// Check for query errors (but only if no cached data available)
const hasErrors =
  (overviewQuery.isError && !overviewQuery.data) ||
  (domainsQuery.isError && !domainsQuery.data) ||
  // ... other queries

// Show helpful error message if user manually selects 1d
useEffect(() => {
  if (hasErrors && timeRange === '1d') {
    toast({
      variant: "destructive",
      title: "1-Day filter not responding",
      description: "Try the 7-day filter - there's a known issue with 1-day data we're investigating.",
      duration: 6000,
    });
  }
}, [hasErrors, timeRange]);
```

**What This Does:**
- Detects when queries fail
- Shows cached data if available (graceful degradation)
- Displays helpful message specifically for 1d failures
- Suggests switching to 7d filter
- Auto-retries in background (React Query's built-in retry logic)

---

### 3. React Query Retry Logic
**File:** `src/lib/queryClient.ts:16-47`

React Query automatically retries failed requests with exponential backoff:
- **Retry 1:** Immediate (0s delay)
- **Retry 2:** After 1s
- **Retry 3:** After 2s
- **Retry 4:** After 4s (max 30s)

This helps with transient failures, but won't fix the persistent 1d bug.

---

## How It Works Now

### Scenario 1: New User Sets Up DNS
**Before Fix:**
1. User sets up DNS
2. Generates queries
3. Opens Analytics Dashboard
4. Sees "Waiting for first activity..." (1d filter fails)
5. User thinks it's broken 😞

**After Fix:**
1. User sets up DNS
2. Generates queries
3. Opens Analytics Dashboard
4. Sees 7-day analytics with data ✅
5. User confirms DNS is working! 🎉

### Scenario 2: User Manually Selects 1d Filter
**Before Fix:**
1. User clicks "1 Day" button
2. Page shows empty state or error
3. Confusing experience

**After Fix:**
1. User clicks "1 Day" button
2. React Query tries to fetch (3 retries)
3. If cached 1d data exists: Shows it
4. If no cache: Shows error toast suggesting 7d
5. User switches to 7d and sees data

### Scenario 3: Navigating Between Pages
**Before Fix:**
1. Navigate to Analytics (1d fails → skeleton spam)
2. Navigate to Parental Controls
3. Navigate back to Analytics (1d fails again → skeleton spam)
4. Never see cached data

**After Fix:**
1. Navigate to Analytics (7d succeeds → shows data)
2. Navigate to Parental Controls
3. Navigate back to Analytics (instant load from cache ✅)
4. Background refresh happens silently

---

## Files Changed

### Modified:
1. **`src/pages/AnalyticsDashboard.tsx`**
   - Line 1: Added `useEffect` import
   - Line 64: Changed default from "1d" to "7d"
   - Lines 61-63: Added comment explaining workaround
   - Lines 103-127: Added error detection and user-friendly messaging

2. **`src/lib/queryClient.ts`**
   - Lines 13-14: Added documentation about 7d default

3. **`TANSTACK_QUERY_IMPLEMENTATION.md`**
   - Added "Critical Fix" section documenting the issue

---

## Testing Instructions

### Test 1: First Load (Most Important)
1. Clear cache (Ctrl+Shift+Delete)
2. Navigate to Analytics Dashboard
3. ✅ **EXPECTED:** Page defaults to "7 Day" button selected
4. ✅ **EXPECTED:** Data loads successfully (no empty state)

### Test 2: 1d Filter Fallback
1. On Analytics Dashboard, click "1 Day" button
2. Wait for loading
3. ✅ **EXPECTED:** If 1d fails:
   - Shows cached 1d data if available, OR
   - Shows error toast: "1-Day filter not responding, try 7-day filter"
   - Auto-retries in background (visible in DevTools)

### Test 3: Navigation Caching
1. Load Analytics (7d shows data)
2. Navigate to Parental Controls
3. Navigate back to Analytics
4. ✅ **EXPECTED:** Instant load (no skeleton, shows cached 7d data)

### Test 4: DNS Setup Confirmation
1. Set up a new profile's DNS
2. Generate some queries (visit websites)
3. Open Analytics Dashboard
4. ✅ **EXPECTED:** See activity immediately (7d filter shows recent data)

---

## Monitoring & Next Steps

### For Backend Team
**Backend bug to investigate:**
- Endpoint: `GET /api/v1/analytics/{profileId}/overview/?time_range=1d`
- Issue: Returns empty data or errors for new queries
- Works for: 7d, 30d, 90d time ranges
- **Hypothesis: TIMEZONE MISMATCH (Kenyan Time vs UTC)**

**Timezone Discovery:**
- User confirmed logs show **Kenyan local time** (EAT - UTC+3)
- Backend likely expects UTC timestamps
- 1d filter calculates "last 24 hours" from current UTC time
- If backend is in UTC but frontend sends Kenyan time (or vice versa):
  - "Today" in Kenya (12:00 PM EAT) = "Today" 09:00 AM UTC
  - 1d filter looks for data from "09:00 AM UTC yesterday to 09:00 AM UTC today"
  - Actual data exists from "09:00 AM EAT yesterday to 09:00 AM EAT today"
  - **Result: 3-hour mismatch causes 1d filter to miss recent queries**

**Why 7d works:**
- 7-day range has enough buffer to absorb 3-hour timezone offset
- Data from "past 7 days in Kenyan time" overlaps with "past 7 days in UTC"

**Recommended Fix:**
1. Ensure all timestamps are normalized to UTC in backend
2. Frontend should send timezone-aware requests or UTC timestamps
3. Add timezone parameter to analytics endpoints: `?time_range=1d&timezone=Africa/Nairobi`
4. Backend should adjust query window based on user's timezone

### For Frontend Team
**When backend fixes 1d:**
1. Test that 1d filter works reliably
2. Consider switching default back to "1d" (but keep 7d as safe fallback)
3. Remove error toast workaround (or make it generic)
4. Keep React Query retry logic (still valuable)

### Metrics to Monitor
- **1d query failure rate** - Should drop to 0% when backend fixed
- **User engagement with time filters** - Are users trying 1d? Sticking with 7d?
- **Empty state views** - Should be rare now (only for truly inactive profiles)
- **React Query cache hit rate** - Should be high for navigation between pages

---

## Summary

**Problem:** 1d filter fails → users see no analytics → poor UX

**Solution:** Default to 7d → users see analytics → good UX

**Backup Plan:** React Query caching + retry logic + helpful error messages

**Result:** Users now see their analytics data reliably, even with backend bug

---

**Status:** ✅ Deployed and tested
**Last Updated:** 2025-11-24
**Tracking Issue:** Backend team investigating 1d filter bug
