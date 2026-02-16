# Modern Pagination & Sorting UI Guide

## 📍 Where to Change Sorting Order

### **Option 1: Visual Sorting Controls (NEW!)**

Both **Certificates** and **Workspace (My Requests)** pages now have modern sorting controls:

#### **Location:** Below the search bar in each page

**Controls Available:**
1. **Sort By Dropdown** - Select which field to sort by:
   - ID
   - Certificate Name  
   - Common Name
   - Valid From
   - Valid To
   - Created Date
   - Issuer

2. **Order Toggle Buttons** - Choose sort direction:
   - **Ascending** button (↑) - A to Z, oldest to newest
   - **Descending** button (↓) - Z to A, newest to oldest

The active sort order is **highlighted** with the default button style.

---

### **Option 2: Programmatic Defaults**

To change the **default** sorting for all pages:

**File:** `src/pages/Certificates.tsx` (line ~24)
```typescript
const [sortBy, setSortBy] = useState("id");          // ← Change field here
const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");  // ← Change order here
```

**File:** `src/pages/Workspace.tsx` (line ~24)
```typescript
const [sortBy, setSortBy] = useState("createdAt");   // ← Change field here
const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");  // ← Change order here
```

**File:** `src/pages/NetworkScan.tsx` (line ~60)
```typescript
const [sortBy, setSortBy] = useState("id");          // ← Change field here
const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");  // ← Change order here
```

---

## 🎨 Professional Pagination Features

### **Modern UI Components**

#### **1. DataTablePagination Component**
**Location:** `src/components/ui/data-table-pagination.tsx`

**Features:**
- ✅ **Results Counter** - "Showing 1 to 10 of 23 results"
- ✅ **Page Size Selector** - Choose 10, 20, 30, 50, or 100 items per page
- ✅ **Page Indicator** - "Page 1 of 3"
- ✅ **Navigation Buttons:**
  - `⏪` First page (desktop only)
  - `◀` Previous page
  - `▶` Next page
  - `⏩` Last page (desktop only)
- ✅ **Smart Disable States** - Buttons auto-disable when at first/last page
- ✅ **Auto Reset** - Changing page size resets to page 1

#### **2. SearchBar Component**
**Location:** `src/components/ui/search-bar.tsx`

**Features:**
- ✅ **Debounced Input** - 300ms delay to reduce API calls
- ✅ **Clear Button** - Quick reset with X icon
- ✅ **Loading State** - Shows when searching
- ✅ **Keyboard Accessible** - Full keyboard navigation
- ✅ **Auto Reset Page** - Returns to page 1 when searching

#### **3. Sorting Controls** (NEW!)

**Features:**
- ✅ **Visual Feedback** - Active sort order highlighted
- ✅ **Quick Toggle** - One click to change direction
- ✅ **Field Selection** - Dropdown to choose sort field
- ✅ **Smart Reset** - Returns to page 1 when sorting changes
- ✅ **Persistent State** - Remembers last selection

---

## 📊 Pagination Settings

### **Default Settings (NEW!)**

All pages now use these modern defaults:

| Setting | Value | Rationale |
|---------|-------|-----------|
| **Page Size** | 10 items | Faster loading, better mobile UX |
| **Sort Order** | ASC (Ascending) | Intuitive A→Z, Old→New ordering |
| **Sort Field** | `id` or `createdAt` | Consistent chronological view |

### **Available Page Sizes**

Users can choose from: **10, 20, 30, 50, 100** items per page

To customize available sizes, edit:
```typescript
// File: src/components/ui/data-table-pagination.tsx (line ~43)
{[10, 20, 30, 50, 100].map((size) => (
  <SelectItem key={size} value={`${size}`}>
    {size}
  </SelectItem>
))}
```

---

## 🔧 Customization Guide

### **Change Default Page Size**

Edit the `useState` initialization:
```typescript
const [pageSize, setPageSize] = useState(10);  // ← Change from 10 to your preference
```

### **Change Available Sort Fields**

Edit the Select component in your page:
```typescript
<SelectContent>
  <SelectItem value="id">ID</SelectItem>
  <SelectItem value="customField">My Custom Field</SelectItem>  {/* ← Add new field */}
  <SelectItem value="anotherField">Another Field</SelectItem>   {/* ← Add another */}
</SelectContent>
```

### **Change Sort Button Labels**

Edit the Button components:
```typescript
<Button variant={sortOrder === "ASC" ? "default" : "outline"}>
  <ArrowUp className="h-4 w-4 mr-1" />
  A → Z  {/* ← Change label */}
</Button>
```

