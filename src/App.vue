<script setup></script>

<template>
  <div id="app">
    <header>
      <h1>Менеджер задач</h1>
    </header>

    <main class="board">
      <section class="column">
        <h2>В работе <small>(0/3)</small></h2>
        <div class="card-list"></div>
      </section>

      <section class="column">
        <h2>В процессе <small>(0/5)</small></h2>
        <div class="card-list"></div>
      </section>

      <section class="column">
        <h2>Готово</h2>
        <div class="card-list"></div>
      </section>
    </main>
  </div>
</template>

<style>
#app {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
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
</style>
