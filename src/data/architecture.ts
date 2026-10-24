/**
 * A simplified, public-safe picture of the kind of platform Sanchit works on.
 * Drives the 3D "microservices galaxy" and its accessible list fallback.
 */

export type NodeKind = 'client' | 'edge' | 'service' | 'messaging' | 'data' | 'platform'

export interface ArchNode {
  id: string
  label: string
  kind: NodeKind
  /** position in the galaxy (x = request flow left → right) */
  pos: [number, number, number]
  description: string
  tags: string[]
}

export const KIND_LABEL: Record<NodeKind, string> = {
  client: 'Client',
  edge: 'Edge',
  service: 'Microservice',
  messaging: 'Messaging',
  data: 'Data store',
  platform: 'Platform',
}

/** Columns/lanes of the 3D architecture board (x = request flow, z = depth). */
export const tiers = [
  { label: 'Clients', x: -6, z: 2.15 },
  { label: 'Edge', x: -3.6, z: 2.15 },
  { label: 'Services', x: 0, z: 2.15 },
  { label: 'Events', x: 3.6, z: 2.15 },
  { label: 'Consumers', x: 6, z: 2.15 },
  { label: 'Data', x: -4.2, z: 3.4 },
  { label: 'Observability', x: -6, z: -3.6 },
]

/** where each node sits on the board: [x, z] */
export const boardPos: Record<string, [number, number]> = {
  web: [-6, -0.9],
  kiosk: [-6, 0.9],
  gateway: [-3.6, 0],
  menu: [-1.2, -1.5],
  cart: [-1.2, 0],
  tenant: [-1.2, 1.5],
  order: [1.2, -0.75],
  payment: [1.2, 0.9],
  kafka: [3.6, -0.75],
  rabbit: [3.6, 0.9],
  delivery: [6, -0.75],
  pos: [6, 0.9],
  redis: [-1.6, 3.4],
  mongo: [0.4, 3.4],
  aerospike: [2.4, 3.4],
  observe: [-3.6, -3.6],
}

/** phone layout: one tier per row, flow runs top → bottom */
export const boardPosPortrait: Record<string, [number, number]> = {
  web: [-1.7, -7.2],
  kiosk: [1.7, -7.2],
  gateway: [-1.2, -5.1],
  observe: [2.4, -5.1],
  menu: [-2.9, -3.0],
  cart: [0, -3.0],
  tenant: [2.9, -3.0],
  order: [-1.6, -1.0],
  payment: [1.6, -1.0],
  kafka: [-1.6, 1.1],
  rabbit: [1.6, 1.1],
  delivery: [-1.6, 3.2],
  pos: [1.6, 3.2],
  redis: [-2.9, 5.4],
  mongo: [0, 5.4],
  aerospike: [2.9, 5.4],
}
export const tierRowsPortrait = [
  { label: 'Clients', z: -7.2 },
  { label: 'Edge', z: -5.1 },
  { label: 'Services', z: -2.0 },
  { label: 'Events', z: 1.1 },
  { label: 'Consumers', z: 3.2 },
  { label: 'Data', z: 5.4 },
]

