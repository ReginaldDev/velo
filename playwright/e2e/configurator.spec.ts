import { test } from '../support/fixtures'

test.describe('Configuração do Veículo (CT02 e CT03)', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('deve atualizar a cor do veículo no preview mantendo o preço base', async ({ app }) => {
    await app.configurator.selectColor('Lunar White')

    await app.configurator.validatePreview('Lunar White', 'Aero Wheels')
    await app.configurator.validatePrice('R$ 40.000,00')
  })

  test('deve atualizar a roda no preview e recalcular o preço ao alternar entre Sport e Aero', async ({ app }) => {
    await app.configurator.selectWheels('Sport Wheels')

    await app.configurator.validatePreview('Glacier Blue', 'Sport Wheels')
    await app.configurator.validatePrice('R$ 42.000,00')

    await app.configurator.selectWheels('Aero Wheels')

    await app.configurator.validatePreview('Glacier Blue', 'Aero Wheels')
    await app.configurator.validatePrice('R$ 40.000,00')
  })

  test('deve adicionar e remover o opcional Precision Park recalculando o preço e avançar ao checkout', async ({ app }) => {
    await app.configurator.checkOptional('Precision Park')
    await app.configurator.validatePrice('R$ 45.500,00')

    await app.configurator.uncheckOptional('Precision Park')
    await app.configurator.validatePrice('R$ 40.000,00')

    await app.configurator.proceedToCheckout('R$ 40.000,00')
  })

  test('deve adicionar e remover o opcional Flux Capacitor recalculando o preço e avançar ao checkout', async ({ app }) => {
    await app.configurator.checkOptional('Flux Capacitor')
    await app.configurator.validatePrice('R$ 45.000,00')

    await app.configurator.uncheckOptional('Flux Capacitor')
    await app.configurator.validatePrice('R$ 40.000,00')

    await app.configurator.proceedToCheckout('R$ 40.000,00')
  })
})
