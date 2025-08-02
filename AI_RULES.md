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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// ✅ Good: Custom component following Shadcn patterns
const CustomCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
);
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
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useReducer(formReducer, initialState);
```

#### Shared State (React Context)

```typescript
// ✅ Context for shared state
const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
```

#### Server State (TanStack Query)

```typescript
// ✅ Server state management
const {
  data: articles,
  isLoading,
  error,
} = useQuery({
  queryKey: ["articles", filters],
  queryFn: () => fetchArticles(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### 3. Form Development

#### React Hook Form + Zod Pattern

```typescript
// ✅ Form schema with Zod
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof formSchema>;

// ✅ Form implementation
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: "", password: "" },
});
```

### 4. API Development

#### Server Actions (Preferred)

```typescript
// ✅ Server action with proper error handling
"use server";

export async function createArticle(formData: FormData) {
  try {
    const validatedData = articleSchema.parse(Object.fromEntries(formData));
    const result = await supabase.from("articles").insert(validatedData);

    if (result.error) throw new Error(result.error.message);

    revalidatePath("/articles");
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

#### API Routes (When Needed)

```typescript
// ✅ API route with proper error handling
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";

    const data = await fetchPaginatedData(parseInt(page));

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
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
  id: string;
  title: string;
  content: string;
  authorId: string;
  publishedAt: Date | null;
  tags: string[];
  metadata: ArticleMetadata;
}

// ✅ Type guard
function isValidArticle(data: unknown): data is Article {
  return (
    typeof data === "object" && data !== null && "id" in data && "title" in data
  );
}
```

### Error Handling

#### Client-Side Error Handling

```typescript
// ✅ Comprehensive error handling
try {
  const result = await submitForm(data);
  if (!result.success) {
    toast.error(result.error || "An error occurred");
    return;
  }
  toast.success("Form submitted successfully");
} catch (error) {
  console.error("Form submission error:", error);
  toast.error("Network error. Please try again.");
}
```

#### Error Boundaries

```typescript
// ✅ Error boundary for component isolation
class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Performance Best Practices

#### Component Optimization

```typescript
// ✅ Memoization for expensive components
const ExpensiveComponent = memo(({ data }: Props) => {
  const processedData = useMemo(() => expensiveDataProcessing(data), [data]);

  const handleClick = useCallback(
    (id: string) => {
      onItemClick(id);
    },
    [onItemClick]
  );

  return <div>{/* component content */}</div>;
});
```

#### Code Splitting

```typescript
// ✅ Dynamic imports for code splitting
const DynamicChart = dynamic(() => import("@/components/Chart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```

---

## Performance Optimization

### Bundle Optimization

- **Use Next.js built-in optimizations** (automatic code splitting, image optimization)
- **Implement dynamic imports** for heavy components and libraries
- **Optimize package imports** using `optimizePackageImports` in Next.js config
- **Tree shake unused code** with proper ES modules and side-effect-free imports
- **Minimize bundle size** by avoiding large dependencies when possible

### Caching Strategy

```typescript
// ✅ Aggressive caching with TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

// ✅ Prefetch critical data
useEffect(() => {
  queryClient.prefetchQuery({
    queryKey: ["critical-data"],
    queryFn: fetchCriticalData,
  });
}, []);
```

### Image Optimization

```typescript
// ✅ Next.js Image component with optimization
import Image from "next/image";

<Image
  src="/hero-image.webp"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>;
```

### Database Performance

- **Use database indexes** for frequently queried columns
- **Implement pagination** for large datasets
- **Use Supabase RLS** for security without performance impact
- **Cache database queries** with appropriate TTL
- **Optimize SQL queries** to avoid N+1 problems

---

## Security Guidelines

### Authentication & Authorization

```typescript
// ✅ Secure authentication with Supabase
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export async function getServerSession() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

// ✅ Protected route pattern
export default async function ProtectedPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return <div>Protected content</div>;
}
```

### Data Validation

```typescript
// ✅ Server-side validation
import { z } from "zod";

const userInputSchema = z.object({
  email: z.string().email().max(255),
  content: z
    .string()
    .max(10000)
    .refine((val) => !containsMaliciousContent(val), {
      message: "Content contains prohibited elements",
    }),
});

export async function handleUserInput(input: unknown) {
  const validatedInput = userInputSchema.parse(input);
  // Process validated input
}
```

### Environment Variables

```typescript
// ✅ Environment variable validation
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SYNDICA_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

### Content Security Policy

```typescript
// ✅ CSP headers in next.config.ts
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.app;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: *.supabase.co;
      connect-src 'self' *.supabase.co wss://*.supabase.co;
    `
      .replace(/\s{2,}/g, " ")
      .trim(),
  },
];
```

---

## Database Management

### Schema Design Principles

- **Use UUIDs** for primary keys to avoid enumeration attacks
- **Implement soft deletes** with `deleted_at` timestamps
- **Add audit trails** with `created_at`, `updated_at`, `created_by`, `updated_by`
- **Use proper constraints** and foreign key relationships
- **Design for scalability** with proper indexing strategy

### Migration Best Practices

```sql
-- ✅ Safe migration pattern
-- Add new column with default value
ALTER TABLE articles
ADD COLUMN status VARCHAR(20) DEFAULT 'draft' NOT NULL;

-- Create index concurrently (PostgreSQL)
CREATE INDEX CONCURRENTLY idx_articles_status ON articles(status);

-- Add constraint after data migration
ALTER TABLE articles
ADD CONSTRAINT check_status
CHECK (status IN ('draft', 'published', 'archived'));
```

### Row Level Security (RLS)

```sql
-- ✅ RLS policy for user data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

### Backwards Compatibility Rules

- **Never remove columns** without deprecation period
- **Always add default values** for new NOT NULL columns
- **Use additive changes** when possible
- **Version your APIs** for breaking changes
- **Test migrations** on production-like data

---

## Web3 Integration

### Solana Wallet Integration

```typescript
// ✅ Solana wallet setup with error handling
import { useWallet } from "@solana/wallet-adapter-react";

export function SolanaWalletButton() {
  const { connect, disconnect, connected, publicKey } = useWallet();

  const handleConnect = useCallback(async () => {
    try {
      await connect();
      toast.success("Wallet connected successfully");
    } catch (error) {
      console.error("Wallet connection failed:", error);
      toast.error("Failed to connect wallet");
    }
  }, [connect]);

  return (
    <Button onClick={connected ? disconnect : handleConnect}>
      {connected
        ? `Disconnect ${publicKey?.toBase58().slice(0, 8)}...`
        : "Connect Wallet"}
    </Button>
  );
}
```

### EVM Wallet Integration

```typescript
// ✅ EVM wallet setup with Wagmi
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function EVMWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <Button onClick={() => disconnect()}>
        Disconnect {address?.slice(0, 6)}...{address?.slice(-4)}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={!connector.ready}
        >
          Connect {connector.name}
        </Button>
      ))}
    </div>
  );
}
```

### Blockchain Configuration

```typescript
// ✅ Mainnet configuration for production
export const solanaConfig = {
  network: "mainnet-beta",
  rpcUrl: process.env.NEXT_PUBLIC_SYNDICA_RPC_URL,
  commitment: "confirmed" as Commitment,
};