export const nodes: ArchNode[] = [
  { id: 'web', label: 'Web & App', kind: 'client', pos: [-4.2, 0.9, 0.4], description: 'Online ordering for four QSR brands, built on the same APIs as the kiosks.', tags: ['React', 'TypeScript'] },
  { id: 'kiosk', label: 'Kiosks', kind: 'client', pos: [-4.2, -0.8, -0.4], description: 'Self-service kiosk ordering, live in 10+ countries (including KFC U.S.).', tags: ['10+ countries'] },
  { id: 'gateway', label: 'API Gateway', kind: 'edge', pos: [-2.5, 0, 0], description: 'Rate limiting, validation and gateway rules that block 50K+ abusive requests per day.', tags: ['Rate limiting', 'Validation'] },
  { id: 'menu', label: 'Menu & i18n', kind: 'service', pos: [-0.7, 1.7, -0.9], description: 'Brand menus, currencies and localisation, including the RU/KK launch for Kazakhstan.', tags: ['Localization', 'Currency precision'] },
  { id: 'cart', label: 'Cart', kind: 'service', pos: [-0.9, 0.3, 1.2], description: 'Currency-aware totals that stay consistent with every POS system.', tags: ['gRPC', 'Redis'] },
  { id: 'order', label: 'Order', kind: 'service', pos: [0.3, -0.4, 0], description: 'The heart of the platform: 200K+ orders per day, idempotent writes, retries.', tags: ['Koa', 'gRPC', 'Idempotency'] },
  { id: 'payment', label: 'Payments', kind: 'service', pos: [0.2, -2.0, 1.0], description: 'Payment flows including Epay and Kaspi integrations for the Kazakhstan launch.', tags: ['Epay', 'Kaspi'] },
  { id: 'tenant', label: 'Brand Onboarding', kind: 'service', pos: [-0.6, -1.6, -1.6], description: 'Multi-tenant NestJS SaaS for bringing new restaurant brands online.', tags: ['NestJS', 'Multi-tenancy', 'RBAC'] },
  { id: 'kafka', label: 'Kafka', kind: 'messaging', pos: [1.9, 0.6, -0.6], description: 'Event streams that decouple order placement from delivery and POS.', tags: ['Event-driven'] },
  { id: 'rabbit', label: 'RabbitMQ', kind: 'messaging', pos: [1.8, -1.4, 0.9], description: 'Work queues for payment and notification side-effects.', tags: ['Queues', 'Retries'] },
  { id: 'delivery', label: 'Delivery & ETA', kind: 'service', pos: [3.3, 1.4, 0.3], description: 'Delivery flows and delivery-ETA integration.', tags: ['Integrations'] },
  { id: 'pos', label: 'POS Sync', kind: 'service', pos: [3.4, -0.4, -1.1], description: 'Pushes orders to restaurant POS systems with currency-correct totals.', tags: ['Currency rounding'] },
  { id: 'aerospike', label: 'Aerospike', kind: 'data', pos: [2.4, -2.6, -0.4], description: 'Rebuilt the connection layer for every service: retry, reconnection, self-healing.', tags: ['Self-healing', 'New Relic events'] },
  { id: 'mongo', label: 'MongoDB', kind: 'data', pos: [0.9, 2.6, 0.6], description: 'Primary document store for menus, orders and tenants.', tags: ['Compound indexes'] },
  { id: 'redis', label: 'Redis', kind: 'data', pos: [-1.9, 2.3, 0.9], description: 'Caching that helped take a critical API from ~2.5s to ~300ms.', tags: ['Caching'] },
  { id: 'observe', label: 'New Relic', kind: 'platform', pos: [-2.2, -2.4, 0.6], description: 'Centralised monitoring: ~40% fewer incidents, response time from 30 to under 10 minutes.', tags: ['Alerting', 'Kibana'] },
]

/** [from, to] – request / event direction */
export const edges: [string, string][] = [
  ['web', 'gateway'],
  ['kiosk', 'gateway'],
  ['gateway', 'menu'],
  ['gateway', 'cart'],
  ['gateway', 'order'],
  ['gateway', 'tenant'],
  ['cart', 'order'],
  ['order', 'payment'],
  ['order', 'kafka'],
  ['payment', 'rabbit'],
  ['kafka', 'delivery'],
  ['kafka', 'pos'],
  ['rabbit', 'delivery'],
  ['order', 'aerospike'],
  ['payment', 'aerospike'],
  ['menu', 'mongo'],
  ['order', 'mongo'],
  ['tenant', 'mongo'],
  ['menu', 'redis'],
  ['cart', 'redis'],
  ['gateway', 'observe'],
  ['payment', 'observe'],
]

/** the path a "test order" takes through the galaxy */
export const orderPath: { node: string; log: string }[] = [
  { node: 'kiosk', log: 'POST /orders  (kiosk #214, Almaty)' },
  { node: 'gateway', log: 'gateway  ✓ rate limit  ✓ schema' },
  { node: 'cart', log: 'cart     totals in KZT, precision ok' },
  { node: 'order', log: 'order    idempotency key 7f3a… created' },
  { node: 'payment', log: 'payment  Kaspi authorised' },
  { node: 'order', log: 'order    status → PAID' },
  { node: 'kafka', log: 'kafka    order.paid published' },
  { node: 'pos', log: 'pos      ticket sent to kitchen' },
  { node: 'delivery', log: 'delivery ETA 24 min' },
]
