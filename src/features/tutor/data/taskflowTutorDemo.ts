import { RepoModel } from '../types';

export const TASKFLOW_TUTOR_MODEL: RepoModel = {
  repoUrl: 'https://github.com/open-source/taskflow',
  owner: 'open-source',
  repoName: 'taskflow',
  commitSha: 'a8f4c2e1',
  summary:
    'TaskFlow is an enterprise-grade async task orchestration and distributed workflow queue engine built with TypeScript, Node.js, and Redis.',
  intendedAudience:
    'Backend & Full-Stack engineers building distributed services, background queues, and resilient task pipelines with strict retry guarantees.',
  techStack: [
    {
      category: 'Language',
      name: 'TypeScript',
      version: '5.8',
      whyUsed: 'Provides end-to-end type safety across distributed task payloads and worker state machines.',
    },
    {
      category: 'Runtime',
      name: 'Node.js',
      version: '>=20.0.0',
      whyUsed: 'High-throughput asynchronous I/O optimized for handling concurrent job streams.',
    },
    {
      category: 'Datastore',
      name: 'Redis',
      version: '7.x',
      whyUsed: 'Used for atomic job leasing via Lua scripts, delayed sorting sets, and pub/sub worker heartbeats.',
    },
    {
      category: 'Testing',
      name: 'Vitest',
      version: '3.x',
      whyUsed: 'Sub-second in-memory test runner for mocking Redis pipelines and concurrency race conditions.',
    },
    {
      category: 'Build',
      name: 'tsup / esbuild',
      version: '8.x',
      whyUsed: 'Zero-config high-performance bundler producing ESM and CJS exports with tree-shaking.',
    },
  ],
  entryPoints: [
    {
      file: 'src/index.ts',
      purpose: 'Public API entry point exporting TaskFlowQueue, Worker, FlowProducer, and type definitions.',
      exports: ['TaskFlowQueue', 'Worker', 'FlowProducer', 'Job', 'QueueEvents'],
    },
    {
      file: 'src/server.ts',
      purpose: 'Standalone telemetry and dashboard monitoring HTTP server with WebSocket live probers.',
      exports: ['startMonitoringServer', 'metricsRouter'],
    },
    {
      file: 'src/cli/index.ts',
      purpose: 'Command line interface for managing worker pools, inspecting stalled jobs, and running migrations.',
      exports: ['cliRunner'],
    },
  ],
  modules: [
    {
      id: 'queue-core',
      name: 'Queue Core & Dispatcher',
      purpose: 'Manages job ingestion, prioritization, deduplication keys, and delayed scheduling sets in Redis.',
      keyFiles: ['src/core/Queue.ts', 'src/core/Job.ts', 'src/core/JobStore.ts'],
      dependsOn: ['redis-connection'],
      exports: ['Queue', 'Job', 'JobStatus'],
      complexity: 'Moderate',
    },
    {
      id: 'worker-pool',
      name: 'Worker Execution Pool',
      purpose: 'Authoritative task consumer with exponential backoff retry algorithms, concurrency limits, and sandbox isolation.',
      keyFiles: ['src/workers/Worker.ts', 'src/workers/ConcurrencyManager.ts', 'src/workers/SandboxRunner.ts'],
      dependsOn: ['queue-core', 'redis-connection'],
      exports: ['Worker', 'WorkerOptions', 'SandboxProcess'],
      complexity: 'High',
    },
    {
      id: 'redis-connection',
      name: 'Redis Connection & Lua Scripts',
      purpose: 'Encapsulates resilient connection pooling, cluster auto-failover, and atomic Lua scripts for zero-lock leases.',
      keyFiles: ['src/redis/RedisClient.ts', 'src/redis/lua/moveToActive.lua', 'src/redis/lua/retryJob.lua'],
      dependsOn: [],
      exports: ['RedisConnectionPool', 'executeLuaScript'],
      complexity: 'Moderate',
    },
    {
      id: 'telemetry-metrics',
      name: 'Observability & Metrics',
      purpose: 'Collects Prometheus-compatible throughput histograms, queue latency percentiles, and error rate counters.',
      keyFiles: ['src/telemetry/MetricsCollector.ts', 'src/telemetry/PrometheusExporter.ts'],
      dependsOn: ['queue-core'],
      exports: ['MetricsCollector', 'getPrometheusMetrics'],
      complexity: 'Low',
    },
  ],
  flows: [
    {
      id: 'job-enqueue-and-process',
      name: 'Job Enqueue to Worker Execution',
      description: 'End-to-end lifecycle when a producer dispatches a job until a worker acknowledges completion.',
      steps: [
        {
          stepNumber: 1,
          file: 'src/core/Queue.ts',
          action: 'Producer calls queue.add("taskName", payload, opts)',
          description: 'Generates deterministic UUID or deduplication key, serializes JSON payload.',
        },
        {
          stepNumber: 2,
          file: 'src/redis/lua/moveToActive.lua',
          action: 'Atomic Redis multi-exec zadd / lpush',
          description: 'Places job in wait queue or delayed sorted set with timestamp score.',
        },
        {
          stepNumber: 3,
          file: 'src/workers/Worker.ts',
          action: 'Worker lease poller invokes moveToActive',
          description: 'Locks job lease for workerId, transitions state to active, resets heartbeat timer.',
        },
        {
          stepNumber: 4,
          file: 'src/workers/SandboxRunner.ts',
          action: 'Handler executes user logic inside child thread',
          description: 'Monitors memory threshold and timeouts. Emits progress events.',
        },
        {
          stepNumber: 5,
          file: 'src/core/JobStore.ts',
          action: 'Finalize status (completed or failed)',
          description: 'Saves return result, evicts lock, and broadcasts QueueEvents to subscribers.',
        },
      ],
      sequenceMermaid: `sequenceDiagram
  autonumber
  actor Client as Producer Client
  participant Queue as Queue (Queue.ts)
  participant Redis as Redis Lua Scripts
  participant Worker as Worker (Worker.ts)
  participant Runner as SandboxRunner

  Client->>Queue: queue.add(name, data, opts)
  Queue->>Redis: EVALSHA moveToActive / ZADD delayed
  Redis-->>Queue: Job ID: job_7x91
  Queue-->>Client: Job Instance Returned
  Worker->>Redis: Atomic BRPOPLPUSH (lease lock)
  Redis-->>Worker: job_7x91 Payload
  Worker->>Runner: execute(job) in sandbox
  Runner-->>Worker: Success Return Value
  Worker->>Redis: ZREM active / HSET completed`,
    },
  ],
  keyConceptsAndGlossary: [
    {
      term: 'Atomic Lease',
      definition: 'A time-bounded lock acquired via Redis Lua script guaranteeing that only one worker processes a job at any given moment.',
      whereUsed: 'src/redis/lua/moveToActive.lua',
    },
    {
      term: 'Stalled Job',
      definition: 'A job whose worker process crashed or failed to send a heartbeat within the stallInterval window, automatically re-queued.',
      whereUsed: 'src/workers/ConcurrencyManager.ts',
    },
    {
      term: 'Backoff Strategy',
      definition: 'Exponential or fixed delay algorithm applied between consecutive failed retry attempts.',
      whereUsed: 'src/core/Job.ts',
    },
    {
      term: 'Sandbox Isolation',
      definition: 'Running untrusted or memory-intensive job handlers inside Node.js Worker Threads to prevent parent process crash.',
      whereUsed: 'src/workers/SandboxRunner.ts',
    },
  ],
  configAndEnvVars: [
    {
      name: 'REDIS_URL',
      purpose: 'Connection URI for primary Redis cluster or standalone instance.',
      required: true,
      defaultValue: 'redis://127.0.0.1:6379',
      example: 'redis://:secret@redis-cluster.prod:6379/0',
    },
    {
      name: 'WORKER_CONCURRENCY',
      purpose: 'Maximum number of concurrent tasks a single worker process will lease simultaneously.',
      required: false,
      defaultValue: '10',
      example: '25',
    },
    {
      name: 'STALL_INTERVAL_MS',
      purpose: 'Time interval between worker heartbeat checks before declaring a task abandoned.',
      required: false,
      defaultValue: '30000',
      example: '15000',
    },
    {
      name: 'LOG_LEVEL',
      purpose: 'Verbosity for structured JSON logging (debug, info, warn, error).',
      required: false,
      defaultValue: 'info',
      example: 'debug',
    },
  ],
  setupSteps: [
    {
      id: 'step-1-install',
      category: 'install',
      command: 'npm install',
      description: 'Installs all production dependencies and TypeScript development compiler toolchains.',
      commonFailures: [
        'Node version mismatch: ensure you are using Node >= 20.x (check with node -v).',
        'Native binding issues with hiredis: fallback pure JS Redis driver will be used automatically.',
      ],
    },
    {
      id: 'step-2-env',
      category: 'install',
      command: 'cp .env.example .env',
      description: 'Copies default local environment configuration targeting local Redis on port 6379.',
      commonFailures: ['Ensure REDIS_URL has no trailing spaces.'],
    },
    {
      id: 'step-3-test',
      category: 'test',
      command: 'npm test',
      description: 'Executes Vitest test suite running 42 unit and integration tests with in-memory Redis mock.',
      commonFailures: [
        'If integration tests fail, ensure local Redis is running (e.g. docker run -p 6379:6379 redis:7-alpine).',
      ],
    },
    {
      id: 'step-4-run',
      category: 'run',
      command: 'npm run dev',
      description: 'Launches TypeScript compiler in watch mode with the example producer and worker daemon.',
      commonFailures: ['Port 3000 collision: set PORT=3001 in your .env file.'],
    },
    {
      id: 'step-5-build',
      category: 'build',
      command: 'npm run build',
      description: 'Generates bundled ESM and CJS distributions into dist/ folder.',
    },
  ],
  codeConventions: [
    {
      rule: 'All Redis mutations must be scripted',
      context: 'Never execute separate GET and SET commands without an atomic Lua script to prevent split-brain race conditions.',
      example: 'redisClient.evalSha(moveToActiveSha, ...)',
    },
    {
      rule: 'Explicit Error Classes',
      context: 'All operational errors must inherit from TaskFlowError with a machine-readable code.',
      example: 'throw new JobTimeoutError("Execution exceeded 60s limit", { jobId })',
    },
    {
      rule: 'Zero unhandled promise rejections in workers',
      context: 'Every worker task loop must be wrapped in a localized try-catch that updates JobStatus in Redis.',
      example: 'try { await job.process(); } catch (err) { await job.moveToFailed(err); }',
    },
  ],
  gotchas: [
    {
      title: 'Clock Drift in Distributed Nodes',
      description: 'Delayed jobs rely on Redis server time. If worker machines have out-of-sync clocks, delayed timing can skew by seconds.',
      mitigation: 'Always rely on Redis TIME command rather than client-side Date.now() when scheduling delayed tasks.',
      fileRef: 'src/core/Queue.ts',
    },
    {
      title: 'Lua Script Memory Limits',
      description: 'Extremely large batch operations in a single Lua script can block Redis main thread (>5ms).',
      mitigation: 'Paginate batch removals in chunks of 500 items max.',
      fileRef: 'src/redis/lua/retryJob.lua',
    },
  ],
  diagrams: {
    systemOverviewMermaid: `graph TD
  subgraph Producers["Producer Layer"]
    API[REST / GraphQL Services]
    Cron[Scheduled Cron Jobs]
  end

  subgraph Engine["TaskFlow Core Engine"]
    Queue["Queue Dispatcher<br/>(src/core/Queue.ts)"]
    Scheduler["Delayed Scheduler<br/>(src/core/JobStore.ts)"]
  end

  subgraph Datastore["State Store"]
    Redis[("Redis Cluster 7.x<br/>Queues & Delayed Sets")]
  end

  subgraph Workers["Worker Fleet"]
    W1["Worker Pool #1<br/>(Concurrency: 10)"]
    W2["Worker Pool #2<br/>(Concurrency: 10)"]
    Sandbox["Isolated Sandbox<br/>(Worker Threads)"]
  end

  API -->|queue.add| Queue
  Cron -->|queue.add| Queue
  Queue -->|Atomic LPush/ZAdd| Redis
  Scheduler -->|Poll Due Jobs| Redis
  Redis -->|BRPOPLPUSH| W1
  Redis -->|BRPOPLPUSH| W2
  W1 --> Sandbox
  W2 --> Sandbox`,
    moduleDependencyMermaid: `graph LR
  subgraph Data["Infrastructure"]
    RedisConn["redis-connection<br/>(src/redis/RedisClient.ts)"]
  end

  subgraph Core["Core Engine"]
    QueueCore["queue-core<br/>(src/core/Queue.ts)"]
  end

  subgraph Execution["Execution"]
    WorkerPool["worker-pool<br/>(src/workers/Worker.ts)"]
  end

  subgraph Observability["Observability"]
    Telemetry["telemetry-metrics<br/>(src/telemetry/MetricsCollector.ts)"]
  end

  QueueCore --> RedisConn
  WorkerPool --> QueueCore
  WorkerPool --> RedisConn
  Telemetry --> QueueCore`,
    sequenceFlows: [
      {
        flowId: 'job-enqueue-and-process',
        title: 'Producer Job Ingestion & Worker Execution',
        mermaid: `sequenceDiagram
  autonumber
  actor Client as Producer Client
  participant Queue as Queue (Queue.ts)
  participant Redis as Redis Lua
  participant Worker as Worker (Worker.ts)

  Client->>Queue: queue.add("email-send", data)
  Queue->>Redis: EVAL moveToActive.lua
  Redis-->>Queue: Job ID created
  Queue-->>Client: Job returned
  Worker->>Redis: Lease atomic poll
  Redis-->>Worker: Job payload
  Worker->>Worker: Process task
  Worker->>Redis: Mark completed`,
      },
      {
        flowId: 'worker-fail-retry',
        title: 'Task Failure & Exponential Backoff Retry',
        mermaid: `sequenceDiagram
  autonumber
  participant Worker as Worker
  participant Redis as Redis Delayed Set
  participant Scheduler as Retry Scheduler

  Worker->>Worker: Task throws Error
  Worker->>Redis: ZADD delayed (now + 2^attempt * 1000)
  Redis-->>Worker: Scheduled for retry
  Scheduler->>Redis: Scan ready jobs
  Scheduler->>Redis: Move to active queue`,
      },
    ],
  },
  guidedTour: [
    {
      stepNumber: 1,
      title: 'Repository Entry & Public Exports',
      files: ['src/index.ts', 'package.json'],
      whyItMatters: 'Understand how external applications import and initialize TaskFlow queues.',
      whatToNotice: [
        'Notice how TaskFlowQueue is exported as the main facade.',
        'Observe the peer dependencies on redis and typescript.',
      ],
      minutes: 4,
      difficulty: 'new_to_programming',
      roles: ['frontend', 'backend', 'reviewer'],
    },
    {
      stepNumber: 2,
      title: 'Queue Dispatcher & Job Ingestion',
      files: ['src/core/Queue.ts', 'src/core/Job.ts'],
      whyItMatters: 'The central dispatcher that transforms raw JavaScript payloads into durable job records.',
      whatToNotice: [
        'Check how idempotency keys prevent duplicate enqueues.',
        'See how opts.delay converts into Redis timestamps.',
      ],
      minutes: 6,
      difficulty: 'new_to_programming',
      roles: ['backend', 'reviewer'],
    },
    {
      stepNumber: 3,
      title: 'Atomic Redis State Transitions',
      files: ['src/redis/RedisClient.ts', 'src/redis/lua/moveToActive.lua'],
      whyItMatters: 'The foundation of zero-lock concurrency: all queue operations run atomically in Lua.',
      whatToNotice: [
        'Notice how KEYS and ARGV parameters are passed to redis.call().',
        'Observe how job locks prevent dual execution.',
      ],
      minutes: 8,
      difficulty: 'experienced_new_to_stack',
      roles: ['backend', 'devops'],
    },
    {
      stepNumber: 4,
      title: 'Worker Loop & Heartbeat Leases',
      files: ['src/workers/Worker.ts', 'src/workers/ConcurrencyManager.ts'],
      whyItMatters: 'How workers continuously poll, claim, and heartbeat active tasks.',
      whatToNotice: [
        'The stallInterval timer preventing deadlocked jobs.',
        'The Semaphore pattern used in ConcurrencyManager.',
      ],
      minutes: 7,
      difficulty: 'experienced_new_to_stack',
      roles: ['backend'],
    },
    {
      stepNumber: 5,
      title: 'Worker Threads Sandbox Isolation',
      files: ['src/workers/SandboxRunner.ts'],
      whyItMatters: 'Prevents heavy computational tasks or memory leaks from affecting the main daemon.',
      whatToNotice: [
        'The use of Node.js worker_threads API.',
        'Timeout enforcement terminating child threads if exceeded.',
      ],
      minutes: 5,
      difficulty: 'senior_architecture',
      roles: ['backend', 'devops'],
    },
    {
      stepNumber: 6,
      title: 'Metrics & Prometheus Exporter',
      files: ['src/telemetry/MetricsCollector.ts'],
      whyItMatters: 'How production performance is tracked: throughput, latency percentiles, error rates.',
      whatToNotice: [
        'Histogram buckets configured for job execution durations.',
        'Zero-allocation counters to keep GC overhead minimal.',
      ],
      minutes: 5,
      difficulty: 'experienced_new_to_stack',
      roles: ['devops', 'backend'],
    },
    {
      stepNumber: 7,
      title: 'CLI Admin Tooling',
      files: ['src/cli/index.ts'],
      whyItMatters: 'Provides engineers with operational commands for clearing stalled jobs and inspecting queues.',
      whatToNotice: ['Command parsing with commander/argparse.', 'Graceful SIGINT and SIGTERM handlers.'],
      minutes: 4,
      difficulty: 'new_to_programming',
      roles: ['devops', 'reviewer'],
    },
    {
      stepNumber: 8,
      title: 'Test Infrastructure & Redis Mocking',
      files: ['tests/queue.test.ts', 'tests/worker.test.ts'],
      whyItMatters: 'Learn how to write reliable tests without requiring a live cloud Redis server.',
      whatToNotice: ['In-memory mock mimicking Lua script returns.', 'Fake timers simulating stall timeouts.'],
      minutes: 6,
      difficulty: 'experienced_new_to_stack',
      roles: ['backend', 'reviewer'],
    },
  ],
  quizzes: [
    {
      moduleId: 'queue-core',
      moduleName: 'Queue Core & Dispatcher',
      questions: [
        {
          id: 'q1',
          question: 'Why does TaskFlow rely on Redis Lua scripts instead of standard GET and SET commands?',
          options: [
            'Lua scripts execute faster in browser environments.',
            'Lua scripts execute atomically in Redis, preventing race conditions between concurrent workers.',
            'Lua scripts compress JSON strings automatically.',
            'Redis does not support standard commands for queues.',
          ],
          correctIndex: 1,
          explanation:
            'Redis executes Lua scripts as a single atomic transaction without interruption, ensuring two workers never lease the same job simultaneously.',
        },
        {
          id: 'q2',
          question: 'Where are delayed tasks stored before their target execution timestamp is reached?',
          options: [
            'In a local SQLite database on the worker node.',
            'In a Redis Sorted Set (ZSET) scored by Unix timestamp.',
            'In an in-memory setTimeout array.',
            'Directly in the active worker list.',
          ],
          correctIndex: 1,
          explanation:
            'Delayed jobs are placed in a Redis Sorted Set with their execution epoch as score. The scheduler polls jobs where score <= current_timestamp.',
        },
        {
          id: 'q3',
          question: 'What is the role of the deduplication key in Queue.add()?',
          options: [
            'To encrypt the payload for security compliance.',
            'To ignore duplicate job enqueue requests within a defined deduplication window.',
            'To sort jobs alphabetically by name.',
            'To assign jobs to specific worker IPs.',
          ],
          correctIndex: 1,
          explanation:
            'Deduplication keys prevent duplicate tasks from being scheduled multiple times if a producer accidentally fires redundant triggers.',
        },
      ],
    },
    {
      moduleId: 'worker-pool',
      moduleName: 'Worker Execution Pool',
      questions: [
        {
          id: 'q4',
          question: 'What happens when a worker fails to send a heartbeat within the STALL_INTERVAL_MS window?',
          options: [
            'The entire queue is deleted.',
            'The job is marked as stalled and re-leased to a healthy worker in the pool.',
            'An email is dispatched to the repo owner.',
            'The job status remains stuck permanently.',
          ],
          correctIndex: 1,
          explanation:
            'TaskFlow automatically identifies orphaned jobs from crashed workers and restores them to the wait queue for another worker to complete.',
        },
        {
          id: 'q5',
          question: 'Why does SandboxRunner execute jobs inside Node.js worker_threads?',
          options: [
            'To allow UI rendering in React.',
            'To prevent uncaught exceptions, infinite loops, or memory spikes from crashing the main worker process.',
            'Because Node.js cannot run async functions in the main thread.',
            'To bypass TypeScript type checking.',
          ],
          correctIndex: 1,
          explanation:
            'Worker threads provide process-level isolation: if a user job exceeds execution timeout or exhausts memory, only that thread is terminated.',
        },
      ],
    },
  ],
  firstContributions: [
    {
      id: 'task-1',
      title: 'Add Exponential Jitter to Retry Backoff',
      difficulty: 'easy',
      skills: ['TypeScript', 'Math', 'Unit Testing'],
      involvedFiles: ['src/core/Job.ts', 'tests/job.test.ts'],
      estimatedMinutes: 30,
      whyGoodFirstIssue:
        'Self-contained logic change in calculateBackoffDelay with straightforward unit test coverage.',
      testInstructions: 'Run `npm test tests/job.test.ts` to verify deterministic range distribution.',
      prChecklist: [
        'Add jitter calculation formula (random skew ±15%).',
        'Add unit tests verifying delay remains within upper boundary.',
        'Update JSDoc in Job.ts.',
      ],
    },
    {
      id: 'task-2',
      title: 'Implement Health Check Ping in Standalone Server',
      difficulty: 'easy',
      skills: ['TypeScript', 'Express', 'Redis'],
      involvedFiles: ['src/server.ts', 'src/redis/RedisClient.ts'],
      estimatedMinutes: 45,
      whyGoodFirstIssue:
        'Introduces a clean /healthz route that checks Redis ping latency and returns HTTP 200/503.',
      testInstructions: 'Start dev server and curl http://localhost:3000/healthz.',
      prChecklist: [
        'Mount /healthz endpoint returning { status: "ok", redisLatencyMs }.',
        'Handle Redis disconnect with status 503 Service Unavailable.',
        'Add automated test in tests/server.test.ts.',
      ],
    },
    {
      id: 'task-3',
      title: 'Add Queue Pause and Resume CLI Commands',
      difficulty: 'medium',
      skills: ['TypeScript', 'CLI', 'Redis Lua'],
      involvedFiles: ['src/cli/index.ts', 'src/core/Queue.ts'],
      estimatedMinutes: 60,
      whyGoodFirstIssue:
        'Great introduction to CLI command wiring and communicating state flags across Redis queues.',
      testInstructions: 'Run `npx tsx src/cli/index.ts queue:pause my-queue` and verify worker halts leasing.',
      prChecklist: [
        'Add pause() and resume() methods to Queue class.',
        'Register CLI flags --pause and --resume.',
        'Verify paused queues reject moveToActive Lua execution.',
      ],
    },
  ],
  recentChangesSummary: [
    {
      title: 'Feat: Multi-tenant Redis key prefixing (#142)',
      commitOrPr: 'PR #142',
      architecturalImpact: 'Allows hosting isolated queue namespaces on a single shared Redis cluster.',
      date: '3 days ago',
    },
    {
      title: 'Fix: Graceful worker shutdown timeout on SIGTERM (#138)',
      commitOrPr: 'Commit 8ef9a21',
      architecturalImpact: 'Ensures in-flight tasks have up to 10s to finish before worker terminates.',
      date: '1 week ago',
    },
    {
      title: 'Refactor: Migrated test suite from Jest to Vitest (#135)',
      commitOrPr: 'PR #135',
      architecturalImpact: 'Reduced test execution time from 14s to 1.8s with native ESM support.',
      date: '2 weeks ago',
    },
  ],
  healthSnapshot: {
    lastCommit: '2 days ago (main)',
    openIssues: 14,
    contributorsCount: 38,
    ciPassing: true,
    testsQuality: '94% Coverage (Vitest)',
    docsQuality: 'Excellent (API specs & Guides)',
    score: 92,
  },
};