export const evmConfig = {
  chains: [mainnet, polygon, arbitrum],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_URL),
    [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_URL),
  },
};
```

---

## Testing Strategy

### Unit Testing

```typescript
// ✅ Component testing with React Testing Library
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Testing

```typescript
// ✅ API route testing
import { GET } from "@/app/api/articles/route";
import { NextRequest } from "next/server";

describe("/api/articles", () => {
  it("returns articles with pagination", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/articles?page=1"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

### E2E Testing Guidelines

- **Test critical user journeys** (authentication, core features)
- **Use Playwright** for cross-browser testing
- **Test responsive design** across different viewport sizes
- **Validate accessibility** with automated tools
- **Test Web3 functionality** with mock wallets

### Testing Best Practices

- **Write tests first** for critical business logic
- **Mock external dependencies** (APIs, databases, wallets)
- **Test error scenarios** and edge cases
- **Maintain test coverage** above 80% for critical paths
- **Use descriptive test names** that explain the expected behavior

---

## Deployment & Production

### Build Optimization

```typescript
// ✅ Production build configuration
const nextConfig = {
  // Enable all optimizations
  compress: true,
  productionBrowserSourceMaps: false,

  // Optimize images
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Bundle optimization
  experimental: {
    optimizePackageImports: ["recharts", "lucide-react"],
    optimizeServerReact: true,
    optimizeCss: true,
  },
};
```

### Environment Configuration

```typescript
// ✅ Environment-specific configurations
const config = {
  development: {
    database: { ssl: false },
    logging: { level: "debug" },
    cache: { ttl: 0 },
  },
  production: {
    database: { ssl: true, poolSize: 20 },
    logging: { level: "error" },
    cache: { ttl: 300 },
  },
};
```

### Deployment Checklist

- [ ] **Environment variables** properly configured
- [ ] **Database migrations** applied and tested
- [ ] **SSL certificates** configured and valid
- [ ] **CDN caching** configured for static assets
- [ ] **Error monitoring** (Sentry, LogRocket) enabled
- [ ] **Performance monitoring** (Vercel Analytics) enabled
- [ ] **Security headers** properly configured
- [ ] **Backup strategy** implemented and tested

### Production Monitoring

```typescript
// ✅ Error tracking and monitoring
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter out non-critical errors
    if (event.exception?.values?.[0]?.type === "ChunkLoadError") {
      return null;
    }
    return event;
  },
});
```

---

## Troubleshooting & Debugging

### Common Issues & Solutions

#### Hydration Mismatches

```typescript
// ✅ Fix hydration issues with dynamic content
import { useEffect, useState } from "react";

