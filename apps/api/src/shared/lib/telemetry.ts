import { NodeSDK } from '@opentelemetry/sdk-node'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import type { IncomingMessage, ClientRequest } from 'node:http'

let sdk: NodeSDK | null = null

const SENSITIVE_HEADERS = ['authorization', 'cookie', 'x-api-key']

function safeHeaders(req: ClientRequest | IncomingMessage): Record<string, string> {
  const headers: Record<string, string> = {}
  const raw = 'getHeaders' in req ? req.getHeaders() : req.headers
  for (const [key, val] of Object.entries(raw)) {
    if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      headers[key] = '[REDACTED]'
    } else {
      headers[key] = Array.isArray(val) ? val.join(', ') : String(val ?? '')
    }
  }
  return headers
}

export function initTelemetry() {
  if (!process.env.OTEL_SERVICE_NAME) {
    process.env.OTEL_SERVICE_NAME = 'saas-api'
  }

  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  const isDev = process.env.NODE_ENV !== 'production'

  if (!otlpEndpoint && !isDev) {
    return
  }

  const spanProcessor = otlpEndpoint
    ? new BatchSpanProcessor(new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` }))
    : new BatchSpanProcessor(new ConsoleSpanExporter())

  sdk = new NodeSDK({
    spanProcessors: [spanProcessor],
    instrumentations: [
      new HttpInstrumentation({
        applyCustomAttributesOnSpan(span, request) {
          span.setAttribute('http.request.headers', JSON.stringify(safeHeaders(request)))
        },
      }),
    ],
  })

  sdk.start()
  process.on('SIGTERM', () => { sdk?.shutdown() })
}
