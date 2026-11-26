import { expect, type Page } from '@playwright/test'

export type VehicleColor = 'Glacier Blue' | 'Midnight Black' | 'Lunar White'
export type VehicleWheel = 'Aero Wheels' | 'Sport Wheels'

const COLOR_SLUGS: Record<VehicleColor, string> = {
  'Glacier Blue': 'glacier-blue',
  'Midnight Black': 'midnight-black',
  'Lunar White': 'lunar-white',
}

const WHEEL_SLUGS: Record<VehicleWheel, string> = {
  'Aero Wheels': 'aero',
  'Sport Wheels': 'sport',
}

export function createConfiguratorActions(page: Page) {
  const configureLink = page.getByRole('link', { name: 'Configure Agora' })
  const heading = page.getByRole('heading', { name: 'Velô Sprint', level: 1 })

  async function validatePreview(color: VehicleColor, wheel: VehicleWheel): Promise<void> {
    const imageName = `Velô Sprint - ${COLOR_SLUGS[color]} with ${WHEEL_SLUGS[wheel]} wheels`
    await expect(page.getByRole('img', { name: imageName })).toBeVisible()
  }

  async function validatePrice(price: string): Promise<void> {
    await expect(page.getByText(price)).toBeVisible()
  }

  return {
    elements: {
      configureLink,
      heading,
    },

    async open(): Promise<void> {
      await page.goto('/')
      await expect(page).toHaveURL('/')

      await expect(configureLink).toBeVisible()
      await configureLink.click()

      await expect(page).toHaveURL('/configure')
      await expect(heading).toBeVisible()
      await validatePreview('Glacier Blue', 'Aero Wheels')
      await validatePrice('R$ 40.000,00')
    },

    async selectColor(color: VehicleColor): Promise<void> {
      const colorButton = page.getByRole('button', { name: color })
      await expect(colorButton).toBeVisible()
      await colorButton.click()
    },

    async selectWheels(wheel: VehicleWheel): Promise<void> {
      const wheelButton = page.getByRole('button', { name: new RegExp(wheel, 'i') })
      await expect(wheelButton).toBeVisible()
      await wheelButton.click()
    },

    validatePreview,
    validatePrice,
  }
}
