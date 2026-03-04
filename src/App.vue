<script setup>
import { ref, computed } from 'vue'
import NoteCard from '@/components/NoteCard.vue'

const cards = ref([])
const showModal = ref(false)
const newCardTitle = ref('')
const newCardItems = ref(['', '', ''])

const cardsCol1 = computed(() => cards.value.filter(c => c.column === 1))
const cardsCol2 = computed(() => cards.value.filter(c => c.column === 2))
const cardsCol3 = computed(() => cards.value.filter(c => c.column === 3))

const addNewItem = () => newCardItems.value.push('')
const removeNewItem = (idx) => newCardItems.value.splice(idx, 1)

const createCard = () => {
  const validItems = newCardItems.value.filter(i => i.trim() !== '')
  if (validItems.length < 3) {
    alert('Минимум 3 пункта списка!')
    return
  }
  if (cardsCol1.value.length >= 3) {
    alert('В первом столбце максимум 3 карточки!')
    return
  }

  const newCard = {
    id: Date.now().toString(),
    title: newCardTitle.value,
    column: 1,
    items: validItems.map(text => ({ text, completed: false })),
    completedAt: null
  }

  cards.value.push(newCard)
  showModal.value = false
  newCardTitle.value = ''
  newCardItems.value = ['', '', '']
}
</script>

<template>
  <div id="app">
    <header>
      <h1>Менеджер задач</h1>
      <button @click="showModal = true" class="btn-primary">
        + Новая карточка
      </button>
    </header>

    <main class="board">
      <section class="column">
        <h2>В работе <small>({{ cardsCol1.length }}/3)</small></h2>
        <div class="card-list">
          <NoteCard
            v-for="card in cardsCol1"
            :key="card.id"
            :card="card"
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
          />
        </div>
      </section>
    </main>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h3>Создать карточку</h3>
        <input v-model="newCardTitle" placeholder="Заголовок" class="input-field" />

        <div class="items-editor">
          <p>Пункты списка (мин 3, макс 5):</p>
          <div v-for="(item, idx) in newCardItems" :key="idx" class="item-row">
            <input v-model="newCardItems[idx]" placeholder="Пункт..." />
            <button @click="removeNewItem(idx)" class="btn-danger">X</button>
          </div>
          <button v-if="newCardItems.length < 5" @click="addNewItem" class="btn-secondary">
            + Пункт
          </button>
        </div>

        <div class="modal-actions">
          <button @click="showModal = false">Отмена</button>
          <button @click="createCard" class="btn-primary">Создать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
#app {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.column {
  background: #ebecf0;
  padding: 15px;
  border-radius: 8px;
  min-height: 500px;
}

.column h2 {
  font-size: 1rem;
  color: #5e6c84;
  margin-top: 0;
}

.card-list {
  min-height: 100px;
}

button {
  cursor: pointer;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
}

.btn-primary {
  background: #0079bf;
  color: white;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 400px;
}

.input-field {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  box-sizing: border-box;
}

.item-row {
  display: flex;
  gap: 5px;
  margin-bottom: 8px;
}

.item-row input {
  flex: 1;
  padding: 8px;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
