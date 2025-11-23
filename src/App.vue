<script setup>
import { ref } from 'vue'
import ScoundrelGame from './components/ScoundrelGame.vue'

const heroCollapsed = ref(false)

const handleRunStarted = () => {
  heroCollapsed.value = true
}

const toggleHero = () => {
  heroCollapsed.value = !heroCollapsed.value
}

const handleHeroClick = () => {
  if (heroCollapsed.value) {
    heroCollapsed.value = false
  }
}
</script>

<template>
  <main class="app-shell">
    <div class="hero-backdrop" :class="{ 'hero-backdrop--visible': !heroCollapsed }"></div>

    <header class="hero" :class="{ 'hero--collapsed': heroCollapsed }" @click="handleHeroClick">
      <div>
        <p class="eyebrow">Solo Card Crawler</p>
        <h1 class="title">Scoundrel</h1>
        <div class="lede">
          <p>
            Clear the dungeon rooms by resolving each card. Monsters hurt, potions heal, weapons
            block damage from monsters. Survive the deck to win the run.
          </p>
          <div class="rules">
            <p><strong>Monsters (clubs/spades):</strong> deal damage equal to their value.</p>
            <p>
              <strong>Weapons (diamonds):</strong> block damage up to their value, but only for
              monsters weaker than the last one you blocked.
            </p>
            <p>
              <strong>Potions (hearts):</strong> heal their value up to 20 health, but only the
              first potion in a room heals.
            </p>
          </div>
        </div>
      </div>
      <Button
        class="hero-close"
        type="button"
        label="X"
        severity="secondary"
        outlined
        @click.stop="toggleHero"
      />
      <!-- <img alt="Scoundrel hero" class="hero__badge" :src="logo" width="96" height="96" /> -->
    </header>

    <ScoundrelGame @run-started="handleRunStarted" />
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
  position: fixed;
  top: 50%;
  left: 50%;
  width: 40vw;
  background: linear-gradient(135deg, hsla(20, 2%, 98%, 0.95), hsla(20, 3%, 96%, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  border-radius: 22px;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.4);
  color: hsl(20, 4%, 4%);
  transition:
    transform 0.4s ease,
    opacity 0.4s ease,
    filter 0.4s ease;
  transform-origin: center center;
  transform: translate(-50%, -50%);
  z-index: 4;
}

.hero--collapsed {
  transform-origin: center center;
  perspective-origin: center center;
  transform: translate(-50%, -50%) translateX(-40vw) perspective(800px) rotateY(45deg) scale(0.6);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  cursor: pointer;
}

.title {
  font-weight: 900;
  font-size: 5rem;
  line-height: 6rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: -0.5rem;
  opacity: 0.7;
}

h1 {
  font-size: clamp(2rem, 3vw, 2.6rem);
  margin: 0 0 0.35rem;
}

.lede {
  margin: 0;
  line-height: 1.5;
  display: grid;
  gap: 0.5rem;
}

.rules {
  display: grid;
  gap: 0.25rem;
  padding: 0.75rem 0.85rem;
  background: hsla(199, 54%, 50%, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  color: hsl(210, 6%, 7%);
}

.hero-close {
  position: absolute;
  top: 12px;
  right: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  font-weight: 700;
  text-transform: uppercase;
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

.hero-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 3;
}

.hero-backdrop--visible {
  opacity: 1;
}
</style>
