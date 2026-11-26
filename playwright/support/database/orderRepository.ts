import type { Kysely } from 'kysely'
import type { OrderDetails } from '../actions/orderLookupActions'
import { generateOrderCode } from '../helpers'
import { getDatabase } from './client'
import type {
  Database,
  DbExteriorColor,
  DbOptionalFeature,
  DbPaymentMethod,
  DbWheelType,
  NewOrder,
  OrderRow,
  OrderStatus,
} from './schema'

const BASE_PRICE = 40000
const SPORT_WHEELS_PRICE = 2000
const OPTIONAL_PRICES: Record<DbOptionalFeature, number> = {
  'precision-park': 5500,
  'flux-capacitor': 5000,
}

const COLOR_LABELS: Record<DbExteriorColor, string> = {
  'glacier-blue': 'Glacier Blue',
  'lunar-white': 'Lunar White',
  'midnight-black': 'Midnight Black',
}

const PAYMENT_LABELS: Record<DbPaymentMethod, string> = {
  avista: 'À Vista',
  financiamento: 'Financiamento 12x',
}

export type InsertOrderInput = {
  status: OrderStatus
  order_number?: string
  color?: DbExteriorColor
  wheel_type?: DbWheelType
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  customer_cpf?: string
  payment_method?: DbPaymentMethod
  total_price?: number
  optionals?: DbOptionalFeature[]
}

function calculateOrderTotal(
  wheelType: DbWheelType,
  optionals: DbOptionalFeature[]
): number {
  let total = BASE_PRICE
  if (wheelType === 'sport') {
    total += SPORT_WHEELS_PRICE
  }
  for (const optional of optionals) {
    total += OPTIONAL_PRICES[optional] ?? 0
  }
  return total
}

function buildOrderPayload(input: InsertOrderInput): NewOrder {
  const color = input.color ?? 'midnight-black'
  const wheelType = input.wheel_type ?? 'sport'
  const optionals = input.optionals ?? []
  const paymentMethod = input.payment_method ?? 'avista'

  return {
    order_number: input.order_number ?? generateOrderCode(),
    color,
    wheel_type: wheelType,
    customer_name: input.customer_name ?? 'Reginaldo Teste',
    customer_email: input.customer_email ?? 'teste@velo.com.br',
    customer_phone: input.customer_phone ?? '(11) 99999-9999',
    customer_cpf: input.customer_cpf ?? '886.637.860-77',
    payment_method: paymentMethod,
    total_price: input.total_price ?? calculateOrderTotal(wheelType, optionals),
    status: input.status,
    optionals,
  }
}

/**
 * Converts a database order row into the UI OrderDetails contract expected by orderLookupActions.
 */
export function toOrderDetails(row: OrderRow): OrderDetails {
  const color = COLOR_LABELS[row.color as DbExteriorColor] ?? row.color
  const payment = PAYMENT_LABELS[row.payment_method as DbPaymentMethod] ?? row.payment_method

  return {
    number: row.order_number,
    status: row.status as OrderStatus,
    color,
    wheels: `${row.wheel_type} Wheels`,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
    },
    payment,
  }
}

/**
 * Creates a functional order repository backed by Kysely.
 */
export function createOrderRepository(db: Kysely<Database> = getDatabase()) {
  async function insertOrder(input: InsertOrderInput): Promise<OrderRow> {
    const payload = buildOrderPayload(input)

    return db
      .insertInto('orders')
      .values(payload)
      .onConflict((oc) => oc.column('order_number').doUpdateSet(payload))
      .returningAll()
      .executeTakeFirstOrThrow()
  }

  async function insertOrderWithStatus(
    status: OrderStatus,
    overrides: Omit<InsertOrderInput, 'status'> = {}
  ): Promise<OrderRow> {
    return insertOrder({ ...overrides, status })
  }

  return {
    insertOrder,

    insertApprovedOrder(overrides: Omit<InsertOrderInput, 'status'> = {}): Promise<OrderRow> {
      return insertOrderWithStatus('APROVADO', overrides)
    },

    insertRejectedOrder(overrides: Omit<InsertOrderInput, 'status'> = {}): Promise<OrderRow> {
      return insertOrderWithStatus('REPROVADO', overrides)
    },

    insertInAnalysisOrder(overrides: Omit<InsertOrderInput, 'status'> = {}): Promise<OrderRow> {
      return insertOrderWithStatus('EM_ANALISE', overrides)
    },

    async findOrderByNumber(orderNumber: string): Promise<OrderRow | undefined> {
      return db
        .selectFrom('orders')
        .selectAll()
        .where('order_number', '=', orderNumber.trim().toUpperCase())
        .executeTakeFirst()
    },

    async deleteOrderByNumber(orderNumber: string): Promise<void> {
      await db
        .deleteFrom('orders')
        .where('order_number', '=', orderNumber.trim().toUpperCase())
        .execute()
    },

    async deleteOrdersByNumbers(orderNumbers: string[]): Promise<void> {
      if (orderNumbers.length === 0) return

      const normalized = orderNumbers.map((code) => code.trim().toUpperCase())
      await db
        .deleteFrom('orders')
        .where('order_number', 'in', normalized)
        .execute()
    },
  }
}
