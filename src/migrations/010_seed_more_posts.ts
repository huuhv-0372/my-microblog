import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMorePosts1746000000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminRows = (await queryRunner.query(
      `SELECT id FROM users WHERE role = 'admin' LIMIT 1`,
    )) as { id: number }[];
    const adminId: number = adminRows[0].id;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const tags = (await queryRunner.query(`SELECT id, slug FROM tags`)) as {
      id: number;
      slug: string;
    }[];
    const tagId = (slug: string): number =>
      tags.find((t) => t.slug === slug)!.id;

    interface PostSeed {
      title: string;
      slug: string;
      body: string;
      tags: string[];
    }

    const posts: PostSeed[] = [
      // ── NestJS ──────────────────────────────────────────────────────────
      {
        title: 'NestJS Dependency Injection Deep Dive',
        slug: 'nestjs-dependency-injection-deep-dive',
        body: `<p>Dependency Injection (DI) is at the heart of NestJS architecture. Every provider, service, and repository is managed through NestJS's IoC container, making testing and composition effortless.</p>
<p>In this post we explore custom providers, factory providers, and how to scope providers to requests for multi-tenant applications.</p>
<h2>Custom Providers</h2>
<p>Beyond the simple <code>@Injectable()</code> decorator, NestJS supports <code>useClass</code>, <code>useValue</code>, <code>useFactory</code>, and <code>useExisting</code> provider shapes. Mastering these lets you swap implementations at runtime or in tests.</p>`,
        tags: ['nestjs', 'typescript'],
      },
      {
        title: 'Building REST APIs with NestJS',
        slug: 'building-rest-apis-with-nestjs',
        body: `<p>NestJS ships with everything you need to build production-grade REST APIs: routing, validation, serialisation, exception filters, and OpenAPI docs — all wired together with decorators.</p>
<p>We cover <code>@Controller</code>, <code>@Get/@Post/@Put/@Delete</code>, DTOs with <code>class-validator</code>, and how to generate Swagger docs automatically.</p>
<h2>Controllers & Routes</h2>
<p>A controller maps HTTP verbs to handler methods. Route parameters (<code>@Param</code>), query strings (<code>@Query</code>), and request bodies (<code>@Body</code>) are each injected cleanly by NestJS.</p>`,
        tags: ['nestjs', 'tutorial'],
      },
      {
        title: 'NestJS Guards: Authorization Made Simple',
        slug: 'nestjs-guards-authorization',
        body: `<p>Guards decide whether a given request should be handled by the route handler. They run after middleware but before interceptors and pipes, making them the right place for auth logic.</p>
<p>We implement a <code>JwtAuthGuard</code> that reads a JWT from an HTTP-only cookie, verifies it with <code>@nestjs/jwt</code>, and attaches the user to the request.</p>
<h2>Role-Based Access</h2>
<p>Combine guards with custom metadata (<code>@SetMetadata</code> or a <code>@Roles()</code> decorator) to restrict endpoints by user role without duplicating logic across handlers.</p>`,
        tags: ['nestjs'],
      },
      {
        title: 'NestJS Pipes and Request Validation',
        slug: 'nestjs-pipes-request-validation',
        body: `<p>Pipes transform and validate incoming data before it reaches a route handler. The built-in <code>ValidationPipe</code> paired with <code>class-validator</code> DTOs catches malformed requests automatically.</p>
<p>Custom pipes let you parse route parameters, coerce types, or sanitise user input — all in a reusable, testable class.</p>
<h2>Global Validation</h2>
<p>Register <code>ValidationPipe</code> globally in <code>main.ts</code> with <code>whitelist: true</code> and <code>forbidNonWhitelisted: true</code> to strip unknown properties and reject invalid payloads at the application boundary.</p>`,
        tags: ['nestjs', 'typescript'],
      },
      {
        title: 'NestJS Interceptors Explained',
        slug: 'nestjs-interceptors-explained',
        body: `<p>Interceptors wrap route handlers with additional logic — logging, caching, response transformation, or error mapping. They use RxJS operators to work with the observable returned by each handler.</p>
<p>A <code>LoggingInterceptor</code> that records request duration is a classic first example. A <code>TransformInterceptor</code> that wraps every response in <code>{ data: ... }</code> is another common pattern.</p>
<h2>Caching with Interceptors</h2>
<p>NestJS provides a <code>CacheInterceptor</code> backed by a configurable store. Apply it per route with <code>@UseInterceptors(CacheInterceptor)</code> or globally for a simple in-memory cache.</p>`,
        tags: ['nestjs'],
      },
      {
        title: 'Testing NestJS Applications with Jest',
        slug: 'testing-nestjs-applications-jest',
        body: `<p>NestJS provides first-class testing utilities via <code>@nestjs/testing</code>. The <code>Test.createTestingModule()</code> factory lets you bootstrap a module in isolation, swap real dependencies with mocks, and test each layer independently.</p>
<p>Unit tests cover individual services; integration tests spin up the full module with an in-memory SQLite database to verify database interactions.</p>
<h2>Mocking Dependencies</h2>
<p>Use Jest's <code>jest.fn()</code> to create mock implementations and provide them via the <code>providers</code> array. <code>jest.spyOn()</code> lets you assert that a collaborator was called with the expected arguments.</p>`,
        tags: ['nestjs', 'tutorial'],
      },
      {
        title: 'Real-Time Apps with NestJS WebSockets',
        slug: 'nestjs-websockets-real-time',
        body: `<p>NestJS supports WebSockets natively through <code>@WebSocketGateway</code>. Under the hood it uses Socket.IO (or the native WS adapter), giving you rooms, namespaces, and event-based messaging out of the box.</p>
<p>Add authentication by implementing <code>IoAdapter</code> and reading the JWT from the socket handshake headers — no separate auth logic needed.</p>
<h2>Broadcasting Events</h2>
<p>Inject <code>Server</code> from Socket.IO to broadcast events to all connected clients or to a specific room. Combine this with TypeORM listeners to push database changes to the browser in real time.</p>`,
        tags: ['nestjs'],
      },
      {
        title: 'NestJS and GraphQL: A Practical Guide',
        slug: 'nestjs-graphql-practical-guide',
        body: `<p>NestJS integrates with Apollo Server through <code>@nestjs/graphql</code>. The code-first approach lets you define your schema entirely in TypeScript using decorators — no separate SDL files needed.</p>
<p>Resolvers replace controllers; <code>@Query</code> and <code>@Mutation</code> decorators map to GraphQL operations. DataLoader solves the N+1 problem for relational data.</p>
<h2>Subscriptions</h2>
<p>GraphQL subscriptions over WebSockets enable real-time updates. NestJS wires these to the same WebSocket gateway, so you get live data without a separate connection layer.</p>`,
        tags: ['nestjs'],
      },
      {
        title: 'NestJS Microservices with Redis',
        slug: 'nestjs-microservices-redis',
        body: `<p>NestJS's microservice support lets you split a monolith into independent services that communicate over message brokers. The Redis transport is ideal for low-latency, in-process message passing.</p>
<p>Define message patterns with <code>@MessagePattern</code> on the server and use <code>ClientProxy</code> on the client to send requests or emit events.</p>
<h2>Event-Driven Architecture</h2>
<p>Use <code>@EventPattern</code> for fire-and-forget events — think audit logs, email notifications, or cache invalidation — without coupling the sender to the receiver.</p>`,
        tags: ['nestjs'],
      },
      {
        title: 'NestJS Configuration Management with ConfigModule',
        slug: 'nestjs-configuration-management',
        body: `<p>Hard-coding environment values is a recipe for production incidents. NestJS's <code>ConfigModule</code> loads <code>.env</code> files via <code>dotenv</code> and exposes typed configuration through an injectable <code>ConfigService</code>.</p>
<p>The <code>validationSchema</code> option (backed by Joi) lets you define required variables and their types, failing fast at startup if anything is missing.</p>
<h2>Typed Configuration</h2>
<p>Register a factory function with <code>ConfigModule.forFeature()</code> to create strongly-typed namespaced config objects — no more magic strings scattered across your codebase.</p>`,
        tags: ['nestjs', 'typescript'],
      },

      // ── TypeScript ───────────────────────────────────────────────────────
      {
        title: 'TypeScript Generics Explained',
        slug: 'typescript-generics-explained',
        body: `<p>Generics are TypeScript's mechanism for writing reusable, type-safe code. A generic function or class works with any type while still providing full type inference and autocompletion.</p>
<p>The classic example is a typed <code>identity</code> function: <code>function identity&lt;T&gt;(arg: T): T { return arg; }</code>. Call it with a string and TypeScript knows the return type is string — no cast needed.</p>
<h2>Bounded Generics</h2>
<p>Use <code>extends</code> to constrain what a type parameter can be. <code>&lt;T extends object&gt;</code> ensures callers can't pass primitives. Combine multiple constraints with intersection types for precise APIs.</p>`,
        tags: ['typescript'],
      },
      {
        title: 'TypeScript Utility Types You Should Know',
        slug: 'typescript-utility-types',
        body: `<p>TypeScript ships with a rich set of built-in utility types that eliminate boilerplate. <code>Partial&lt;T&gt;</code>, <code>Required&lt;T&gt;</code>, <code>Readonly&lt;T&gt;</code>, <code>Pick&lt;T, K&gt;</code>, and <code>Omit&lt;T, K&gt;</code> cover the most common transformation needs.</p>
<p>For function types, <code>Parameters&lt;T&gt;</code> and <code>ReturnType&lt;T&gt;</code> extract the argument tuple and return type respectively — useful when you need to mirror a function's shape.</p>
<h2>Conditional Utility Types</h2>
<p><code>NonNullable&lt;T&gt;</code> removes <code>null</code> and <code>undefined</code>. <code>Extract&lt;T, U&gt;</code> and <code>Exclude&lt;T, U&gt;</code> filter union members. Master these and you'll rarely need a type cast.</p>`,
        tags: ['typescript'],
      },
      {
        title: 'TypeScript Decorators: A Complete Guide',
        slug: 'typescript-decorators-complete-guide',
        body: `<p>Decorators are a Stage 3 TC39 proposal and a core part of frameworks like NestJS and Angular. They let you annotate classes, methods, properties, and parameters with metadata or behaviour modifications.</p>
<p>A class decorator receives the constructor; a method decorator receives the target, method name, and property descriptor — giving you full control to wrap, replace, or augment behaviour.</p>
<h2>Metadata Reflection</h2>
<p>Pair decorators with <code>reflect-metadata</code> to store and retrieve type information at runtime. NestJS uses this internally to resolve dependency injection tokens and build the module graph.</p>`,
        tags: ['typescript', 'nestjs'],
      },
      {
        title: 'TypeScript Strict Mode: Why You Should Enable It',
        slug: 'typescript-strict-mode-guide',
        body: `<p>TypeScript's <code>strict</code> flag in <code>tsconfig.json</code> enables a family of checks: <code>noImplicitAny</code>, <code>strictNullChecks</code>, <code>strictFunctionTypes</code>, and more. Together they catch a large class of bugs at compile time.</p>
<p>The most impactful is <code>strictNullChecks</code>: every variable that could be <code>null</code> or <code>undefined</code> must be explicitly handled, eliminating entire categories of runtime errors.</p>
<h2>Migrating an Existing Codebase</h2>
<p>Enable strict flags one by one using the granular <code>tsconfig</code> options. Fix the resulting errors incrementally — treating each fix as an opportunity to understand a previously hidden assumption in your code.</p>`,
        tags: ['typescript', 'tutorial'],
      },
      {
        title: 'Advanced TypeScript Patterns',
        slug: 'advanced-typescript-patterns',
        body: `<p>Beyond the basics, TypeScript's type system can express surprisingly complex constraints: discriminated unions, template literal types, infer in conditional types, and recursive types.</p>
<p>A discriminated union uses a common literal field to narrow a type. When exhaustiveness checking is added (<code>never</code> in a default case), the compiler tells you when you've missed a case after adding a new variant.</p>
<h2>Template Literal Types</h2>
<p>Introduced in TypeScript 4.1, template literal types let you compute string types at compile time. Use them to type event names, CSS property names, or API endpoint patterns without runtime overhead.</p>`,
        tags: ['typescript'],
      },
      {
        title: 'TypeScript with React: Best Practices',
        slug: 'typescript-with-react-best-practices',
        body: `<p>TypeScript and React are a natural pair. Typed props and state catch mistakes before they reach users, and IDE support becomes dramatically better with full type information.</p>
<p>Use <code>React.FC&lt;Props&gt;</code> sparingly — prefer explicit return types and destructured props for clarity. Type event handlers with <code>React.ChangeEvent&lt;HTMLInputElement&gt;</code> rather than the generic <code>any</code>.</p>
<h2>Custom Hooks</h2>
<p>Generic custom hooks — <code>useLocalStorage&lt;T&gt;</code>, <code>useFetch&lt;T&gt;</code> — give callers full type inference. Return a tuple typed with <code>const</code> assertion (<code>as const</code>) to prevent widening to arrays.</p>`,
        tags: ['typescript'],
      },
      {
        title: 'TypeScript Enums vs Union Types',
        slug: 'typescript-enums-vs-union-types',
        body: `<p>Enums and union types both represent a fixed set of values, but they have very different trade-offs. Enums generate JavaScript code; union types are erased at compile time. For most use cases, union types are preferable.</p>
<p><code>type Status = 'draft' | 'published' | 'archived'</code> is simpler, more readable, and tree-shakeable. Const enums are an exception — they're inlined by the compiler — but they don't work with <code>isolatedModules</code>.</p>
<h2>When to Use Enums</h2>
<p>Numeric enums are useful when you need a numeric ID mapped to a human-readable label (e.g. HTTP status codes) and you want the mapping to be available at runtime. In all other cases, prefer union types.</p>`,
        tags: ['typescript'],
      },
      {
        title: 'TypeScript Type Guards and Narrowing',
        slug: 'typescript-type-guards-narrowing',
        body: `<p>Type narrowing is TypeScript's ability to refine a broad type to a specific one within a code branch. <code>typeof</code>, <code>instanceof</code>, <code>in</code>, and user-defined type guards all trigger narrowing.</p>
<p>A user-defined type guard is a function with a <code>value is Type</code> return type. When it returns <code>true</code>, TypeScript narrows the argument type in the calling scope.</p>
<h2>Discriminated Unions and Exhaustiveness</h2>
<p>Combine narrowing with a <code>never</code> assertion in the default branch of a switch to get compile-time exhaustiveness checking — the compiler will error if you add a new variant and forget to handle it.</p>`,
        tags: ['typescript'],
      },
      {
        title: 'TypeScript Mapped Types',
        slug: 'typescript-mapped-types',
        body: `<p>Mapped types iterate over the keys of an existing type and transform each one. They're the foundation of built-in utility types like <code>Partial</code>, <code>Readonly</code>, and <code>Required</code>.</p>
<p>The syntax <code>{ [K in keyof T]: ... }</code> opens up powerful transformations. Add <code>-readonly</code> or <code>-?</code> modifiers to remove existing qualifiers from properties.</p>
<h2>Key Remapping</h2>
<p>TypeScript 4.1 added <code>as</code> clauses in mapped types, letting you rename keys via template literal types. This unlocks patterns like generating getter names from property names: <code>[K in keyof T as \`get\${Capitalize&lt;K&gt;}\`]</code>.</p>`,
        tags: ['typescript'],
      },

      // ── Tutorial ─────────────────────────────────────────────────────────
      {
        title: 'Docker for Node.js Developers',
        slug: 'docker-for-nodejs-developers',
        body: `<p>Docker packages your Node.js application and its dependencies into a portable image that runs identically on every machine. No more "works on my machine" bugs — the Dockerfile is the source of truth for the runtime environment.</p>
<p>A minimal Node.js Dockerfile uses a multi-stage build: install deps in a builder stage, then copy only the compiled output into a lean production image. Final images can be under 100 MB.</p>
<h2>Docker Compose</h2>
<p>Docker Compose orchestrates multi-container setups locally. Define your app, database, and Redis in a single <code>docker-compose.yml</code> and bring them all up with one command: <code>docker compose up -d</code>.</p>`,
        tags: ['tutorial'],
      },
      {
        title: 'Git Workflow for Development Teams',
        slug: 'git-workflow-for-teams',
        body: `<p>A consistent Git workflow reduces merge conflicts, makes code review tractable, and keeps the main branch always deployable. The most common approaches are GitHub Flow (simple) and Gitflow (structured).</p>
<p>GitHub Flow: branch from main, open a PR, review, merge, deploy. Every merge to main triggers CI and an automatic deployment — perfect for continuous delivery teams.</p>
<h2>Commit Message Conventions</h2>
<p>Conventional Commits (<code>feat:</code>, <code>fix:</code>, <code>chore:</code>) make changelogs automatable and PRs easier to scan. Tools like Commitlint enforce the convention in CI before a PR can be merged.</p>`,
        tags: ['tutorial'],
      },
      {
        title: 'VSCode Tips for TypeScript Developers',
        slug: 'vscode-tips-typescript-developers',
        body: `<p>VSCode and TypeScript are built by the same team and share the same language server. This means refactoring, go-to-definition, and type-aware autocomplete work out of the box — but there are many hidden features worth enabling.</p>
<p>Enable <code>typescript.preferences.importModuleSpecifier</code> to control import paths. Use <code>editor.codeActionsOnSave</code> to auto-fix lint errors and organise imports on every save.</p>
<h2>Must-Have Extensions</h2>
<p>ESLint, Prettier, GitLens, Error Lens, and Path Intellisense are the core extensions for a productive TypeScript workflow. Keep the extension list short — each one adds startup overhead.</p>`,
        tags: ['tutorial', 'typescript'],
      },
      {
        title: 'CI/CD with GitHub Actions',
        slug: 'ci-cd-github-actions',
        body: `<p>GitHub Actions turns your repository into a CI/CD platform with no external service required. Workflows are YAML files in <code>.github/workflows/</code> that run on push, pull_request, or a schedule.</p>
<p>A typical Node.js workflow: checkout code → install deps → run lint → run tests → build. Add a deploy step for staging on every merge to <code>main</code>, and a manual approval gate for production.</p>
<h2>Caching Dependencies</h2>
<p>Use the official <code>actions/cache</code> action to cache <code>node_modules</code> between runs. Key the cache on the hash of <code>package-lock.json</code> so it's invalidated whenever dependencies change.</p>`,
        tags: ['tutorial'],
      },
      {
        title: 'Linux Commands Every Developer Should Know',
        slug: 'linux-commands-every-developer-should-know',
        body: `<p>Even if you develop on Windows or macOS, production servers almost always run Linux. A solid command-line foundation lets you debug issues faster and automate repetitive tasks with simple shell scripts.</p>
<p>The most essential commands: <code>grep</code> (search text), <code>find</code> (locate files), <code>curl</code> (test HTTP endpoints), <code>ps</code> and <code>kill</code> (manage processes), <code>top</code> / <code>htop</code> (monitor resources).</p>
<h2>Pipes and Redirection</h2>
<p>Linux's power comes from composing small tools with pipes. <code>cat access.log | grep ERROR | sort | uniq -c | sort -rn | head -20</code> gives you the top 20 error patterns in a log file in one line.</p>`,
        tags: ['tutorial'],
      },
      {
        title: 'HTTP Protocol Fundamentals for Developers',
        slug: 'http-protocol-fundamentals',
        body: `<p>Every web developer sends and receives HTTP every day, but few understand the protocol deeply. Knowing the difference between headers, the request/response cycle, keep-alive connections, and caching directives makes you a better API designer.</p>
<p>Status codes tell the client what happened: 2xx success, 3xx redirect, 4xx client error, 5xx server error. Use them precisely — returning 200 for an error confuses clients and monitoring tools.</p>
<h2>HTTP/2 and HTTP/3</h2>
<p>HTTP/2 multiplexes multiple requests over one TCP connection, eliminating head-of-line blocking. HTTP/3 replaces TCP with QUIC (UDP-based), reducing connection setup time for mobile users on lossy networks.</p>`,
        tags: ['tutorial'],
      },
      {
        title: 'REST vs GraphQL: Choosing the Right API Style',
        slug: 'rest-vs-graphql-api-style',
        body: `<p>REST and GraphQL solve the same problem — exposing data over HTTP — but with different trade-offs. REST is simple, widely understood, and cacheable at the HTTP layer. GraphQL gives clients precise control over what data they receive.</p>
<p>REST struggles with over-fetching (too many fields) and under-fetching (too many round trips). GraphQL solves both with a single flexible query, at the cost of added complexity and loss of HTTP-level caching.</p>
<h2>When to Choose Each</h2>
<p>Use REST for public APIs, simple CRUD services, and teams new to APIs. Use GraphQL when you have diverse clients (web, mobile, IoT) with different data needs, or when network efficiency is critical.</p>`,
        tags: ['tutorial'],
      },
      {
        title: 'Authentication Best Practices for Web Apps',
        slug: 'authentication-best-practices-web-apps',
        body: `<p>Authentication is the most security-sensitive part of any web application. Getting it wrong exposes users' data and your reputation. Following established best practices dramatically reduces the attack surface.</p>
<p>Never store passwords in plain text. Use bcrypt, Argon2, or scrypt with a work factor that makes brute-force attacks impractical. Store only the hash; verify by hashing the candidate and comparing.</p>
<h2>Session vs Token Auth</h2>
<p>Session cookies are server-side state; JWTs are stateless tokens. HTTP-only, Secure, SameSite=Strict cookies are safer than localStorage for storing either. Implement refresh token rotation to limit the blast radius of a stolen token.</p>`,
        tags: ['tutorial'],
      },
      {
        title: 'Writing Clean Code: Principles Every Dev Should Follow',
        slug: 'writing-clean-code-principles',
        body: `<p>Clean code is not about following a style guide — it's about writing code that communicates intent clearly to the next developer (often yourself six months later). Functions should do one thing; names should reveal purpose; comments should explain why, not what.</p>
<p>The DRY principle (Don't Repeat Yourself) reduces the chance of inconsistencies, but taken too far it creates unwanted coupling. Duplication is cheaper than the wrong abstraction.</p>
<h2>The Boy Scout Rule</h2>
<p>Leave the code better than you found it. Rename a confusing variable, extract a helper function, delete dead code. Small improvements compound over time into a significantly cleaner codebase.</p>`,
        tags: ['tutorial'],
      },

      // ── CSS ──────────────────────────────────────────────────────────────
      {
        title: 'CSS Grid vs Flexbox: When to Use Each',
        slug: 'css-grid-vs-flexbox',
        body: `<p>CSS Grid and Flexbox are both two-dimensional layout tools, but they excel in different scenarios. Flexbox is best for laying out items in a single axis — a row of buttons or a column of form fields. Grid is best for two-dimensional layouts — a page layout with rows and columns.</p>
<p>A common pattern: use Grid for the outer page shell (header, sidebar, main, footer) and Flexbox for the components inside each region.</p>
<h2>Auto Placement</h2>
<p>Grid's auto-placement algorithm fills cells without explicit positioning. Combine <code>grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))</code> with <code>gap</code> for a responsive card grid with zero media queries.</p>`,
        tags: ['css'],
      },
      {
        title: 'CSS Custom Properties (Variables) in Depth',
        slug: 'css-custom-properties-in-depth',
        body: `<p>CSS custom properties (a.k.a. CSS variables) bring the power of variables to stylesheets without a preprocessor. They cascade, inherit, and can be read and written by JavaScript — opening the door to dynamic theming.</p>
<p>Define them on <code>:root</code> for global scope or on a component selector for local scope. Use <code>var(--color-primary, #3b82f6)</code> — the second argument is a fallback if the variable is not set.</p>
<h2>Dark Mode with CSS Variables</h2>
<p>Define a light palette on <code>:root</code> and override it inside <code>@media (prefers-color-scheme: dark)</code>. Every element that uses the variables automatically adapts — no JavaScript required.</p>`,
        tags: ['css'],
      },
      {
        title: 'CSS Animations and Transitions',
        slug: 'css-animations-and-transitions',
        body: `<p>Animations make UIs feel alive and guide user attention. CSS provides two mechanisms: <code>transition</code> for smooth state changes (hover, focus) and <code>@keyframes</code> for complex multi-step sequences.</p>
<p>Transitions are the simpler choice for most interactions. Apply them to the base state, not the hover state, so the animation plays both ways. Always specify the properties you're animating rather than using <code>all</code> to avoid unexpected performance issues.</p>
<h2>Performance-Friendly Animation</h2>
<p>Animate only <code>transform</code> and <code>opacity</code> for 60 fps performance. These properties are composited on the GPU and don't trigger layout or paint. Use <code>will-change: transform</code> sparingly to promote elements to their own layer.</p>`,
        tags: ['css'],
      },
      {
        title: 'Responsive Design with Media Queries',
        slug: 'responsive-design-media-queries',
        body: `<p>Responsive design makes a single codebase work across phones, tablets, and desktops. Media queries let you apply different CSS rules based on viewport width, height, orientation, and user preferences like dark mode or reduced motion.</p>
<p>The mobile-first approach starts with styles for small screens and progressively adds complexity for larger screens with <code>min-width</code> breakpoints. This matches how CSS cascades and results in smaller default stylesheets.</p>
<h2>Logical Breakpoints</h2>
<p>Avoid hard-coding pixel values for breakpoints. Instead, set breakpoints where your content breaks — where the layout looks awkward — rather than at specific device dimensions. Content should drive breakpoints, not devices.</p>`,
        tags: ['css', 'tutorial'],
      },
      {
        title: 'CSS Architecture: BEM vs Utility-First',
        slug: 'css-architecture-bem-vs-utility-first',
        body: `<p>CSS at scale requires a methodology. BEM (Block Element Modifier) imposes naming conventions that make the relationship between HTML and CSS explicit. Utility-first frameworks like Tailwind eliminate class naming entirely by composing low-level utilities directly in HTML.</p>
<p>BEM shines in design systems where component encapsulation and theming are paramount. Utility-first shines in rapid prototyping and small teams where the cognitive overhead of naming is a bottleneck.</p>
<h2>Hybrid Approaches</h2>
<p>Many teams use Tailwind for layout and spacing and write semantic classes for complex components. The two approaches are not mutually exclusive — use whatever communicates intent most clearly in each context.</p>`,
        tags: ['css'],
      },
      {
        title: 'Dark Mode with CSS and Tailwind',
        slug: 'dark-mode-css-tailwind',
        body: `<p>Dark mode is now an expected feature. Users who prefer dark interfaces report reduced eye strain and better battery life on OLED screens. Implementing it correctly requires a system that's easy to extend and doesn't create a maintenance burden.</p>
<p>In Tailwind v3+, add <code>darkMode: 'class'</code> to your config and toggle a <code>dark</code> class on <code>&lt;html&gt;</code>. Dark-variant classes (<code>dark:bg-gray-900</code>) only apply when the class is present.</p>
<h2>Respecting System Preference</h2>
<p>Read <code>window.matchMedia('(prefers-color-scheme: dark)').matches</code> on load to set the initial theme. Store the user's manual override in <code>localStorage</code> so it persists across page loads.</p>`,
        tags: ['css'],
      },
      {
        title: 'CSS Shapes and Clip-Path',
        slug: 'css-shapes-and-clip-path',
        body: `<p>CSS isn't limited to rectangles. The <code>clip-path</code> property masks an element to any shape — circle, ellipse, polygon, or an SVG path. The <code>shape-outside</code> property makes text flow around non-rectangular floats.</p>
<p>A common use: <code>clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%)</code> creates a diagonal section separator without any extra markup or image assets.</p>
<h2>Animating Clip-Path</h2>
<p>Clip-path values with the same number of points can be transitioned smoothly. Morph between a rectangle and a circle on hover for a striking button or avatar effect — all in CSS, no JavaScript.</p>`,
        tags: ['css'],
      },
      {
        title: 'A Modern CSS Reset',
        slug: 'modern-css-reset',
        body: `<p>Browsers ship with different default stylesheets. A CSS reset brings them to a consistent baseline before you add your own styles. Modern resets are lighter than the old Eric Meyer reset — they preserve useful browser defaults and fix only genuine inconsistencies.</p>
<p>Josh Comeau's modern reset is a popular starting point: it sets <code>box-sizing: border-box</code> globally, removes default margins from headings and paragraphs, and ensures images are responsive by default.</p>
<h2>Tailwind Preflight</h2>
<p>Tailwind's Preflight (injected with <code>@tailwind base</code>) is a reset built on top of modern-normalize. It normalises browser defaults and removes user-agent styles for headings, paragraphs, lists, and form elements — giving you a clean canvas to style from scratch.</p>`,
        tags: ['css'],
      },
      {
        title: 'CSS Container Queries',
        slug: 'css-container-queries',
        body: `<p>Container queries are the biggest layout feature since Flexbox. Unlike media queries, which respond to the viewport, container queries respond to the size of a parent element — making truly context-aware components possible.</p>
<p>Mark a parent with <code>container-type: inline-size</code> and write styles that apply when the container is wider than a threshold: <code>@container (min-width: 400px) { ... }</code>.</p>
<h2>Component-Level Responsiveness</h2>
<p>A card component can now adapt its own layout depending on whether it's in a narrow sidebar or a wide main column — without any changes to the card's CSS. This solves a long-standing limitation of CSS that required duplicating styles for different contexts.</p>`,
        tags: ['css'],
      },
      {
        title: 'Tailwind CSS Best Practices',
        slug: 'tailwind-css-best-practices',
        body: `<p>Tailwind CSS's utility-first approach is powerful but can lead to unmaintainable HTML if not used thoughtfully. Extracting repeated patterns into components (React, Vue, or Handlebars partials) keeps your markup DRY without sacrificing the flexibility of utilities.</p>
<p>Use <code>@apply</code> sparingly — it's useful for elements you can't control (markdown output, third-party widgets) but defeats the purpose of utility-first for your own components.</p>
<h2>Custom Theme Tokens</h2>
<p>Define your colour palette, spacing scale, and typography in <code>tailwind.config.js</code> rather than hard-coding arbitrary values in class names. This makes redesigns a configuration change, not a find-and-replace across hundreds of files.</p>`,
        tags: ['css', 'tutorial'],
      },

      // ── Database ─────────────────────────────────────────────────────────
      {
        title: 'MySQL Index Optimization Guide',
        slug: 'mysql-index-optimization-guide',
        body: `<p>Indexes are the single biggest lever for database query performance. Without the right indexes, a query that should take milliseconds can scan millions of rows and take seconds. Understanding how the query planner uses indexes is essential for every backend developer.</p>
<p>Use <code>EXPLAIN</code> or <code>EXPLAIN ANALYZE</code> to see the execution plan. Look for full table scans (<code>type: ALL</code>) — each one is an optimisation opportunity.</p>
<h2>Composite Indexes</h2>
<p>A composite index on <code>(status, published_at)</code> is more useful than two separate single-column indexes for a query that filters on status and sorts by date. The leftmost column rule applies: the index is only used if the query predicates include the leading column.</p>`,
        tags: ['database'],
      },
      {
        title: 'PostgreSQL vs MySQL: Choosing a Database',
        slug: 'postgresql-vs-mysql-choosing',
        body: `<p>MySQL and PostgreSQL are both production-proven relational databases, but they have different strengths. MySQL has historically been faster for simple read-heavy workloads; PostgreSQL has more advanced SQL compliance and powerful features like JSONB, CTEs, and window functions.</p>
<p>PostgreSQL's MVCC (Multi-Version Concurrency Control) implementation is generally superior, with less locking and better behaviour under high write concurrency. MySQL's InnoDB engine is solid but has quirks around locking and foreign keys.</p>
<h2>When to Use Each</h2>
<p>Start with PostgreSQL for new projects — its feature set is broader and the SQL compliance is better. Use MySQL if your hosting provider or team has deep existing expertise with it, or if you need specific MySQL features like full-text search with low configuration overhead.</p>`,
        tags: ['database'],
      },
      {
        title: 'Database Normalization Explained',
        slug: 'database-normalization-explained',
        body: `<p>Normalization is the process of organizing a relational database to reduce data redundancy and improve integrity. The normal forms (1NF through BCNF) provide a structured way to evaluate and improve a schema design.</p>
<p>First Normal Form (1NF) requires atomic values — no arrays or nested structures in columns. Second Normal Form (2NF) eliminates partial dependencies on composite primary keys. Third Normal Form (3NF) removes transitive dependencies.</p>
<h2>When to Denormalize</h2>
<p>Normalization is not always the goal. For read-heavy analytical workloads, denormalized tables (fewer joins, more redundancy) can dramatically improve query performance. The key is understanding the trade-off: write complexity and storage vs. read speed.</p>`,
        tags: ['database', 'tutorial'],
      },
      {
        title: 'SQL Joins Explained with Examples',
        slug: 'sql-joins-explained',
        body: `<p>SQL joins combine rows from two or more tables based on a related column. Understanding joins is fundamental to working with relational data — nearly every non-trivial query involves at least one join.</p>
<p>INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right (nulls for non-matches). FULL OUTER JOIN returns all rows from both tables.</p>
<h2>Performance Considerations</h2>
<p>Join performance depends on indexes and row counts. Always join on indexed columns. Be cautious with joins that produce large intermediate result sets — break complex queries into smaller steps using CTEs for readability and often better execution plans.</p>`,
        tags: ['database', 'tutorial'],
      },
      {
        title: 'Redis as a Caching Layer for Node.js',
        slug: 'redis-cache-layer-nodejs',
        body: `<p>Redis is an in-memory data structure store used as a database, cache, and message broker. Adding a Redis cache in front of expensive database queries or external API calls can reduce response times from hundreds of milliseconds to single-digit milliseconds.</p>
<p>The cache-aside pattern is the simplest approach: check Redis first; on a miss, query the database, store the result in Redis with a TTL, and return it. On the next request, the cache hits and the database is not touched.</p>
<h2>Cache Invalidation</h2>
<p>Cache invalidation is notoriously hard. The safest strategies: time-based TTLs (accept some staleness) or event-driven invalidation (delete cache keys when the underlying data changes). Avoid trying to update the cache synchronously with writes — it leads to race conditions.</p>`,
        tags: ['database'],
      },
      {
        title: 'Database Transactions and ACID Properties',
        slug: 'database-transactions-acid',
        body: `<p>A transaction is a unit of work that either completes fully or not at all. ACID — Atomicity, Consistency, Isolation, Durability — defines the guarantees a transaction provides. These guarantees are what make relational databases trustworthy for financial, medical, and other critical data.</p>
<p>Atomicity: all operations in a transaction succeed or all are rolled back. Consistency: a transaction brings the database from one valid state to another. Isolation: concurrent transactions don't see each other's intermediate state. Durability: committed transactions survive crashes.</p>
<h2>Isolation Levels</h2>
<p>SQL defines four isolation levels: Read Uncommitted, Read Committed, Repeatable Read, and Serializable. Higher isolation means fewer anomalies (dirty reads, phantom reads) but more locking and lower throughput. Most applications work well with Read Committed.</p>`,
        tags: ['database'],
      },
      {
        title: 'Full-Text Search in MySQL',
        slug: 'full-text-search-mysql',
        body: `<p>MySQL's built-in full-text search (FTS) lets you search text columns far more effectively than <code>LIKE '%keyword%'</code>. FTS indexes inverted lists of words, enabling relevance ranking, boolean mode queries, and phrase searches.</p>
<p>Add a FULLTEXT index to one or more text columns and query with <code>MATCH(col) AGAINST('keyword' IN NATURAL LANGUAGE MODE)</code>. MySQL returns rows ordered by relevance score automatically.</p>
<h2>Boolean Mode</h2>
<p>Boolean mode gives you operators: <code>+word</code> (must include), <code>-word</code> (must exclude), <code>"phrase"</code> (exact phrase). It's powerful for search boxes where users expect Google-like query syntax. For more advanced needs, consider Elasticsearch or Meilisearch.</p>`,
        tags: ['database'],
      },
      {
        title: 'Database Connection Pooling Explained',
        slug: 'database-connection-pooling',
        body: `<p>Opening a new database connection for every request is expensive — TCP handshake, TLS negotiation, authentication, and session setup can add tens of milliseconds of latency. Connection pooling reuses existing connections, reducing overhead dramatically.</p>
<p>A pool maintains a fixed number of connections. When a request needs the database, it borrows a connection from the pool, uses it, and returns it. If all connections are in use, the request waits — up to a configurable timeout.</p>
<h2>Pool Sizing</h2>
<p>The right pool size depends on your database server's max connections and your app's concurrency. A common heuristic: <code>pool_size = (core_count * 2) + effective_spindle_count</code>. Measure under load — too few connections creates queue buildup; too many exhausts database resources.</p>`,
        tags: ['database'],
      },
      {
        title: 'NoSQL vs SQL: When to Use a Document Database',
        slug: 'nosql-vs-sql-document-database',
        body: `<p>SQL databases store structured data in tables with fixed schemas. NoSQL document databases (MongoDB, Firestore, DynamoDB) store data as flexible JSON-like documents. Neither is universally better — the right choice depends on your data shape and access patterns.</p>
<p>SQL excels when your data is relational (many-to-many relationships), when you need complex queries, or when data integrity is non-negotiable. Document databases excel when your data naturally fits a document shape, when schema flexibility is needed, or when you need horizontal write scalability.</p>
<h2>The Schema-On-Write vs Schema-On-Read Trade-off</h2>
<p>SQL enforces schema on write — invalid data is rejected. Document databases apply schema on read — any document can be stored, but reading code must handle variation. Schema-on-write is safer for critical data; schema-on-read is more flexible for evolving data models.</p>`,
        tags: ['database'],
      },
      {
        title: 'Database Design Patterns for Developers',
        slug: 'database-design-patterns',
        body: `<p>Good database design is as important as good application code. Common patterns — like the entity-attribute-value (EAV) model, polymorphic associations, and the adjacency list for hierarchies — each solve specific problems but come with trade-offs.</p>
<p>The adjacency list (each row stores its parent's ID) is the simplest tree representation in SQL. It's easy to query for direct children but expensive for deep hierarchies. Nested sets or closure tables support efficient subtree queries at the cost of more complex writes.</p>
<h2>Soft Deletes</h2>
<p>Instead of physically deleting rows, add a <code>deleted_at</code> timestamp column and filter it in queries. Soft deletes preserve history, enable undo functionality, and avoid cascading foreign key issues. The trade-off: queries must always include the filter, and the table grows over time.</p>`,
        tags: ['database'],
      },
    ];

    for (const post of posts) {
      await queryRunner.query(
        `INSERT INTO posts (title, slug, body, status, author_id, published_at)
         VALUES (?, ?, ?, 'published', ?, ?)
         ON DUPLICATE KEY UPDATE id = id`,
        [post.title, post.slug, post.body, adminId, now],
      );

      const rows = (await queryRunner.query(
        `SELECT id FROM posts WHERE slug = ? LIMIT 1`,
        [post.slug],
      )) as { id: number }[];
      if (!rows.length) continue;
      const postId = rows[0].id;

      for (const slug of post.tags) {
        const tRows = (await queryRunner.query(
          `SELECT id FROM tags WHERE slug = ? LIMIT 1`,
          [slug],
        )) as { id: number }[];
        if (!tRows.length) continue;
        await queryRunner.query(
          `INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)`,
          [postId, tRows[0].id],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const slugs = [
      'nestjs-dependency-injection-deep-dive','building-rest-apis-with-nestjs',
      'nestjs-guards-authorization','nestjs-pipes-request-validation',
      'nestjs-interceptors-explained','testing-nestjs-applications-jest',
      'nestjs-websockets-real-time','nestjs-graphql-practical-guide',
      'nestjs-microservices-redis','nestjs-configuration-management',
      'typescript-generics-explained','typescript-utility-types',
      'typescript-decorators-complete-guide','typescript-strict-mode-guide',
      'advanced-typescript-patterns','typescript-with-react-best-practices',
      'typescript-enums-vs-union-types','typescript-type-guards-narrowing',
      'typescript-mapped-types','docker-for-nodejs-developers',
      'git-workflow-for-teams','vscode-tips-typescript-developers',
      'ci-cd-github-actions','linux-commands-every-developer-should-know',
      'http-protocol-fundamentals','rest-vs-graphql-api-style',
      'authentication-best-practices-web-apps','writing-clean-code-principles',
      'css-grid-vs-flexbox','css-custom-properties-in-depth',
      'css-animations-and-transitions','responsive-design-media-queries',
      'css-architecture-bem-vs-utility-first','dark-mode-css-tailwind',
      'css-shapes-and-clip-path','modern-css-reset',
      'css-container-queries','tailwind-css-best-practices',
      'mysql-index-optimization-guide','postgresql-vs-mysql-choosing',
      'database-normalization-explained','sql-joins-explained',
      'redis-cache-layer-nodejs','database-transactions-acid',
      'full-text-search-mysql','database-connection-pooling',
      'nosql-vs-sql-document-database','database-design-patterns',
    ];
    for (const slug of slugs) {
      await queryRunner.query(`DELETE FROM posts WHERE slug = ?`, [slug]);
    }
  }
}
