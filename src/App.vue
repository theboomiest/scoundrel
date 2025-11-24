<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import ScoundrelGame from './components/ScoundrelGame.vue'

const heroCollapsed = ref(false)
const wallProgress = ref(0)

const wallPalette = {
  startTop: '#6b7c8f',
  startBottom: '#4b5666',
  endTop: '#7f1d1d',
  endBottom: '#0b0b0c',
}

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

const lerp = (a, b, t) => Math.round(a + (b - a) * t)

const hexToRgb = (hex) => {
  const normalized = hex.replace('#', '')
  const int = parseInt(normalized, 16)
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

const rgbToHex = (r, g, b) =>
  `#${[r, g, b]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`

const mixColor = (from, to, t) => {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  return rgbToHex(lerp(a.r, b.r, t), lerp(a.g, b.g, t), lerp(a.b, b.b, t))
}

const applyWallColors = (progress = wallProgress.value) => {
  const t = Math.max(0, Math.min(1, progress))
  const start = mixColor(wallPalette.startTop, wallPalette.endTop, t)
  const end = mixColor(wallPalette.startBottom, wallPalette.endBottom, t)
  document.body.style.setProperty('--wall-start', start)
  document.body.style.setProperty('--wall-end', end)
}

const handleDeckUpdated = ({ remaining, total }) => {
  const ratio = total > 0 ? 1 - Math.max(0, Math.min(1, remaining / total)) : 0
  wallProgress.value = ratio
  applyWallColors(ratio)
}

onMounted(() => {
  applyWallColors(0)
})

onBeforeUnmount(() => {
  document.body.style.removeProperty('--wall-start')
  document.body.style.removeProperty('--wall-end')
})
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
            <div class="rule-block">
              <h3>The Dungeon</h3>
              <p>
                Each room is populated by 4 cards. You may flee a room to put those cards on the
                bottom of the deck, or take actions for each card until only 1 card remains. Once 1
                card is left, 3 cards are drawn to populate the next room.
              </p>
            </div>
            <div class="rule-block">
              <h3>The Cards</h3>
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

    <ScoundrelGame @run-started="handleRunStarted" @deck-updated="handleDeckUpdated" />
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
  background: linear-gradient(170deg, hsla(0, 0%, 12%, 0.99), hsla(0, 0%, 4%, 0.99));
  border: 0.3rem solid rgba(150, 150, 150, 0.2);
  border-radius: 2px;
  padding: 1.5rem;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.4);
  color: hsl(0, 0%, 88%);
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
  box-shadow: 2px 4px 20px rgba(0, 0, 0, 0.4);
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
  line-height: 1.4rem;
  display: grid;
  gap: 0.5rem;
}

.rules {
  display: grid;
  gap: 1.6rem;
  padding: 1rem;
  background: hsla(199, 65%, 55%, 0.2);
  border-radius: 12px;
}

.rule-block {
  display: grid;
  gap: 0.2rem;
}

.hero-close {
  position: absolute;
  top: 12px;
  right: 12px;
  font-weight: 700;
  text-transform: uppercase;
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
