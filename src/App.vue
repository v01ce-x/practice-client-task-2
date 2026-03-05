<template>
  <div id="app" :class="{ 'app-blocked': isGlobalBlocked }">
    <header>
      <h1>Менеджер задач Pro</h1>
      <button
        @click="openCreateModal"
        class="btn-primary"
        :disabled="isGlobalBlocked || isColumnOneBlocked || cardsCol1.length >= 3"
      >
        + Новая карточка
      </button>
    </header>

    <div v-if="isGlobalBlocked" class="alert-global">
      🚨 КРИТИЧЕСКАЯ БЛОКИРОВКА: Завершите задачи с приоритетом <strong>P1</strong>, чтобы разблокировать приложение.
    </div>

    <div v-else-if="isColumnOneBlocked" class="alert-blocked">
      ⛔ Второй столбец переполнен! Завершите задачу из второго столбца.
    </div>

    <main class="board">
      <section class="column" :class="{ blocked: isColumnOneBlocked && !isGlobalBlocked }">
        <h2>В работе <small>({{ cardsCol1.length }}/3)</small></h2>
        <div class="card-list">
          <NoteCard
            v-for="card in cardsCol1"
            :key="card.id"
            :card="card"
            :disabled="isGlobalBlocked ? card.priority !== 1 : (isColumnOneBlocked)"
            :highlighted="isGlobalBlocked && card.priority === 1"
            @update="handleUpdate"
          />
        </div>
      </section>

      <section class="column">
        <h2>В процессе <small>({{ cardsCol2.length }}/5)</small></h2>
        <div class="card-list">
          <NoteCard
            v-for="card in cardsCol2"
            :key="card.id"
            :card="card"
            :disabled="isGlobalBlocked && card.priority !== 1"
            :highlighted="isGlobalBlocked && card.priority === 1"
            @update="handleUpdate"
          />
        </div>
      </section>

      <section class="column">
        <h2>Готово</h2>
        <div class="card-list">
          <NoteCard
            v-for="card in cardsCol3"
            :key="card.id"
            :card="card"
            :disabled="false"
            @update="handleUpdate"
          />
        </div>
      </section>
    </main>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h3>Создать карточку</h3>
        <input v-model="newCardTitle" placeholder="Заголовок" class="input-field" />

        <div class="priority-select">
          <label>Приоритет (1-5):</label>
          <select v-model="newCardPriority">
            <option :value="1">1 (Высший)</option>
            <option :value="2">2</option>
            <option :value="3" selected>3 (Обычный)</option>
            <option :value="4">4</option>
            <option :value="5">5 (Низкий)</option>
          </select>
        </div>

        <div class="items-editor">
          <p>Пункты (3-5):</p>
          <div v-for="(item, idx) in newCardItems" :key="idx" class="item-row-complex">
            <input v-model="item.text" placeholder="Пункт..." />
            <button @click="removeNewItem(idx)" class="btn-danger">X</button>

            <div class="sub-items-editor">
              <div v-for="(sub, sIdx) in item.subItems" :key="sIdx" class="sub-row">
                <input v-model="sub.text" placeholder="Подпункт..." size="small" />
                <button @click="removeSubItem(idx, sIdx)" class="btn-mini">x</button>
              </div>
              <button v-if="item.subItems.length < 3" @click="addSubItem(idx)" class="btn-mini-add">+ Подпункт</button>
            </div>
          </div>
          <button v-if="newCardItems.length < 5" @click="addNewItem" class="btn-secondary">+ Пункт</button>
        </div>

        <div class="modal-actions">
          <button @click="showModal = false">Отмена</button>
          <button @click="createCard" :disabled="!canCreate" class="btn-primary">Создать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import NoteCard from './components/NoteCard.vue'

const STORAGE_KEY = 'vue-kanban-data-v2'
const cards = ref([])
const showModal = ref(false)
const newCardTitle = ref('')
const newCardPriority = ref(3)
const newCardItems = ref([{ text: '', subItems: [] }, { text: '', subItems: [] }, { text: '', subItems: [] }])

const sortCards = (list) => {
  return [...list].sort((a, b) => a.priority - b.priority)
}

const cardsCol1 = computed(() => sortCards(cards.value.filter(c => c.column === 1)))
const cardsCol2 = computed(() => sortCards(cards.value.filter(c => c.column === 2)))
const cardsCol3 = computed(() => sortCards(cards.value.filter(c => c.column === 3)))

const calculateProgress = (items) => {
  if (!items || items.length === 0) return 0
  const checked = items.filter(i => {
    if (i.subItems && i.subItems.length) return i.subItems.every(s => s.completed)
    return i.completed
  }).length
  return (checked / items.length) * 100
}

const isColumnOneBlocked = computed(() => {
  const col2Full = cardsCol2.value.length >= 5
  const col1HasReadyToMove = cardsCol1.value.some(card => calculateProgress(card.items) > 50)
  return col2Full && col1HasReadyToMove
})

const isGlobalBlocked = computed(() => {
  const criticalCards = cards.value.filter(c => c.priority === 1 && c.column !== 3)
  return criticalCards.length > 2
})

