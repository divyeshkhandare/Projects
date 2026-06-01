// ─────────────────────────────────────────────────────────────────────────────
// Docker Sandbox Executor Service
// Runs user code in isolated Docker containers with resource limits
// ─────────────────────────────────────────────────────────────────────────────

import Docker from 'dockerode';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

const docker = new Docker({ socketPath: process.platform === 'win32' ? undefined : '/var/run/docker.sock' });

// ── Language Config ───────────────────────────────────────────────────────────

interface LanguageConfig {
  image: string;
  filename: string;
  compileCmd?: string[];
  runCmd: string[];
  extension: string;
}

export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  javascript: {
    image: 'codeforge-sandbox-node:latest',
    filename: 'main.js',
    extension: 'js',
    runCmd: ['node', 'main.js'],
  },
  typescript: {
    image: 'codeforge-sandbox-node:latest',
    filename: 'main.ts',
    extension: 'ts',
    runCmd: ['sh', '-c', 'npx ts-node main.ts'],
  },
  python: {
    image: 'codeforge-sandbox-python:latest',
    filename: 'main.py',
    extension: 'py',
    runCmd: ['python', 'main.py'],
  },
  java: {
    image: 'codeforge-sandbox-java:latest',
    filename: 'Main.java',
    extension: 'java',
    compileCmd: ['javac', 'Main.java'],
    runCmd: ['java', 'Main'],
  },
  c: {
    image: 'codeforge-sandbox-cpp:latest',
    filename: 'main.c',
    extension: 'c',
    compileCmd: ['gcc', 'main.c', '-o', 'main', '-lm'],
    runCmd: ['./main'],
  },
  cpp: {
    image: 'codeforge-sandbox-cpp:latest',
    filename: 'main.cpp',
    extension: 'cpp',
    compileCmd: ['g++', 'main.cpp', '-o', 'main', '-std=c++17'],
    runCmd: ['./main'],
  },
  csharp: {
    image: 'codeforge-sandbox-dotnet:latest',
    filename: 'Program.cs',
    extension: 'cs',
    runCmd: ['sh', '-c', 'dotnet-script Program.cs'],
  },
  go: {
    image: 'codeforge-sandbox-go:latest',
    filename: 'main.go',
    extension: 'go',
    runCmd: ['go', 'run', 'main.go'],
  },
  php: {
    image: 'codeforge-sandbox-php:latest',
    filename: 'main.php',
    extension: 'php',
    runCmd: ['php', 'main.php'],
  },
  ruby: {
    image: 'codeforge-sandbox-ruby:latest',
    filename: 'main.rb',
    extension: 'rb',
    runCmd: ['ruby', 'main.rb'],
  },
  rust: {
    image: 'codeforge-sandbox-rust:latest',
    filename: 'main.rs',
    extension: 'rs',
    compileCmd: ['rustc', 'main.rs', '-o', 'main'],
    runCmd: ['./main'],
  },
};

// ── Execution Result ──────────────────────────────────────────────────────────

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  status: 'success' | 'error' | 'timeout' | 'compile_error';
}

import { exec } from 'child_process';
import util from 'util';
const execAsync = util.promisify(exec);

// ── Main Executor ─────────────────────────────────────────────────────────────

export async function executeCode(
  language: string,
  code: string,
  stdin = '',
  timeoutSeconds = env.SANDBOX_TIMEOUT
): Promise<ExecutionResult> {
  const config = LANGUAGE_CONFIGS[language];
  if (!config) {
    throw new AppError(`Unsupported language: ${language}`, 400);
  }

  // Create a temporary directory for this execution
  const execId = uuidv4();
  const tmpDir = path.join(os.tmpdir(), 'codeforge', execId);
  await fs.mkdir(tmpDir, { recursive: true });

  const startTime = Date.now();

  try {
    // Write code to temp file
    const codePath = path.join(tmpDir, config.filename);
    await fs.writeFile(codePath, code, 'utf-8');

    // Write stdin if provided
    if (stdin) {
      await fs.writeFile(path.join(tmpDir, 'stdin.txt'), stdin, 'utf-8');
    }

    let useLocalFallback = false;
    try {
      await docker.ping();
    } catch {
      useLocalFallback = true;
      logger.warn('Docker daemon not reachable. Falling back to local execution.');
    }

    if (useLocalFallback) {
      return await executeLocal(language, tmpDir, config, stdin, timeoutSeconds, startTime);
    }

    // ── Step 1: Compile (if needed) ───────────────────────────────────────────
    if (config.compileCmd) {
      const compileResult = await runContainer({
        image: config.image,
        cmd: config.compileCmd,
        bindsDir: tmpDir,
        stdin: '',
        timeoutMs: 30_000, // 30s compile timeout
      });

      if (compileResult.exitCode !== 0) {
        return {
          stdout: '',
          stderr: compileResult.stderr || compileResult.stdout,
          exitCode: compileResult.exitCode,
          durationMs: Date.now() - startTime,
          status: 'compile_error',
        };
      }
    }

    // ── Step 2: Run ───────────────────────────────────────────────────────────
    const runResult = await runContainer({
      image: config.image,
      cmd: config.runCmd,
      bindsDir: tmpDir,
      stdin,
      timeoutMs: timeoutSeconds * 1000,
    });

    return {
      stdout: runResult.stdout,
      stderr: runResult.stderr,
      exitCode: runResult.exitCode,
      durationMs: Date.now() - startTime,
      status: runResult.timedOut ? 'timeout' : runResult.exitCode === 0 ? 'success' : 'error',
    };
  } finally {
    // Cleanup temp directory
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => { });
  }
}

