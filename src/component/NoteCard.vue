<script setup>
defineProps({
  card: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="card">
    <h3>{{ card.title }}</h3>
    <ul class="item-list">
      <li v-for="(item, idx) in card.items" :key="idx">
        <label>
          <input type="checkbox" :checked="item.completed" disabled />
          <span>{{ item.text }}</span>
        </label>
      </li>
    </ul>
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

h3 {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
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
  gap: 8px;
}

input[type="checkbox"] {
  transform: scale(1.2);
}
</style>
