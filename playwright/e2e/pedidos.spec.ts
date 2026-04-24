import { test, expect } from '@playwright/test'

// AAA - Arrange, Act, Assert
// PAV
// 1. Arrange - Preparar o teste
// 2. Act - Executar a ação
// 3. Assert - Verificar o resultado

test('deve consultar um pedido aprovado', async ({ page }) => {
  //Arrange
  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

  //Act
  //await page.locator('//label[text()="Número do Pedido"]/..//input').fill('VLO-4DRZZ5')
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-4DRZZ5')
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()

  //Assert
  const orderId = page.locator('p.font-mono', { hasText: 'VLO-4DRZZ5' });
  // Validações
  await expect(orderId).toBeVisible({ timeout: 10_000 });
  await expect(orderId).toContainText('VLO-4DRZZ5');


  const statusOrder = page.locator('text=APROVADO');
  // Validações
  await expect(statusOrder).toBeVisible({ timeout: 10000 });
  await expect(statusOrder).toContainText('APROVADO');
})