export function ClientOnlyComponent({ children }: { children: ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
```

#### Memory Leaks

```typescript
// ✅ Proper cleanup in useEffect
useEffect(() => {
  const controller = new AbortController();

  fetchData({ signal: controller.signal })
    .then(setData)
    .catch((error) => {
      if (error.name !== "AbortError") {
        console.error("Fetch error:", error);
      }
    });

  return () => {
    controller.abort();
  };
}, []);
```

#### Bundle Size Issues

```typescript
// ✅ Analyze bundle size
// Use webpack-bundle-analyzer
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
```

### Debugging Tools

- **React Developer Tools** for component inspection
- **Next.js DevTools** for performance analysis
- **Chrome DevTools** for network and performance profiling
- **Vercel Analytics** for real-user monitoring
- **Supabase Dashboard** for database query analysis

### Performance Debugging

```typescript
// ✅ Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

function sendToAnalytics(metric) {
  // Send to your analytics service
  analytics.track("Web Vital", {
    name: metric.name,
    value: metric.value,
    id: metric.id,
  });
}

// Measure all Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## AI Development Best Practices

### Code Generation Guidelines

- **Always validate generated code** with TypeScript compiler
- **Test generated components** in isolation before integration
- **Review security implications** of generated code
- **Ensure accessibility compliance** in generated UI components
- **Maintain consistency** with existing codebase patterns

### AI Collaboration Workflow

1. **Analyze existing codebase** before making changes
2. **Use codebase retrieval** to understand current patterns
3. **Follow established conventions** and architectural decisions
4. **Test changes thoroughly** before considering them complete
5. **Document significant changes** and architectural decisions

### Quality Assurance

- **Run linting and type checking** after code generation
- **Verify responsive design** across different screen sizes
- **Test accessibility** with screen readers and keyboard navigation
- **Validate performance impact** of new code
- **Ensure security best practices** are followed

---

## Conclusion

This comprehensive guide serves as the foundation for all AI-assisted development on this Next.js application. By following these guidelines, we ensure:

- **Consistent code quality** across all features
- **Optimal performance** for end users
- **Robust security** protecting user data
- **Maintainable architecture** for long-term sustainability
- **Excellent developer experience** for future contributors

Remember to regularly review and update these guidelines as the technology stack evolves and new best practices emerge.

---

_Last updated: 2025-01-27_
_Version: 1.0.0_
