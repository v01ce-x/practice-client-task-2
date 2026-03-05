<template>
  <div class="card"
       :class="{
         'card-done': card.column === 3,
         'blocked-card': disabled && !highlighted,
         'highlighted-card': highlighted
       }">
    <div class="card-header">
      <h3>{{ card.title }}</h3>
      <span class="priority-badge" :class="'p-' + card.priority">P{{ card.priority }}</span>
    </div>

    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="progress-text">{{ progress }}%</span>
    </div>

    <ul class="item-list">
      <li v-for="(item, idx) in card.items" :key="idx" class="item-row">
        <label class="main-item-label">
          <input
            type="checkbox"
            :checked="isItemCompleted(item)"
            :disabled="disabled || card.column === 3 || !canCompleteItem(item)"
            @change="toggleItem(idx)"
          />
          <span :class="{ completed: isItemCompleted(item) }">{{ item.text }}</span>
        </label>

        <ul v-if="item.subItems && item.subItems.length" class="sub-item-list">
          <li v-for="(sub, sIdx) in item.subItems" :key="sIdx">
            <label>
              <input
                type="checkbox"
                v-model="sub.completed"
                :disabled="disabled || card.column === 3"
                @change="emitUpdate"
              />
              <span :class="{ completed: sub.completed }">{{ sub.text }}</span>
            </label>
          </li>
        </ul>
      </li>
    </ul>

    <div v-if="card.completedAt" class="timestamp">
      Завершено: {{ card.completedAt }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
  highlighted: { type: Boolean, default: false }
})

const emit = defineEmits(['update'])

const canCompleteItem = (item) => {
  if (!item.subItems || item.subItems.length === 0) return true
  return item.subItems.every(sub => sub.completed)
}

const isItemCompleted = (item) => {
  if (!item.subItems || item.subItems.length === 0) return item.completed
  return item.subItems.every(sub => sub.completed)
}

const progress = computed(() => {
  if (!props.card.items.length) return 0
  let totalWeight = 0
  let completedWeight = 0

  props.card.items.forEach(item => {
    totalWeight += 2
    if (isItemCompleted(item)) completedWeight += 2
    if (item.subItems) {
      item.subItems.forEach(sub => {
        totalWeight += 1
        if (sub.completed) completedWeight += 1
      })
    }
  })
  if (totalWeight === 0) return 0
  return Math.round((completedWeight / totalWeight) * 100)
})

const toggleItem = (idx) => {
  const newItems = props.card.items.map((item, i) => {
    if (i !== idx) return item
    return { ...item, completed: !item.completed }
  })
  emit('update', { ...props.card, items: newItems })
}

const emitUpdate = () => {
  emit('update', {
    ...props.card,
    items: props.card.items.map(i => ({
      ...i,
      subItems: i.subItems ? i.subItems.map(s => ({...s})) : []
    }))
  })
}
</script>

<style scoped>
.card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  transition: all 0.3s ease;
  animation: fadeIn 0.3s ease;
  position: relative;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-done {
  background: #e6fffa;
  border: 1px solid #b2f5ea;
  opacity: 0.9;
}

.card.blocked-card {
  opacity: 0.4;
  pointer-events: none;
  filter: grayscale(1);
  cursor: not-allowed;
}

.card.highlighted-card {
  border: 3px solid #ff5630 !important;
  box-shadow: 0 0 0 4px rgba(255, 86, 48, 0.2) !important;
  animation: pulse-border 2s infinite;
  z-index: 10;
  transform: scale(1.02);
}

@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 86, 48, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 86, 48, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 86, 48, 0);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.priority-badge {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  color: white;
}

.p-1 { background: #ff5630; }
.p-2 { background: #ffab00; }
.p-3 { background: #0079bf; }
.p-4 { background: #6554c0; }
.p-5 { background: #8777d9; }

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #0079bf;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.8rem;
  font-weight: bold;
  color: #0079bf;
}

.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item-row {
  margin-bottom: 10px;
}

.main-item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
  color: #333;
}

.main-item-label span.completed {
  text-decoration: line-through;
  color: #999;
}

.sub-item-list {
  list-style: none;
  padding-left: 24px;
  margin: 4px 0 0 0;
  border-left: 2px solid #eee;
}

.sub-item-list li {
  margin-bottom: 4px;
  font-size: 0.9em;
  color: #555;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sub-item-list label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.sub-item-list span.completed {
  text-decoration: line-through;
  color: #aaa;
}

.timestamp {
  margin-top: 10px;
  font-size: 0.75rem;
  color: #666;
  border-top: 1px solid #eee;
  padding-top: 5px;
}

input[type="checkbox"] {
  cursor: pointer;
  transform: scale(1.2);
}

input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
