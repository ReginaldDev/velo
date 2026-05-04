import { test, expect } from '@playwright/test'

// AAA - Arrange, Act, Assert
// PAV
// 1. Arrange - Preparar o teste
// 2. Act - Executar a ação
// 3. Assert - Verificar o resultado

test('deve consultar um pedido aprovado', async ({ page }) => {

  //Test Data
  const order = 'VLO-4DRZZ5'

  //Arrange
  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

  //Act
  //await page.locator('//label[text()="Número do Pedido"]/..//input').fill('VLO-4DRZZ5')
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order)
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()

  //Assert
  //const orderId = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-4DRZZ5"]')
  const orderId = page.getByRole('paragraph')
    .filter({ hasText: /^Pedido$/ })
    .locator('..') //pega o elemento pai do pedido
  // Validações
  await expect(orderId).toBeVisible({ timeout: 10000 })
  await expect(orderId).toContainText(order)


  // Validações
  await expect(page.getByText('APROVADO')).toBeVisible({ timeout: 10000 })
 
})

test('deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {

  //Test Data
  const order = 'VLO-6E2J20'

  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order)
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()

  const tittle = page.getByRole('heading', { name: 'Pedido não encontrado' })
  await expect(tittle).toBeVisible()

  const message = page.locator('p', { hasText: 'Verifique o número do pedido e tente novamente' })
  await expect(message).toBeVisible()
})