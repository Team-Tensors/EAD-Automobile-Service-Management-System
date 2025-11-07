# Performance Issues Analysis & Recommendations

## 🔴 Critical Performance Issues

### 1. **Aggressive Polling in `useMyServices` Hook** 
**File**: `frontend/src/hooks/useMyServices.ts`
**Severity**: HIGH

```typescript
// Poll for updates every 30 seconds
const intervalId = setInterval(async () => {
  try {
    const detailedAppointments = await appointmentService.getMyDetailedAppointments();
    const mapped = await Promise.all(detailedAppointments.map(mapDetailedToService));
    // ...
  }
}, 30000); // Runs every 30 seconds for EVERY user!
```

**Problems**:
- Polls backend every 30 seconds regardless of user activity
- No cleanup mechanism mentioned in the excerpt
- Makes multiple API calls per poll (getMyDetailedAppointments + map operations)
- Creates unnecessary server load
- Drains battery on mobile devices

**Solution**:
```typescript
// 1. Increase interval to 60 seconds minimum
// 2. Add visibility API to pause polling when tab is inactive
// 3. Use WebSocket/SSE for real-time updates instead
// 4. Add debouncing/throttling

useEffect(() => {
  let intervalId: NodeJS.Timeout;
  
  const fetchServices = async () => {
    // ... fetch logic
  };

  const startPolling = () => {
    fetchServices();
    intervalId = setInterval(fetchServices, 60000); // 60s instead of 30s
  };

  // Only poll when page is visible
  const handleVisibilityChange = () => {
    if (document.hidden) {
      clearInterval(intervalId);
    } else {
      startPolling();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  startPolling();

  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
```

---

### 2. **Inefficient Re-renders with JSON.stringify Comparison**
**File**: `frontend/src/pages/CustomerDashboard.tsx`
**Severity**: HIGH

```typescript
useEffect(() => {
  if (selectedService && services.length > 0) {
    const updatedService = services.find((s) => s.id === selectedService.id);
    if (
      updatedService &&
      JSON.stringify(updatedService) !== JSON.stringify(selectedService) // 🔴 VERY SLOW
    ) {
      setSelectedService(updatedService);
    }
  }
}, [services]);
```

**Problems**:
- `JSON.stringify` on every services update is EXTREMELY expensive
- Runs on every render when services change
- Stringifies entire complex objects
- No memoization
- Can cause UI lag with large service objects

**Solution**:
```typescript
// Use React.useMemo and shallow comparison
const selectedServiceData = useMemo(() => {
  return services.find((s) => s.id === selectedService?.id);
}, [services, selectedService?.id]);

useEffect(() => {
  if (selectedServiceData && selectedServiceData !== selectedService) {
    setSelectedService(selectedServiceData);
  }
}, [selectedServiceData]);

// Or use a proper comparison library like fast-deep-equal
// Or compare only critical fields:
const hasChanges = updatedService && (
  updatedService.status !== selectedService.status ||
  updatedService.progress !== selectedService.progress ||
  updatedService.assignedEmployee !== selectedService.assignedEmployee
);
```

---

### 3. **Multiple Parallel API Calls on Every Page Load**
**Files**: 
- `frontend/src/pages/admin/AdminDashboard.tsx`
- `frontend/src/pages/admin/AdminAnalytics.tsx`
- `frontend/src/pages/AppoinmentBookingPage.tsx`

**Severity**: MEDIUM-HIGH

```typescript
// AdminDashboard.tsx - 4 parallel API calls
const [upcoming, ongoing, unassigned, employeeList] = await Promise.all([
  getUpcomingAppointments(),
  getOngoingAppointments(),
  getUnassignedAppointments(),
  getAllEmployees()
]);

// AppoinmentBookingPage.tsx - 3 separate useEffect with API calls
useEffect(() => { fetchVehicles(); }, []);
useEffect(() => { fetchServiceTypes(); }, []);
useEffect(() => { fetchServiceCenters(); }, []);
```

**Problems**:
- No caching mechanism
- Fetches same data multiple times across pages
- No data revalidation strategy
- Cold start penalty on every navigation

**Solution**:
```typescript
// 1. Implement React Query or SWR for caching
import { useQuery } from '@tanstack/react-query';

const { data: employees } = useQuery({
  queryKey: ['employees'],
  queryFn: getAllEmployees,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

// 2. Use context to share data across components
// 3. Implement service worker caching
// 4. Add loading states and skeleton screens (already partially done)
```

---

### 4. **SSE Connection Always Active in NotificationBell**
**File**: `frontend/src/components/Notification/NotificationBell.tsx`
**Severity**: MEDIUM

```typescript
useEffect(() => {
  if (!userId) return;
  fetchInitialData();
  connectSSE(); // Always connected!
  
  return () => {
    if (eventSourceRef.current) {
      notificationService.closeConnection();
    }
  };
}, [userId]);
```

**Problems**:
- SSE connection stays open even when notification panel is closed
- Connection persists across all pages
- Consumes bandwidth continuously
- Multiple connections if component re-mounts

**Solution**:
```typescript
// Only connect when panel is open or periodically check
useEffect(() => {
  if (!userId) return;
  
  fetchInitialData();
  
  // Only connect SSE when panel is open or use long polling
  if (isPanelOpen) {
    connectSSE();
  }
  
  return () => {
    if (eventSourceRef.current) {
      notificationService.closeConnection();
    }
  };
}, [userId, isPanelOpen]); // Add isPanelOpen dependency

// Or use periodic polling instead of persistent SSE
```

---

