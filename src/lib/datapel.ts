const DATAPEL_API_URL = process.env.DATAPEL_API_URL || 'https://api.datapel.com'
const DATAPEL_API_KEY = process.env.DATAPEL_API_KEY || ''

interface DatapelProduct {
  code: string
  name: string
  unit: string
  id: string
}

interface DatapelStockLevel {
  productCode: string
  productName: string
  warehouseId: string
  quantity: number
  unit: string
}

interface DatapelStocktake {
  id: string
  warehouseId: string
  status: string
  items: DatapelStocktakeItem[]
}

interface DatapelStocktakeItem {
  productCode: string
  productName: string
  expectedQty: number
  countedQty?: number
  unit: string
}

async function datapelFetch(path: string, options: RequestInit = {}) {
  if (!DATAPEL_API_KEY) {
    throw new Error('Datapel API key not configured')
  }
  
  const response = await fetch(`${DATAPEL_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': DATAPEL_API_KEY,
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    throw new Error(`Datapel API error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

export const datapelService = {
  async getProducts(): Promise<DatapelProduct[]> {
    try {
      return await datapelFetch('/products')
    } catch (error) {
      console.error('Failed to fetch products from Datapel:', error)
      throw error
    }
  },

  async getStockLevels(warehouseId?: string): Promise<DatapelStockLevel[]> {
    try {
      const path = warehouseId ? `/stock?warehouseId=${warehouseId}` : '/stock'
      return await datapelFetch(path)
    } catch (error) {
      console.error('Failed to fetch stock levels from Datapel:', error)
      throw error
    }
  },

  async createStocktake(warehouseId: string): Promise<DatapelStocktake> {
    try {
      return await datapelFetch('/stocktake', {
        method: 'POST',
        body: JSON.stringify({ warehouseId }),
      })
    } catch (error) {
      console.error('Failed to create stocktake in Datapel:', error)
      throw error
    }
  },

  async getStocktake(id: string): Promise<DatapelStocktake> {
    try {
      return await datapelFetch(`/stocktake/${id}`)
    } catch (error) {
      console.error('Failed to fetch stocktake from Datapel:', error)
      throw error
    }
  },

  async uploadStocktake(id: string, items: DatapelStocktakeItem[]): Promise<DatapelStocktake> {
    try {
      return await datapelFetch(`/stocktake/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ items }),
      })
    } catch (error) {
      console.error('Failed to upload stocktake to Datapel:', error)
      throw error
    }
  },

  isConfigured(): boolean {
    return Boolean(DATAPEL_API_KEY)
  },
}
