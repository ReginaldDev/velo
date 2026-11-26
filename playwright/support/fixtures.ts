import { test as base } from '@playwright/test'
import { createOrderLookupActions } from './actions/orderLookupActions'
import { createConfiguratorActions } from './actions/configuratorActions'
import {
  closeDatabase,
  createOrderRepository,
  type InsertOrderInput,
  type OrderRow,
} from './database'

type App = {
  orderLookup: ReturnType<typeof createOrderLookupActions>
  configurator: ReturnType<typeof createConfiguratorActions>
}

type OrdersDb = ReturnType<typeof createOrderRepository>

export const test = base.extend<
  { app: App; ordersDb: OrdersDb },
  { _dbWorkerCleanup: void }
>({
  _dbWorkerCleanup: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, provide) => {
      await provide()
      await closeDatabase()
    },
    { scope: 'worker', auto: true },
  ],

  app: async ({ page }, provide) => {
    const app: App = {
      orderLookup: createOrderLookupActions(page),
      configurator: createConfiguratorActions(page),
    }
    await provide(app)
  },

  // eslint-disable-next-line no-empty-pattern
  ordersDb: async ({}, provide) => {
    const repository = createOrderRepository()
    const createdOrderNumbers: string[] = []

    const trackOrder = async (insertFn: () => Promise<OrderRow>): Promise<OrderRow> => {
      const order = await insertFn()
      createdOrderNumbers.push(order.order_number)
      return order
    }

    const ordersDb: OrdersDb = {
      insertOrder: (input: InsertOrderInput) =>
        trackOrder(() => repository.insertOrder(input)),
      insertApprovedOrder: (overrides) =>
        trackOrder(() => repository.insertApprovedOrder(overrides)),
      insertRejectedOrder: (overrides) =>
        trackOrder(() => repository.insertRejectedOrder(overrides)),
      insertInAnalysisOrder: (overrides) =>
        trackOrder(() => repository.insertInAnalysisOrder(overrides)),
      findOrderByNumber: repository.findOrderByNumber,
      deleteOrderByNumber: repository.deleteOrderByNumber,
      deleteOrdersByNumbers: repository.deleteOrdersByNumbers,
    }

    try {
      await provide(ordersDb)
    } finally {
      await repository.deleteOrdersByNumbers(createdOrderNumbers)
    }
  },
})

export { expect } from '@playwright/test'