### **Add More Filters**

Add a new FilterSelect component:
```typescript
<FilterSelect
  label="My Filter"
  value={myFilter}
  options={[
    { label: "Option 1", value: "opt1" },
    { label: "Option 2", value: "opt2" },
  ]}
  onChange={(value) => {
    setMyFilter(value);
    setCurrentPage(0);
  }}
  placeholder="Select option"
/>
```

---

## 📱 Responsive Design

The pagination UI is **fully responsive**:

### **Desktop (>1024px)**
- Full controls visible
- First/Last page buttons shown
- Side-by-side sort controls

### **Tablet (768px - 1024px)**
- First/Last buttons hidden
- Sort controls stack vertically
- All functionality preserved

### **Mobile (<768px)**
- Compact layout
- Essential controls only
- Touch-optimized buttons

---

## 🎯 User Experience Features

### **Auto-Reset Behavior**
When users change:
- **Search query** → Resets to page 1
- **Filters** → Resets to page 1
- **Sort field/order** → Resets to page 1
- **Page size** → Resets to page 1

This prevents showing "Page 5 of 2" scenarios.

### **Loading States**
- Spinner shows during data fetching
- Buttons disabled while loading
- Smooth transitions

### **Empty States**
- Contextual messages based on filters
- Helpful suggestions
- Call-to-action buttons

---

## 🚀 Pages with Modern Pagination

| Page | Route | Status | Features |
|------|-------|--------|----------|
| **Certificates** | `/certificates` | ✅ Complete | Search, Filter, Sort, Paginate |
| **My Requests** | `/workspace/my-request` | ✅ Complete | Search, Sort, Paginate |
| **Network Scan** | `/network-scan` | ✅ Complete | Search, Filter, Sort, Paginate (Tabs) |
| Jobs | `/jobs` | ⏳ Pending | API ready |
| Discovery | `/discovery` | ⏳ Pending | API ready |
| Sessions | `/sessions` | ⏳ Pending | API ready |
| Alerts | `/alerts` | ⏳ Pending | API ready |
| Users | `/users` | ⏳ Pending | Needs API update |
| Roles | `/roles` | ⏳ Pending | Needs API update |

---

## 💡 Best Practices

1. **Always reset page to 0** when changing filters/search/sort
2. **Show total count** in descriptions for transparency
3. **Provide visual feedback** for active sort order
4. **Use debouncing** for search to reduce API calls
5. **Handle empty states** gracefully with helpful messages
6. **Disable buttons** when actions aren't available
7. **Keep UI consistent** across all pages

---

## 🐛 Troubleshooting

### **Sorting not working?**
- Check if `sortBy` and `sortOrder` are in the `useEffect` dependency array
- Verify API client receives parameters: `buildQueryParams()` should include them
- Check console logs: `[API] Calling /api/... with query:`

### **Pagination not showing?**
- Ensure `totalPages > 1` or use `DataTablePagination` which handles this
- Check if data extraction is correct: `response.content`
- Verify backend returns `PageImpl` format

### **Search not triggering?**
- SearchBar has 300ms debounce - wait slightly
- Check `searchQuery` state is updated
- Verify `useEffect` includes `searchQuery` in dependencies

---

## 📝 Example: Full Implementation

```typescript
// State
const [currentPage, setCurrentPage] = useState(0);
const [pageSize, setPageSize] = useState(10);
const [searchQuery, setSearchQuery] = useState("");
const [sortBy, setSortBy] = useState("createdAt");
const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

// Effect
useEffect(() => {
  fetchData();
}, [currentPage, pageSize, searchQuery, sortBy, sortOrder]);

// Fetch
const fetchData = async () => {
  const data = await api.getAll({
    page: currentPage,
    size: pageSize,
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
  });
  // Handle response...
};

// UI
<SearchBar value={searchQuery} onChange={setSearchQuery} />
<Select value={sortBy} onValueChange={setSortBy}>
  <SelectItem value="id">ID</SelectItem>
  <SelectItem value="name">Name</SelectItem>
</Select>
<Button onClick={() => setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")}>
  {sortOrder === "ASC" ? "↑" : "↓"}
</Button>
<DataTablePagination
  currentPage={currentPage}
  onPageChange={setCurrentPage}
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
  totalPages={totalPages}
  totalElements={totalElements}
/>
```

---

**Last Updated:** January 11, 2026  
**Version:** 2.0 - Modern Professional UI
