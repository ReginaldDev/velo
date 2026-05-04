import { test, expect } from '@playwright/test'
import { generateOrderCode } from '../support/helpers'

// AAA - Arrange, Act, Assert
// PAV
// 1. Arrange - Preparar o teste
// 2. Act - Executar a ação
// 3. Assert - Verificar o resultado

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  })

  test('deve consultar um pedido aprovado', async ({ page }) => {

    //Test Data
    // const order = 'VLO-4DRZZ5'
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

    }
    //Act
    //await page.locator('//label[text()="Número do Pedido"]/..//input').fill('VLO-4DRZZ5')
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number)
    await page.getByRole('button', { name: 'Buscar Pedido' }).click()

    //Assert
    // //const orderId = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-4DRZZ5"]')
    // const orderId = page.getByRole('paragraph')
    //   .filter({ hasText: /^Pedido$/ })
    //   .locator('..') //pega o elemento pai do pedido
    // // Validações
    // await expect(orderId).toBeVisible({ timeout: 10000 })
    // await expect(orderId).toContainText(order)

    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - img
      - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `);



    // Validações
    await expect(page.getByText('APROVADO')).toBeVisible({ timeout: 10000 })

  })

  test('deve consultar um pedido reprovado', async ({ page }) => {

    //Test Data
    //const order = 'VLO-QD53F3'
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

    }
    //Act
    //await page.locator('//label[text()="Número do Pedido"]/..//input').fill('VLO-4DRZZ5')
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number)
    await page.getByRole('button', { name: 'Buscar Pedido' }).click()

    //Assert
    // //const orderId = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-4DRZZ5"]')
    // const orderId = page.getByRole('paragraph')
    //   .filter({ hasText: /^Pedido$/ })
    //   .locator('..') //pega o elemento pai do pedido
    // // Validações
    // await expect(orderId).toBeVisible({ timeout: 10000 })
    // await expect(orderId).toContainText(order)

    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - img
      - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `);
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {

    //Test Data
    const order = generateOrderCode()

    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order)
    await page.getByRole('button', { name: 'Buscar Pedido' }).click()

    // const tittle = page.getByRole('heading', { name: 'Pedido não encontrado', level: 3 })
    // await expect(tittle).toBeVisible()

    // const message = page.locator('p', { hasText: 'Verifique o número do pedido e tente novamente'})
    // await expect(message).toBeVisible()

    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
      `);
  })
})

