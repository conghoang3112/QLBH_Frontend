export interface IRuleColumnImport {
  type: string
  required: boolean
  max?: number
}

interface ISubItem {
  index: number
  column?: string
  note?: string
}

export interface IWarnOrError {
  count: number
  items: ISubItem[]
}
