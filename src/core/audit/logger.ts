const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ?? "INFO";

const formatters: Record<LogLevel, (msg: string, meta?: object) => string> = {
  ERROR: (msg, meta) => `[ERR] ${msg}${meta ? " " + JSON.stringify(meta) : ""}`,
  WARN: (msg, meta) => `[WRN] ${msg}${meta ? " " + JSON.stringify(meta) : ""}`,
  INFO: (msg, meta) => `[INF] ${msg}${meta ? " " + JSON.stringify(meta) : ""}`,
  DEBUG: (msg, meta) => `[DBG] ${msg}${meta ? " " + JSON.stringify(meta) : ""}`,
};

let buffer: string[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

function flush() {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0);
  for (const line of batch) {
    if (line.startsWith("[ERR]")) {
      process.stderr.write(line + "\n");
    } else {
      process.stdout.write(line + "\n");
    }
  }
}

function enqueue(level: LogLevel, msg: string, meta?: object) {
  if (LOG_LEVELS[level] > LOG_LEVELS[currentLevel]) return;
  buffer.push(formatters[level](msg, meta));
}

if (typeof globalThis.window === "undefined" && !flushTimer) {
  flushTimer = setInterval(flush, 5000);
  if (typeof process !== "undefined") {
    process.on("exit", flush);
    process.on("uncaughtException", () => { flush(); });
  }
}

export const logger = {
  error: (msg: string, meta?: object) => { enqueue("ERROR", msg, meta); flush(); },
  warn: (msg: string, meta?: object) => { enqueue("WARN", msg, meta); flush(); },
  info: (msg: string, meta?: object) => enqueue("INFO", msg, meta),
  debug: (msg: string, meta?: object) => enqueue("DEBUG", msg, meta),
};
