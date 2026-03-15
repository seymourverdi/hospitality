export type AdminLocation = {
  id: number
  name: string
  code: string | null
  timezone: string | null
  address: string | null
  phone: string | null
  isActive: boolean
}

export type AdminUser = {
  id: number
  locationId: number
  firstName: string
  lastName: string
  pinCode: string
  email: string | null
  phone: string | null
  roleId: number
  isActive: boolean
}

export type AdminArea = {
  id: number
  locationId: number
  name: string
  sortOrder: number | null
  isActive: boolean
}

export type AdminTable = {
  id: number
  locationId: number
  areaId: number
  name: string
  capacity: number
  status: string
  isActive: boolean
}

export type AdminMenuCategory = {
  id: number
  locationId: number
  name: string
  slug: string | null
  description: string | null
  sortOrder: number | null
  isActive: boolean
}

export type AdminMenuItem = {
  id: number
  locationId: number
  categoryId: number
  name: string
  sku: string | null
  description: string | null
  basePrice: string
  taxRate: string | null
  isAlcohol: boolean
  kdsStationId: number | null
  isActive: boolean
}

export type AdminModifierGroup = {
  id: number
  locationId: number
  name: string
  minSelected: number | null
  maxSelected: number | null
  isRequired: boolean
  sortOrder: number | null
  isActive: boolean
}

export type AdminModifierOption = {
  id: number
  modifierGroupId: number
  name: string
  priceDelta: string | null
  sortOrder: number | null
  isActive: boolean
}