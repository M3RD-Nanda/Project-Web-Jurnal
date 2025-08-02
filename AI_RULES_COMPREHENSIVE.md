# Comprehensive AI Development Rules & Guidelines

This document serves as the definitive guide for AI-assisted development of this Next.js application. It outlines technology stack, coding standards, architectural patterns, and best practices to ensure consistent, maintainable, and high-quality code development.

## Table of Contents

1. [Core Technology Stack](#core-technology-stack)
2. [Project Architecture](#project-architecture)
3. [Development Guidelines](#development-guidelines)
4. [Code Quality Standards](#code-quality-standards)
5. [Performance Optimization](#performance-optimization)
6. [Security Guidelines](#security-guidelines)
7. [Database Management](#database-management)
8. [Web3 Integration](#web3-integration)
9. [Testing Strategy](#testing-strategy)
10. [Deployment & Production](#deployment--production)
11. [Troubleshooting & Debugging](#troubleshooting--debugging)
12. [AI Development Best Practices](#ai-development-best-practices)

---

## Core Technology Stack

### Framework & Language
- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript 5.x (strict mode enabled)
- **Runtime**: React 19.x with concurrent features
- **Package Manager**: pnpm (preferred for performance and disk efficiency)

### UI & Styling
- **UI Components**: Shadcn/UI (built on Radix UI primitives)
- **Styling**: Tailwind CSS 3.4.x with utility-first approach
- **Icons**: Lucide React (comprehensive SVG icon library)
- **Animations**: `tailwindcss-animate` + Radix UI built-in animations
- **Theme Management**: `next-themes` for dark/light mode support

### State Management & Data
- **Local State**: React hooks (`useState`, `useReducer`, `useContext`)
- **Global State**: React Context API (primary), Zustand (for complex state)
- **Server State**: TanStack Query (React Query) for caching and synchronization
- **Forms**: React Hook Form + Zod validation
- **Database**: Supabase (PostgreSQL with real-time subscriptions)

### Web3 & Blockchain
- **Solana**: `@solana/web3.js`, `@solana/wallet-adapter-react`
- **Ethereum/EVM**: Wagmi + Viem for type-safe Ethereum interactions
- **Multi-chain**: RainbowKit for wallet connections
- **RPC Provider**: Syndica API for Solana mainnet connections

### Development Tools
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript with strict mode
- **Build Tool**: Next.js with Turbopack (development)
- **Analytics**: Vercel Analytics + Speed Insights

---

## Project Architecture

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (routes)/          # Route groups
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   ├── layout/           # Layout components
│   ├── sections/         # Page sections
│   └── [feature]/        # Feature-specific components
├── lib/                  # Utility functions & configurations
├── hooks/                # Custom React hooks
├── contexts/             # React contexts
├── actions/              # Server actions
├── types/                # TypeScript type definitions
└── integrations/         # Third-party integrations
```

### Component Organization
- **UI Components**: Reusable, unstyled components in `src/components/ui/`
- **Layout Components**: Header, footer, navigation in `src/components/layout/`
- **Feature Components**: Business logic components grouped by feature
- **Page Components**: Top-level components for specific routes

### File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useUserData.ts`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Types**: PascalCase with descriptive names (e.g., `UserProfile.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

---

## Development Guidelines

### 1. UI Component Development

#### Primary Rules
- **Always use Shadcn/UI components** from `src/components/ui/` as the foundation
- **Build custom components** on Radix UI primitives when Shadcn/UI doesn't provide the needed component
- **Never introduce** new UI component libraries without architectural discussion
- **Maintain consistency** with existing design patterns and component APIs

#### Component Composition Pattern
```typescript
// ✅ Good: Building on Shadcn/UI
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

// ✅ Good: Custom component following Shadcn patterns
const CustomCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
```

#### Styling Guidelines
- **Use Tailwind CSS exclusively** for all styling needs
- **Leverage CSS variables** defined in `globals.css` for theme consistency
- **Avoid inline styles** and CSS-in-JS solutions
- **Use responsive design** with Tailwind's responsive prefixes
- **Implement dark mode** using CSS variables and `next-themes`

### 2. State Management Strategy

#### Local Component State
```typescript
// ✅ Simple local state
const [isOpen, setIsOpen] = useState(false)
const [formData, setFormData] = useReducer(formReducer, initialState)
```

#### Shared State (React Context)
```typescript
// ✅ Context for shared state
const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}
```

#### Server State (TanStack Query)
```typescript
// ✅ Server state management
const { data: articles, isLoading, error } = useQuery({
  queryKey: ['articles', filters],
  queryFn: () => fetchArticles(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

### 3. Form Development

#### React Hook Form + Zod Pattern
```typescript
// ✅ Form schema with Zod
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type FormData = z.infer<typeof formSchema>

// ✅ Form implementation
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: "", password: "" }
})
```

### 4. API Development

#### Server Actions (Preferred)
```typescript
// ✅ Server action with proper error handling
"use server"

export async function createArticle(formData: FormData) {
  try {
    const validatedData = articleSchema.parse(Object.fromEntries(formData))
    const result = await supabase.from('articles').insert(validatedData)
    
    if (result.error) throw new Error(result.error.message)
    
    revalidatePath('/articles')
    return { success: true, data: result.data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

#### API Routes (When Needed)
```typescript
// ✅ API route with proper error handling
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    
    const data = await fetchPaginatedData(parseInt(page))
    
    return Response.json({ success: true, data })
  } catch (error) {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Code Quality Standards

### TypeScript Best Practices

#### Type Safety
- **Use strict TypeScript configuration** with `noImplicitAny`, `strictNullChecks`
- **Avoid `any` type** - use `unknown` or proper type definitions
- **Define interfaces** for all data structures and API responses
- **Use type guards** for runtime type checking
- **Leverage utility types** (`Partial`, `Pick`, `Omit`, etc.)

#### Type Definitions
```typescript
// ✅ Proper interface definition
interface Article {
  id: string
  title: string
  content: string
  authorId: string
  publishedAt: Date | null
  tags: string[]
  metadata: ArticleMetadata
}

// ✅ Type guard
function isValidArticle(data: unknown): data is Article {
  return typeof data === 'object' && 
         data !== null && 
         'id' in data && 
         'title' in data
}
```

### Error Handling

#### Client-Side Error Handling
```typescript
// ✅ Comprehensive error handling
try {
  const result = await submitForm(data)
  if (!result.success) {
    toast.error(result.error || 'An error occurred')
    return
  }
  toast.success('Form submitted successfully')
} catch (error) {
  console.error('Form submission error:', error)
  toast.error('Network error. Please try again.')
}
```
