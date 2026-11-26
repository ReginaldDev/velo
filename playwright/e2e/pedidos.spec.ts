import { expect, test } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLookup.open()
  })

  test('deve consultar um pedido aprovado', async ({ app }) => {

    const order = {
      number: 'VLO-4DRZZ5',
      status: 'APROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Reginaldo Teste',
        email: 'bug@teste.dev'
      },
      payment: 'À Vista'

    } as const
 
    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)

  })

  test('deve consultar um pedido reprovado', async ({ app }) => {

    const order = {
      number: 'VLO-QD53F3',
      status: 'REPROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Steve Jobs',
        email: 'jobs@apple.com'
      },
      payment: 'À Vista'

    } as const

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise', async ({ app }) => {

    const order = {
      number: 'VLO-2MCJIU',
      status: 'EM_ANALISE',
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'João da Silva',
        email: 'joao@velo.com.br'
      },
      payment: 'À Vista'

    } as const
 
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

  test('deve manter o botão desabilitado com campo vazio ou apenas espacos', async ({ app, page }) => {
    const button = app.orderLookup.elements.searchButton
    await expect(button).toBeDisabled()
    await app.orderLookup.elements.orderInput.fill('   ')
    await expect(button).toBeDisabled()
  })   
})
