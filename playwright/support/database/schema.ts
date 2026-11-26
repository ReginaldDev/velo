import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely'

export type OrderStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE'
export type DbExteriorColor = 'glacier-blue' | 'midnight-black' | 'lunar-white'
export type DbWheelType = 'aero' | 'sport'
export type DbPaymentMethod = 'avista' | 'financiamento'
export type DbOptionalFeature = 'precision-park' | 'flux-capacitor'

export interface OrdersTable {
  id: Generated<string>
  order_number: string
  color: DbExteriorColor | string
  wheel_type: DbWheelType | string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_cpf: string
  payment_method: DbPaymentMethod | string
  total_price: ColumnType<string, number | string, number | string>
  status: Generated<OrderStatus | string>
  created_at: Generated<Date | string>
  updated_at: Generated<Date | string>
  optionals: ColumnType<string[] | null, string[] | null | undefined, string[] | null>
}

export interface Database {
  orders: OrdersTable
}

export type OrderRow = Selectable<OrdersTable>
export type NewOrder = Insertable<OrdersTable>
export type OrderUpdate = Updateable<OrdersTable>