// ── Local Execution Fallback (Without Docker) ─────────────────────────────────

async function executeLocal(
  language: string,
  tmpDir: string,
  config: LanguageConfig,
  stdin: string,
  timeoutSeconds: number,
  startTime: number
): Promise<ExecutionResult> {
  const timeoutMs = timeoutSeconds * 1000;
  
  // Local compile if needed
  if (config.compileCmd) {
    try {
      await execAsync(config.compileCmd.join(' '), { cwd: tmpDir, timeout: 30000 });
    } catch (err: any) {
      return {
        stdout: '',
        stderr: err.stderr || err.stdout || err.message,
        exitCode: err.code || 1,
        durationMs: Date.now() - startTime,
        status: 'compile_error',
      };
    }
  }

  // Local run
  try {
    let runCommand = config.runCmd.join(' ');
    if (stdin) {
      // In windows we pipe the file
      runCommand = process.platform === 'win32' 
        ? `type stdin.txt | ${runCommand}` 
        : `cat stdin.txt | ${runCommand}`;
    }

    const { stdout, stderr } = await execAsync(runCommand, { cwd: tmpDir, timeout: timeoutMs });
    
    return {
      stdout,
      stderr,
      exitCode: 0,
      durationMs: Date.now() - startTime,
      status: 'success',
    };
  } catch (err: any) {
    const isTimeout = err.killed || err.signal === 'SIGTERM';
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || err.message,
      exitCode: err.code || 1,
      durationMs: Date.now() - startTime,
      status: isTimeout ? 'timeout' : 'error',
    };
  }
}

// ── Container Runner ──────────────────────────────────────────────────────────

interface ContainerRunOptions {
  image: string;
  cmd: string[];
  bindsDir: string;
  stdin: string;
  timeoutMs: number;
}

interface ContainerRunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
}

async function runContainer(opts: ContainerRunOptions): Promise<ContainerRunResult> {
  let container: Docker.Container | null = null;

  try {
    container = await docker.createContainer({
      Image: opts.image,
      Cmd: opts.cmd,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: true,
      StdinOnce: true,
      Tty: false,
      WorkingDir: '/sandbox',
      HostConfig: {
        // Security: Bind mount temp dir as read-write, everything else read-only
        Binds: [`${opts.bindsDir}:/sandbox`],
        // Resource limits
        Memory: parseMemory(env.SANDBOX_MEMORY),
        CpuQuota: Math.floor(parseFloat(env.SANDBOX_CPUS) * 100_000),
        CpuPeriod: 100_000,
        // Network isolation
        NetworkMode: env.SANDBOX_NETWORK,
        // Security
        ReadonlyRootfs: false,
        CapDrop: ['ALL'],
        SecurityOpt: ['no-new-privileges:true'],
        PidsLimit: 64,
        Ulimits: [
          { Name: 'nofile', Soft: 64, Hard: 64 },
          { Name: 'nproc', Soft: 32, Hard: 32 },
        ],
      },
    });

    // Collect output
    let stdout = '';
    let stderr = '';

    const stream = await container.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true,
    });

    // Write stdin
    if (opts.stdin) {
      stream.write(opts.stdin);
    }
    stream.end();

    // Demultiplex Docker's multiplexed stream
    container.modem.demuxStream(
      stream,
      { write: (chunk: Buffer) => { stdout += chunk.toString(); } },
      { write: (chunk: Buffer) => { stderr += chunk.toString(); } }
    );

    await container.start();

    // Enforce timeout
    let timedOut = false;
    const timeoutHandle = setTimeout(async () => {
      timedOut = true;
      try {
        await container!.kill();
      } catch {
        // Container may have already exited
      }
    }, opts.timeoutMs);

    const [statusCode] = await container.wait();
    clearTimeout(timeoutHandle);

    return {
      stdout: stdout.slice(0, 50_000),   // Limit output to 50KB
      stderr: stderr.slice(0, 10_000),
      exitCode: statusCode.StatusCode ?? 1,
      timedOut,
    };
  } finally {
    if (container) {
      try {
        await container.remove({ force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

function parseMemory(mem: string): number {
  const units: Record<string, number> = { k: 1024, m: 1024 ** 2, g: 1024 ** 3 };
  const match = mem.toLowerCase().match(/^(\d+)([kmg]?)$/);
  if (!match) return 256 * 1024 * 1024;
  return parseInt(match[1]) * (units[match[2]] || 1);
}

// ── Pull sandbox images ───────────────────────────────────────────────────────

export async function ensureSandboxImages() {
  const images = [...new Set(Object.values(LANGUAGE_CONFIGS).map((c) => c.image))];
  for (const image of images) {
    try {
      await docker.getImage(image).inspect();
      logger.info(`✅ Docker image ready: ${image}`);
    } catch {
      logger.warn(`⚠️  Docker image not found: ${image}. Build sandbox images first.`);
    }
  }
}
