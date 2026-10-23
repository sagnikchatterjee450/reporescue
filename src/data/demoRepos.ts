import { RepoAnalysisData, RepoComparisonData } from '../types';

export const TASKFLOW_DEMO_REPO: RepoAnalysisData = {
  isDemo: true,
  repoUrl: 'https://github.com/open-source/taskflow',
  owner: 'open-source',
  repoName: 'TaskFlow',
  description: 'An open-source real-time task management and team collaboration engine built with React, Express, PostgreSQL, and WebSockets.',
  stars: 4820,
  forks: 610,
  openIssuesCount: 24,
  license: 'MIT',
  defaultBranch: 'main',
  quickStats: {
    totalFiles: 42,
    linesOfCodeApprox: '14,200',
    primaryLanguage: 'TypeScript',
    lastCommit: '2 days ago',
  },
  techStack: [
    {
      category: 'Frontend',
      name: 'React 19 & Vite',
      description: 'Modern SPA UI framework with Vite build toolchain and Tailwind CSS styling.',
    },
    {
      category: 'Backend',
      name: 'Node.js & Express',
      description: 'RESTful API server with TypeScript, route validation middleware, and JWT authentication.',
    },
    {
      category: 'Database',
      name: 'PostgreSQL & Drizzle ORM',
      description: 'Relational database persistence with strictly typed schemas and automated migrations.',
    },
    {
      category: 'Infrastructure',
      name: 'Docker & GitHub Actions',
      description: 'Containerized deployment setups and automated CI/CD pipelines for linting and testing.',
    },
    {
      category: 'Testing',
      name: 'Vitest & React Testing Library',
      description: 'Unit testing suite for API service handlers and key component rendering workflows.',
    },
  ],
  architectureMap: [
    {
      id: 'frontend-entry',
      label: 'React Frontend App',
      category: 'Frontend',
      description: 'Client-side SPA containing dashboard views, board canvases, and task cards.',
      importantFiles: ['src/App.tsx', 'src/main.tsx', 'src/components/TaskBoard.tsx'],
      dependencies: ['React Router', 'Tailwind CSS', 'Lucide React'],
      relatedNodes: ['auth-service', 'api-client'],
      suggestedFilesToRead: ['src/App.tsx', 'src/components/TaskBoard.tsx'],
      x: 150,
      y: 100,
    },
    {
      id: 'api-client',
      label: 'HTTP & WebSocket Client',
      category: 'Frontend',
      description: 'Fetch wrappers and real-time Socket.io listeners connecting client to Express routes.',
      importantFiles: ['src/services/api.ts', 'src/services/socket.ts'],
      dependencies: ['Axios', 'Socket.io-client'],
      relatedNodes: ['express-server', 'websocket-server'],
      suggestedFilesToRead: ['src/services/api.ts'],
      x: 150,
      y: 260,
    },
    {
      id: 'express-server',
      label: 'Express REST Server',
      category: 'Backend',
      description: 'Core backend application serving RESTful routes for tasks, boards, and user profiles.',
      importantFiles: ['server/index.ts', 'server/routes/tasks.ts', 'server/routes/auth.ts'],
      dependencies: ['Express', 'Cors', 'Zod', 'JsonWebToken'],
      relatedNodes: ['auth-service', 'db-layer', 'websocket-server'],
      suggestedFilesToRead: ['server/index.ts', 'server/routes/tasks.ts'],
      x: 450,
      y: 100,
    },
    {
      id: 'auth-service',
      label: 'JWT Auth & Middleware',
      category: 'Auth',
      description: 'Handles user registration, password hashing with bcrypt, JWT token signing & verification.',
      importantFiles: ['server/middleware/auth.ts', 'server/services/authService.ts'],
      dependencies: ['bcryptjs', 'jsonwebtoken'],
      relatedNodes: ['express-server', 'db-layer'],
      suggestedFilesToRead: ['server/middleware/auth.ts'],
      x: 450,
      y: 260,
    },
    {
      id: 'websocket-server',
      label: 'Socket.io Real-time Hub',
      category: 'Services',
      description: 'Broadcasts live task edits, cursor movements, and notification triggers to connected clients.',
      importantFiles: ['server/socket/hub.ts'],
      dependencies: ['socket.io'],
      relatedNodes: ['express-server', 'api-client'],
      suggestedFilesToRead: ['server/socket/hub.ts'],
      x: 450,
      y: 400,
    },
    {
      id: 'db-layer',
      label: 'PostgreSQL & Drizzle ORM',
      category: 'Database',
      description: 'Relational data store mapping Users, Boards, Tasks, and Comments tables.',
      importantFiles: ['server/db/schema.ts', 'server/db/connection.ts'],
      dependencies: ['drizzle-orm', 'pg'],
      relatedNodes: ['express-server', 'auth-service'],
      suggestedFilesToRead: ['server/db/schema.ts'],
      x: 750,
      y: 180,
    },
  ],
  startHerePath: [
    {
      stepNumber: 1,
      filePath: 'README.md',
      title: 'Project Purpose & Environment Overview',
      why: 'Understand the overarching goal of TaskFlow, installation prerequisites, and environment setup variables.',
      keyConcepts: ['Monorepo Structure', 'Environment Variables', 'Quick Start Commands'],
      estimatedReadingTime: '3 mins',
    },
    {
      stepNumber: 2,
      filePath: 'server/index.ts',
      title: 'Main Express Server Entry Point',
      why: 'Learn how middleware (CORS, JSON parser, Auth) and API routes are attached to the Express application.',
      keyConcepts: ['Express Bootstrap', 'Route Mounting', 'Server Configuration'],
      estimatedReadingTime: '5 mins',
    },
    {
      stepNumber: 3,
      filePath: 'server/db/schema.ts',
      title: 'Database Schema & Domain Models',
      why: 'Grasp the core domain entities: Users, Boards, Columns, Tasks, and Comments.',
      keyConcepts: ['Relational Schema', 'Type Safe Database Models', 'Foreign Key Relations'],
      estimatedReadingTime: '6 mins',
    },
    {
      stepNumber: 4,
      filePath: 'src/components/TaskBoard.tsx',
      title: 'Primary User Interface & Drag-Drop Logic',
      why: 'See how client components query task data from the backend and render column-based board state.',
      keyConcepts: ['React State Management', 'Event Handling', 'Optimistic UI Updates'],
      estimatedReadingTime: '7 mins',
    },
  ],
  contributionTasks: [
    {
      id: 'task-1',
      title: 'Add loading skeleton state to UserProfile dropdown',
      difficulty: 'Beginner',
      difficultyColor: 'green',
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
      filesInvolved: ['src/components/UserProfile.tsx'],
      estimatedTime: '1–2 hours',
      whyGoodFirstContribution: 'This task requires understanding one isolated component and does not modify the application’s core backend architecture or database schemas.',
      description: 'When loading user profile details over slow network connections, the profile avatar briefly displays blank text before loading. Adding a pulsing Tailwind skeleton loader improves UX.',
      stepsToComplete: [
        'Open `src/components/UserProfile.tsx`',
        'Check the `isLoading` flag from `useAuth()` hook',
        'Render a `<div className="animate-pulse bg-slate-700 h-8 w-8 rounded-full" />` placeholder while loading',
        'Add a simple unit test in `src/components/__tests__/UserProfile.test.tsx`',
      ],
      issueNumber: 104,
    },
    {
      id: 'task-2',
      title: 'Fix edge case in Task Search filtering by tag',
      difficulty: 'Beginner',
      difficultyColor: 'green',
      skills: ['TypeScript', 'Array Utilities'],
      filesInvolved: ['src/utils/filterTasks.ts'],
      estimatedTime: '2 hours',
      whyGoodFirstContribution: 'Focused pure function utility file with existing unit tests; easy to reproduce and test locally.',
      description: 'Searching for multi-word tag names like "bug fix" fails if extra whitespace is present in input query string.',
      stepsToComplete: [
        'Inspect `src/utils/filterTasks.ts` string normalization helper',
        'Trim whitespace and sanitize tag strings before comparing',
        'Verify test suite passes via `npm test`',
      ],
      issueNumber: 112,
    },
    {
      id: 'task-3',
      title: 'Implement REST endpoint rate limiting middleware',
      difficulty: 'Intermediate',
      difficultyColor: 'yellow',
      skills: ['Node.js', 'Express', 'Security Middleware'],
      filesInvolved: ['server/middleware/rateLimiter.ts', 'server/index.ts'],
      estimatedTime: '3–4 hours',
      whyGoodFirstContribution: 'Good introduction to Express middleware patterns and request lifecycle handling.',
      description: 'Public login routes currently lack request rate limiting, making them vulnerable to brute-force credential stuffing.',
      stepsToComplete: [
        'Create `server/middleware/rateLimiter.ts` using express-rate-limit logic or in-memory sliding window',
        'Apply rate limiter specifically to `/server/routes/auth.ts` endpoints',
        'Return HTTP 429 Too Many Requests when threshold exceeded',
      ],
      issueNumber: 88,
    },
    {
      id: 'task-4',
      title: 'Refactor WebSocket Hub to handle automatic client reconnects gracefully',
      difficulty: 'Advanced',
      difficultyColor: 'red',
      skills: ['Node.js', 'Socket.io', 'Async Concurrency'],
      filesInvolved: ['server/socket/hub.ts', 'src/services/socket.ts'],
      estimatedTime: '1 day',
      whyGoodFirstContribution: 'Ideal for experienced contributors interested in real-time architecture and state synchronization.',
      description: 'When client connections drop briefly during network changes, pending board change events are occasionally lost before socket re-establishes.',
      stepsToComplete: [
        'Add event sequence numbering to server broadcast queue',
        'Implement reconnection handshake event requesting missed delta payloads',
        'Add client-side buffer for offline actions',
      ],
      issueNumber: 64,
    },
  ],
  healthDashboard: {
    overallScore: 78,
    gradeLabel: '78/100 — Good',
    summary: 'TaskFlow features a well-structured TypeScript codebase with clean separation between Express API endpoints and React components. Documentation and architecture are solid, though automated test coverage could be expanded.',
    categories: {
      architecture: {
        name: 'Architecture',
        score: 82,
        maxScore: 100,
        description: 'Clear separation of concerns between client UI, Express router, and PostgreSQL database layer.',
        feedback: [
          'Excellent modularization of API routes and database schemas',
          'Clean domain boundaries for tasks and user authentication',
        ],
      },
      documentation: {
        name: 'Documentation',
        score: 68,
        maxScore: 100,
        description: 'Covers installation and basic setup, but lacks environment variable details and API documentation.',
        feedback: [
          'README includes clear quickstart steps',
          'Missing instructions for configuring PostgreSQL connection string in `.env`',
          'Lacks visual architecture diagram in repository documentation',
        ],
      },
      testing: {
        name: 'Testing',
        score: 71,
        maxScore: 100,
        description: 'Vitest setup is present with unit tests for utility functions, but integration tests for API routes are sparse.',
        feedback: [
          'Unit test coverage on utils is 85%',
          'Express API routes need endpoint integration tests',
        ],
      },
      codeOrganization: {
        name: 'Code Organization',
        score: 87,
        maxScore: 100,
        description: 'Consistent directory naming, strict TypeScript configurations, and clear component folder layout.',
        feedback: [
          'Strict TypeScript mode enabled with minimal use of `any` types',
          'Clean component hierarchy with custom hook abstractions',
        ],
      },
      contributorFriendliness: {
        name: 'Contributor Friendliness',
        score: 82,
        maxScore: 100,
        description: 'Good beginner issue labeling and straightforward npm scripts for local development.',
        feedback: [
          'Good first issues are clearly tagged',
          'Easy setup command (`npm run dev`) boots both server and client',
        ],
      },
      codeComplexity: {
        name: 'Code Complexity',
        score: 88,
        maxScore: 100,
        description: 'Average Cyclomatic Complexity is 4.8 (Low risk). Functions are short and maintainable.',
        feedback: [
          '78% of functions have minimal decision branching (complexity 1-5)',
          'Hotspot detected: `server/routes/tasks.ts` has a max complexity of 12 (needs minor refactoring)',
        ],
      },
      testCoverage: {
        name: 'Test Coverage',
        score: 71,
        maxScore: 100,
        description: 'Estimated test coverage is 71% (~10,082 lines covered out of 14,200).',
        feedback: [
          'Vitest test suite covers core utilities and REST endpoints',
          'Untested critical modules: `server/socket/hub.ts` and `server/middleware/rateLimiter.ts`',
        ],
      },
      dependencyFreshness: {
        name: 'Dependency Freshness',
        score: 85,
        maxScore: 100,
        description: '22 out of 28 dependencies are on their latest release with 0 known CVE vulnerabilities.',
        feedback: [
          'Zero known security vulnerabilities detected across all packages',
          'Major update available for `express` (v4.18.2 → v5.0.1) and `drizzle-orm` (v0.29.3 → v0.36.0)',
        ],
      },
    },
    metrics: {
      codeComplexity: {
        cyclomaticComplexityAvg: 4.8,
        rating: 'Low',
        maxFileComplexity: {
          file: 'server/routes/tasks.ts',
          complexity: 12,
        },
        complexityDistribution: {
          simple: 78,
          moderate: 18,
          complex: 4,
        },
        explanation: 'Cyclomatic complexity measures the number of linearly independent execution paths through source code (e.g., branches formed by `if`, `for`, `while`, `case`, and `catch`). An average below 10 indicates clean, easily testable logic with minimal cognitive overhead.',
        impactOnHealthScore: 'Contributes 15% to overall health score. Low complexity reduces regression risk and makes code significantly easier for new contributors to understand and refactor safely.',
      },
      testCoverage: {
        estimatedPercentage: 71,
        rating: 'Good',
        linesCoveredApprox: 10082,
        totalLinesApprox: 14200,
        untestedCriticalModules: ['server/socket/hub.ts', 'server/middleware/rateLimiter.ts'],
        testRunner: 'Vitest & React Testing Library',
        explanation: 'Estimated test coverage calculates the ratio of source code statements executed during automated test suite runs versus total codebase lines. Higher coverage protects against breaking changes during pull request merges.',
        impactOnHealthScore: 'Contributes 20% to overall health score. A 70%+ score indicates strong safety nets for common paths, though uncovered real-time WebSocket handlers slightly increase production bug risk.',
      },
      dependencyFreshness: {
        freshnessScore: 85,
        totalDependencies: 28,
        upToDateCount: 22,
        minorOutdatedCount: 4,
        majorOutdatedCount: 2,
        knownVulnerabilitiesCount: 0,
        outdatedPackages: [
          { name: 'express', currentVersion: '4.18.2', latestVersion: '5.0.1', status: 'Major update' },
          { name: 'socket.io', currentVersion: '4.7.2', latestVersion: '4.8.1', status: 'Minor update' },
          { name: 'drizzle-orm', currentVersion: '0.29.3', latestVersion: '0.36.0', status: 'Major update' },
          { name: 'lucide-react', currentVersion: '0.344.0', latestVersion: '0.460.0', status: 'Minor update' },
        ],
        explanation: 'Dependency freshness evaluates how closely manifest dependencies match current npm releases and checks for published security advisories (CVEs). Fresh packages ensure stability and security.',
        impactOnHealthScore: 'Contributes 15% to overall health score. Zero security vulnerabilities yields a high baseline, though lagging behind major releases introduces future technical debt when upgrading.',
      },
    },
  },
  readmeImprovements: [
    {
      title: 'Environment Variables Documentation',
      status: 'Missing',
      recommendation: 'Add a section detailing required `.env` keys such as `DATABASE_URL`, `JWT_SECRET`, and `PORT`.',
      suggestedMarkdown: `### 🔑 Environment Variables

Copy \`.env.example\` to \`.env\` and configure the following parameters:

\`\`\`env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskflow_db

# Security & Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
\`\`\``,
    },
    {
      title: 'Architecture & Directory Overview',
      status: 'Needs Improvement',
      recommendation: 'Include a concise visual directory map explaining where server code, client views, and database migrations live.',
      suggestedMarkdown: `### 🏗️ Directory Architecture

\`\`\`text
taskflow/
├── server/               # Express Backend Application
│   ├── db/               # PostgreSQL Connection & Drizzle Schemas
│   ├── middleware/       # JWT Auth & Validation Middleware
│   ├── routes/           # RESTful API Route Handlers
│   └── socket/           # Real-time Socket.io Hub
├── src/                  # React Frontend Application
│   ├── components/       # Board, Task, and User UI Components
│   ├── services/         # API & Socket Client Service Layer
│   └── utils/            # Helper Utilities
└── README.md
\`\`\``,
    },
    {
      title: 'Local Database Setup Guide',
      status: 'Missing',
      recommendation: 'Provide Docker Compose setup steps for quick PostgreSQL local instantiation.',
      suggestedMarkdown: `### 🗄️ Local PostgreSQL Setup

Use Docker to spin up a local PostgreSQL database container instantly:

\`\`\`bash
docker-compose up -d db
npm run db:migrate
\`\`\``,
    },
  ],
  readmeContent: `# TaskFlow

An open-source real-time task management and team collaboration engine built with React, Express, PostgreSQL, and WebSockets.

## Features

- 📋 Interactive Kanban Task Boards
- ⚡ Real-time updates via Socket.io
- 🔒 JWT User Authentication
- 🎨 Modern UI with Tailwind CSS

## Quick Start

1. Clone repository
2. Run \`npm install\`
3. Run \`npm run dev\`

Open http://localhost:3000 in your browser.`,
  fileTree: [
    {
      path: 'README.md',
      name: 'README.md',
      type: 'file',
      important: true,
      content: `# TaskFlow\n\nAn open-source real-time task management and team collaboration engine built with React, Express, PostgreSQL, and WebSockets.\n\n## Quick Start\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``,
    },
    {
      path: 'package.json',
      name: 'package.json',
      type: 'file',
      important: true,
      content: `{\n  "name": "taskflow",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "tsx server/index.ts",\n    "build": "vite build",\n    "test": "vitest"\n  }\n}`,
    },
    {
      path: 'server',
      name: 'server',
      type: 'directory',
      children: [
        {
          path: 'server/index.ts',
          name: 'index.ts',
          type: 'file',
          important: true,
          content: `import express from 'express';\nimport cors from 'cors';\nimport { taskRouter } from './routes/tasks';\nimport { authRouter } from './routes/auth';\nimport { authMiddleware } from './middleware/auth';\n\nconst app = express();\napp.use(cors());\napp.use(express.json());\n\napp.use('/api/auth', authRouter);\napp.use('/api/tasks', authMiddleware, taskRouter);\n\napp.listen(3000, () => {\n  console.log('TaskFlow Server running on port 3000');\n});`,
        },
        {
          path: 'server/routes/tasks.ts',
          name: 'tasks.ts',
          type: 'file',
          important: true,
          content: `import { Router } from 'express';\nexport const taskRouter = Router();\n\ntaskRouter.get('/', async (req, res) => {\n  res.json({ tasks: [] });\n});\n\ntaskRouter.post('/', async (req, res) => {\n  const { title, description } = req.body;\n  res.status(201).json({ id: 'task-1', title, description });\n});`,
        },
        {
          path: 'server/middleware/auth.ts',
          name: 'auth.ts',
          type: 'file',
          important: true,
          content: `import { Request, Response, NextFunction } from 'express';\nimport jwt from 'jsonwebtoken';\n\nexport function authMiddleware(req: Request, res: Response, next: NextFunction) {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');\n    (req as any).user = decoded;\n    next();\n  } catch (err) {\n    res.status(401).json({ error: 'Invalid Token' });\n  }\n}`,
        },
        {
          path: 'server/db/schema.ts',
          name: 'schema.ts',
          type: 'file',
          important: true,
          content: `import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';\n\nexport const users = pgTable('users', {\n  id: serial('id').primaryKey(),\n  email: text('email').notNull().unique(),\n  passwordHash: text('password_hash').notNull(),\n});\n\nexport const tasks = pgTable('tasks', {\n  id: serial('id').primaryKey(),\n  title: text('title').notNull(),\n  status: text('status').default('todo'),\n  createdAt: timestamp('created_at').defaultNow(),\n});`,
        },
      ],
    },
    {
      path: 'src',
      name: 'src',
      type: 'directory',
      children: [
        {
          path: 'src/App.tsx',
          name: 'App.tsx',
          type: 'file',
          important: true,
          content: `import React from 'react';\nimport { TaskBoard } from './components/TaskBoard';\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-slate-900 text-white p-6">\n      <TaskBoard />\n    </div>\n  );\n}`,
        },
        {
          path: 'src/components/TaskBoard.tsx',
          name: 'TaskBoard.tsx',
          type: 'file',
          important: true,
          content: `import React, { useState } from 'react';\n\nexport function TaskBoard() {\n  const [tasks, setTasks] = useState([\n    { id: '1', title: 'Setup database schema', status: 'done' },\n    { id: '2', title: 'Implement user auth middleware', status: 'in-progress' }\n  ]);\n\n  return (\n    <div className="p-4 border rounded-xl bg-slate-800 border-slate-700">\n      <h2 className="text-xl font-bold mb-4">TaskFlow Board</h2>\n      <div className="space-y-2">\n        {tasks.map(t => (\n          <div key={t.id} className="p-3 bg-slate-700 rounded-lg">{t.title}</div>\n        ))}\n      </div>\n    </div>\n  );\n}`,
        },
      ],
    },
  ],
};