const openCreateModal = () => {
  if (cardsCol1.value.length >= 3) {
    alert("В первом столбце максимум 3 карточки!")
    return
  }
  newCardTitle.value = ''
  newCardPriority.value = 3
  newCardItems.value = [{ text: '', subItems: [] }, { text: '', subItems: [] }, { text: '', subItems: [] }]
  showModal.value = true
}

const addNewItem = () => newCardItems.value.push({ text: '', subItems: [] })
const removeNewItem = (idx) => newCardItems.value.splice(idx, 1)

const addSubItem = (idx) => {
  if (newCardItems.value[idx].subItems.length < 3) {
    newCardItems.value[idx].subItems.push({ text: '', completed: false })
  }
}
const removeSubItem = (pIdx, sIdx) => {
  newCardItems.value[pIdx].subItems.splice(sIdx, 1)
}

const canCreate = computed(() => {
  const validItems = newCardItems.value.filter(i => i.text.trim() !== '')
  return newCardTitle.value.trim() !== '' && validItems.length >= 3
})

const createCard = () => {
  const validItems = newCardItems.value
    .filter(i => i.text.trim() !== '')
    .map(i => ({
      text: i.text,
      completed: false,
      subItems: i.subItems.filter(s => s.text.trim() !== '').map(s => ({ text: s.text, completed: false }))
    }))

  const newCard = {
    id: Date.now().toString(),
    title: newCardTitle.value,
    column: 1,
    priority: newCardPriority.value,
    items: validItems,
    completedAt: null
  }

  cards.value.push(newCard)
  showModal.value = false
}

const handleUpdate = (updatedCard) => {
  const index = cards.value.findIndex(c => c.id === updatedCard.id)
  if (index !== -1) cards.value[index] = updatedCard
}

watch(cards, (newCards) => {
  let hasChanges = false
  newCards.forEach(card => {
    const progress = calculateProgress(card.items)
    if (progress > 50 && card.column === 1 && cardsCol2.value.length < 5) {
      card.column = 2
      hasChanges = true
    }
    if (progress === 100 && card.column !== 3) {
      card.column = 3
      card.completedAt = new Date().toLocaleString()
      hasChanges = true
    }
  })
  if (hasChanges) cards.value = [...newCards]
}, { deep: true })

const saveData = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cards.value))
watch(cards, saveData, { deep: true })

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      cards.value = parsed.map(c => ({
        ...c,
        priority: c.priority || 3,
        items: c.items.map(i => ({
          ...i,
          subItems: i.subItems || [],
          completed: i.completed || false
        }))
      }))
    } catch (e) { console.error(e) }
  }
})

console.log(Number('asdasd'))
</script>

<style>
#app {
  font-family: 'Segoe UI', sans-serif;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #f0f2f5;
  min-height: 100vh;
  transition: filter 0.3s;
}

#app.app-blocked {
  filter: grayscale(1);
}

#app.app-blocked header {
  pointer-events: auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  margin: 0;
  color: #172b4d;
}

.alert-global {
  background: #ff5630;
  color: white;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
  font-weight: bold;
  border: 2px solid #bf2600;
  animation: pulse 2s infinite;
}

.alert-blocked {
  background: #ffab00;
  color: #172b4d;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
  font-weight: bold;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: start;
}

.column {
  background: #ebecf0;
  padding: 15px;
  border-radius: 8px;
  min-height: 600px;
  transition: 0.3s;
}

.column.blocked {
  opacity: 0.5;
  border: 2px solid #ff5630;
  background: #ffebe6;
}

.column h2 {
  font-size: 1rem;
  color: #5e6c84;
  margin-top: 0;
  display: flex;
  justify-content: space-between;
}

button {
  cursor: pointer;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  transition: 0.2s;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #0079bf;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #026aa7;
}

.btn-secondary {
  background: #fff;
  border: 1px solid #ccc;
  width: 100%;
  margin-top: 5px;
}

.btn-danger {
  background: #ffcccc;
  color: #d63031;
  padding: 5px 10px;
}

.btn-mini {
  background: #eee;
  padding: 2px 6px;
  font-size: 0.8em;
  margin-left: 5px;
}

.btn-mini-add {
  background: #e6fffa;
  color: #0079bf;
  border: 1px solid #b2f5ea;
  padding: 4px 8px;
  font-size: 0.8em;
  margin-top: 4px;
  width: 100%;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 450px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.input-field,
select {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  box-sizing: border-box;
}

.priority-select label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.items-editor {
  margin-bottom: 20px;
}

.item-row-complex {
  border: 1px solid #eee;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}

.item-row-complex input {
  width: 100%;
  padding: 8px;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  box-sizing: border-box;
}

.sub-items-editor {
  margin-top: 8px;
  padding-left: 10px;
  border-left: 2px solid #eee;
}

.sub-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.sub-row input {
  flex: 1;
  padding: 4px;
  font-size: 0.9em;
}
#app.app-blocked {
  filter: grayscale(0.8);
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
  transition: all 0.3s ease;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(255, 86, 48, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 86, 48, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 86, 48, 0); }
}

#app.app-blocked .btn-primary {
  pointer-events: none;
  opacity: 0.5;
}
</style>
