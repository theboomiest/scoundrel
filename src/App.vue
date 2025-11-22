<script setup>
import ScoundrelGame from './components/ScoundrelGame.vue'
import logo from './assets/logo.svg'
</script>

<template>
  <main class="app-shell">
    <header class="hero">
      <div>
        <p class="eyebrow">Solo Card Crawler</p>
        <h1>Scoundrel</h1>
        <p class="lede">
          Clear the dungeon rooms by resolving each card. Monsters hurt, potions heal, weapons block
          damage from monsters. Survive the deck to win the run.
        </p>
      </div>
      <img alt="Scoundrel hero" class="hero__badge" :src="logo" width="96" height="96" />
    </header>

    <ScoundrelGame />
  </main>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(59, 7, 100, 0.6), rgba(8, 47, 73, 0.6));
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  border-radius: 22px;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.4);
  color: #f8fafc;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  font-size: 0.8rem;
  color: rgba(248, 250, 252, 0.8);
  margin-bottom: 0.25rem;
}

h1 {
  font-size: clamp(2rem, 3vw, 2.6rem);
  margin: 0 0 0.35rem;
}

.lede {
  margin: 0;
  max-width: 640px;
  color: rgba(248, 250, 252, 0.85);
  line-height: 1.5;
}

.hero__badge {
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.35));
}

@media (max-width: 640px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
