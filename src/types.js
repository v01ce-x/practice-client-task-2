export const CardStructure = {
  id: String,
  title: String,
  column: Number,
  items: Array,
  completedAt: String
}

export const COLUMN_LIMITS = {
  1: 3,
  2: 5,
  3: Infinity
}

export const ITEM_REQUIREMENTS = {
  min: 3,
  max: 5
}
