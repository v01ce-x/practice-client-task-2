<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

const progress = computed(() => {
  if (!props.card?.items.length) return 0
  const checked = props.card.items.filter(i => i.completed).length
  return Math.round((checked / props.card.items.length) * 100)
})

const emitUpdate = () => {
  emit('update', {
    ...props.card,
    items: props.card?.items.map(i => ({ ...i }))
  })
}
</script>

<template>
  <div class="card" :class="{ 'card-done': card.column === 3 }">
    <h3>{{ card.title }}</h3>

    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="progress-text">{{ progress }}%</span>
    </div>

    <ul class="item-list">
      <li v-for="(item, idx) in card.items" :key="idx" :class="{ completed: item.completed }">
        <label>
          <input
            type="checkbox"
            v-model="item.completed"
            @change="emitUpdate"
          />
          <span>{{ item.text }}</span>
        </label>
      </li>
    </ul>

    <div v-if="card.completedAt" class="timestamp">
      Завершено: {{ card.completedAt }}
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 15px;
}

.card-done {
  background: #e6fffa;
  border: 1px solid #b2f5ea;
}

h3 {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
}

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

.item-list li {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.item-list li.completed span {
  text-decoration: line-through;
  color: #999;
}

.timestamp {
  margin-top: 10px;
  font-size: 0.75rem;
  color: #666;
  border-top: 1px solid #eee;
  padding-top: 5px;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 100%;
}

input[type="checkbox"] {
  transform: scale(1.2);
  cursor: pointer;
}
</style>
