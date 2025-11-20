import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import { logger } from '../utils/logger.js';

export class MetricsService {
  public readonly register: Registry;

  // HTTP Metrics
  public readonly httpRequestDuration: Histogram;
  public readonly httpRequestTotal: Counter;
  public readonly httpRequestErrors: Counter;

  // Mention Check Metrics
  public readonly mentionChecksTotal: Counter;
  public readonly mentionCheckDuration: Histogram;
  public readonly mentionsDetected: Counter;

  // Queue Metrics
  public readonly queueJobsTotal: Counter;
  public readonly queueJobsFailed: Counter;
  public readonly queueSize: Gauge;

  // Database Metrics
  public readonly databaseQueryDuration: Histogram;
  public readonly databaseConnectionsActive: Gauge;

  // Cache Metrics
  public readonly cacheHits: Counter;
  public readonly cacheMisses: Counter;

  constructor() {
    this.register = new Registry();

    // HTTP Request Duration
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    // HTTP Request Total
    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    // HTTP Request Errors
    this.httpRequestErrors = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
      registers: [this.register],
    });

    // Mention Checks Total
    this.mentionChecksTotal = new Counter({
      name: 'mention_checks_total',
      help: 'Total number of mention checks performed',
      labelNames: ['provider', 'status'],
      registers: [this.register],
    });

    // Mention Check Duration
    this.mentionCheckDuration = new Histogram({
      name: 'mention_check_duration_seconds',
      help: 'Duration of mention checks in seconds',
      labelNames: ['provider'],
      buckets: [1, 2, 5, 10, 20, 30],
      registers: [this.register],
    });

    // Mentions Detected
    this.mentionsDetected = new Counter({
      name: 'mentions_detected_total',
      help: 'Total number of mentions detected',
      labelNames: ['provider', 'brand'],
      registers: [this.register],
    });

    // Queue Jobs Total
    this.queueJobsTotal = new Counter({
      name: 'queue_jobs_total',
      help: 'Total number of queue jobs processed',
      labelNames: ['queue', 'status'],
      registers: [this.register],
    });

    // Queue Jobs Failed
    this.queueJobsFailed = new Counter({
      name: 'queue_jobs_failed_total',
      help: 'Total number of failed queue jobs',
      labelNames: ['queue', 'error_type'],
      registers: [this.register],
    });

    // Queue Size
    this.queueSize = new Gauge({
      name: 'queue_size',
      help: 'Current size of job queues',
      labelNames: ['queue'],
      registers: [this.register],
    });

    // Database Query Duration
    this.databaseQueryDuration = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
      registers: [this.register],
    });

    // Database Connections Active
    this.databaseConnectionsActive = new Gauge({
      name: 'database_connections_active',
      help: 'Number of active database connections',
      registers: [this.register],
    });

    // Cache Hits
    this.cacheHits = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_key_prefix'],
      registers: [this.register],
    });

    // Cache Misses
    this.cacheMisses = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_key_prefix'],
      registers: [this.register],
    });

    logger.info('Metrics service initialized');
  }

  async getMetrics(): Promise<string> {
    return await this.register.metrics();
  }

  // Helper methods for common operations
  recordHttpRequest(method: string, route: string, status: number, duration: number) {
    this.httpRequestDuration.observe({ method, route, status }, duration);
    this.httpRequestTotal.inc({ method, route, status });
  }

  recordHttpError(method: string, route: string, errorType: string) {
    this.httpRequestErrors.inc({ method, route, error_type: errorType });
  }

  recordMentionCheck(provider: string, status: 'success' | 'error', duration: number) {
    this.mentionChecksTotal.inc({ provider, status });
    this.mentionCheckDuration.observe({ provider }, duration);
  }

  recordMentionDetected(provider: string, brand: string) {
    this.mentionsDetected.inc({ provider, brand });
  }

  recordQueueJob(queue: string, status: 'completed' | 'failed') {
    this.queueJobsTotal.inc({ queue, status });
  }

  recordQueueJobFailed(queue: string, errorType: string) {
    this.queueJobsFailed.inc({ queue, error_type: errorType });
  }

  updateQueueSize(queue: string, size: number) {
    this.queueSize.set({ queue }, size);
  }

  recordDatabaseQuery(operation: string, duration: number) {
    this.databaseQueryDuration.observe({ operation }, duration);
  }

  updateDatabaseConnections(count: number) {
    this.databaseConnectionsActive.set(count);
  }

  recordCacheHit(keyPrefix: string) {
    this.cacheHits.inc({ cache_key_prefix: keyPrefix });
  }

  recordCacheMiss(keyPrefix: string) {
    this.cacheMisses.inc({ cache_key_prefix: keyPrefix });
  }
}

export const metricsService = new MetricsService();