export const SAMPLE_COMPARISON_DATA: RepoComparisonData = {
  repoA: {
    name: 'TaskFlow',
    url: 'https://github.com/open-source/taskflow',
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Socket.io'],
    architectureScore: 82,
    documentationScore: 68,
    beginnerFriendlyScore: 82,
    overallScore: 78,
  },
  repoB: {
    name: 'MiniExpress',
    url: 'https://github.com/open-source/miniexpress',
    techStack: ['TypeScript', 'Node.js', 'Redis', 'Jest'],
    architectureScore: 88,
    documentationScore: 91,
    beginnerFriendlyScore: 84,
    overallScore: 88,
  },
  aiComparisonSummary: 'TaskFlow is a full-stack web application combining a React frontend, Express API server, PostgreSQL database, and Socket.io real-time layer. In contrast, MiniExpress is a lightweight server-side web framework utility focused on high performance and minimal memory footprint. TaskFlow is ideal for full-stack React developers, while MiniExpress suit developers interested in low-level HTTP routing and middleware execution.',
  keyDifferences: [
    {
      category: 'Primary Purpose',
      diffA: 'Full-stack task management application with visual UI & real-time collaboration.',
      diffB: 'Lightweight HTTP server routing micro-framework for high-throughput microservices.',
    },
    {
      category: 'Database & Persistence',
      diffA: 'PostgreSQL database managed with Drizzle ORM schemas.',
      diffB: 'In-memory Redis caching with zero required relational persistence.',
    },
    {
      category: 'Contributor Entry Point',
      diffA: 'React components (`src/components/TaskBoard.tsx`) and REST API handlers.',
      diffB: 'HTTP Middleware pipeline (`src/router.ts`) and socket buffers.',
    },
  ],
};