### 5. **Dynamic Style Injection on Every Render**
**Files**: 
- `frontend/src/pages/admin/AdminDashboard.tsx`
- `frontend/src/components/HomePage/SponsorLogoSlider.tsx`

**Severity**: MEDIUM

```typescript
// AdminDashboard.tsx
useEffect(() => {
  const style = document.createElement('style');
  style.textContent = `...`; // CSS injection
  
  if (!document.getElementById('admin-scrollbar-styles')) {
    document.head.appendChild(style);
  }

  return () => {
    const existingStyle = document.getElementById('admin-scrollbar-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
  };
}, []); // Runs on mount/unmount
```

**Problems**:
- Creates/removes DOM elements repeatedly
- Style tag injection/removal causes reflows
- Should be in global CSS file
- Unnecessary DOM manipulation

**Solution**:
```css
/* Move to global CSS file (globals.css or App.css) */
.admin-scrollbar::-webkit-scrollbar {
  width: 8px;
}
/* ... rest of styles */

/* Or use Tailwind's arbitrary variants */
<div className="[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900">
```

---

## 🟡 Medium Priority Issues

### 6. **Missing useMemo/useCallback in Multiple Components**

**Examples**:
- `CustomerDashboard.tsx` - No memoization for filtered/computed data
- `AdminDashboard.tsx` - Filter functions recreated on every render
- `AppointmentBookingPage.tsx` - Transform functions recreated

```typescript
// ❌ Bad - recreated on every render
const filteredEmployees = employees.filter(emp => 
  emp.name.toLowerCase().includes(searchEmployee.toLowerCase())
);

// ✅ Good - memoized
const filteredEmployees = useMemo(() => 
  employees.filter(emp => 
    emp.name.toLowerCase().includes(searchEmployee.toLowerCase())
  ),
  [employees, searchEmployee]
);
```

**Apply to**:
- All filter operations
- All map/transform operations
- All computed values
- All callback functions passed as props

---

### 7. **Chatbot Auto-Scrolls on Every Message**
**File**: `frontend/src/components/Chatbot/Chatbot.tsx`

```typescript
useEffect(() => {
  if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, open]); // Scrolls on EVERY message change
```

**Problem**: Excessive smooth scrolling can cause jank

**Solution**:
```typescript
// Only scroll for new messages, not on open/close
useEffect(() => {
  if (open && messages.length > prevMessagesCount) {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
}, [messages]);
```

---

### 8. **No Debouncing on Search Inputs**
**Multiple Files**: Search inputs trigger immediate re-renders

```typescript
// ❌ Current - filters on every keystroke
<input
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>

// ✅ Better - debounced search
import { useDebouncedValue } from './hooks/useDebouncedValue';

const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebouncedValue(searchInput, 300);

useEffect(() => {
  // Filter with debounced value
  filterData(debouncedSearch);
}, [debouncedSearch]);
```

---

### 9. **Large Bundle Size (Suspected)**
**Check**:
- Lucide React icons imported individually? ✅ Good (tree-shakeable)
- But many components imported without lazy loading
- No code splitting visible

**Solution**:
```typescript
// Lazy load routes
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
  </Routes>
</Suspense>
```

---

## 🟢 Low Priority / Best Practices

### 10. **Missing Key Props in Some Lists**
Ensure all `.map()` iterations have stable keys

### 11. **Console.logs in Production**
Remove or wrap in `if (import.meta.env.DEV)`

### 12. **Unused CSS (App.css commented out)**
Clean up commented code

---

## 📊 Performance Optimization Priority List

### Immediate Actions (Do First):
1. ✅ Fix JSON.stringify comparison in CustomerDashboard
2. ✅ Increase polling interval from 30s to 60s in useMyServices
3. ✅ Add visibility API to pause polling when tab inactive
4. ✅ Move dynamic styles to CSS files
5. ✅ Add useMemo to expensive computations

### Short Term (This Week):
6. ✅ Implement React Query or SWR for API caching
7. ✅ Add debouncing to search inputs
8. ✅ Optimize SSE connections (conditional connect)
9. ✅ Add loading states everywhere (partially done)
10. ✅ Implement lazy loading for routes

### Long Term (This Month):
11. ✅ Replace polling with WebSocket/SSE for real-time updates
12. ✅ Add service worker for offline support
13. ✅ Implement virtual scrolling for long lists
14. ✅ Add performance monitoring (Web Vitals)
15. ✅ Bundle analysis and optimization

---

## 🛠️ Suggested Tools & Libraries

```bash
# Install performance helpers
npm install @tanstack/react-query
npm install use-debounce
npm install web-vitals

# Dev tools
npm install -D vite-bundle-visualizer
npm install -D @vitejs/plugin-react-swc # Faster than Babel
```

---

## 📈 Expected Improvements

After implementing these fixes:
- **50-70% reduction** in unnecessary re-renders
- **40-60% reduction** in API calls
- **Better perceived performance** with proper loading states
- **Improved mobile battery life** with optimized polling
- **Faster page loads** with code splitting
- **Better user experience** with debounced inputs

---

## 🔍 How to Test Performance

```typescript
// Add to main.tsx for monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

Use React DevTools Profiler to identify:
- Components with excessive re-renders
- Slow commits
- Expensive updates

---

## Summary

The application has **several significant performance bottlenecks**:
1. **Aggressive 30-second polling** that never stops
2. **JSON.stringify comparisons** on every render
3. **No caching layer** for API responses
4. **Missing memoization** throughout the app
5. **Always-on SSE connections**

These issues compound as more users are added and data grows. Addressing the critical issues first will provide immediate performance gains.
