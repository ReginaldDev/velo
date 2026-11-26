import { toOrderDetails } from '../support/database'
import { expect, test } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLookup.open()
  })

  test('deve consultar um pedido aprovado', async ({ app, ordersDb }) => {
    const insertedOrder = await ordersDb.insertApprovedOrder({
      color: 'midnight-black',
      wheel_type: 'sport',
      customer_name: 'Reginaldo Teste',
      customer_email: 'bug@testea.dev',
      payment_method: 'avista',
    })
    const order = toOrderDetails(insertedOrder)

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido reprovado', async ({ app, ordersDb }) => {
    const insertedOrder = await ordersDb.insertRejectedOrder({
      color: 'midnight-black',
      wheel_type: 'sport',
      customer_name: 'Steve Jobs',
      customer_email: 'jobs@apple.com',
      payment_method: 'avista',
    })
    const order = toOrderDetails(insertedOrder)

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise', async ({ app, ordersDb }) => {
    const insertedOrder = await ordersDb.insertInAnalysisOrder({
      color: 'lunar-white',
      wheel_type: 'aero',
      customer_name: 'João da Silva',
      customer_email: 'joao@velo.com.br',
      payment_method: 'avista',
    })
    const order = toOrderDetails(insertedOrder)

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {
    const order = generateOrderCode()
    await app.orderLookup.searchOrder(order)
    await app.orderLookup.validateOrderNotFound()
  })

  test('deve exibir mensagem quando o pedido em qualquer formato não é encontrado', async ({ app }) => {
    await app.orderLookup.searchOrder('ABC123')
    await app.orderLookup.validateOrderNotFound()
  })

  test('deve manter o botão desabilitado com campo vazio ou apenas espacos', async ({ app }) => {
    const button = app.orderLookup.elements.searchButton
    await expect(button).toBeDisabled()
    await app.orderLookup.elements.orderInput.fill('   ')
    await expect(button).toBeDisabled()
  })
})
