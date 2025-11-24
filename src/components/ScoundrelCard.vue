<script setup>
const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

const suitColor = {
  clubs: '#1f2937',
  spades: '#1f2937',
  diamonds: '#b45309',
  hearts: '#9f1239',
}

const typeLabel = {
  monster: 'Monster',
  weapon: 'Weapon',
  potion: 'Potion',
}

const handleClick = () => {
  if (props.disabled) return
  emit('select', props.card)
}
</script>

<template>
  <Button
    class="card"
    :disabled="disabled"
    :data-kind="card.type"
    :data-active="active"
    @click="handleClick"
    severity="secondary"
    outlined
  >
    <header class="card__label">
      <span class="pill">{{ typeLabel[card.type] }}</span>
      <span class="name">{{ card.rank }} of {{ card.suit }}</span>
    </header>
    <div class="face">
      <div class="rank" :style="{ color: suitColor[card.suit] }">{{ card.rank }}</div>
      <div class="suit" :style="{ color: suitColor[card.suit] }">{{ card.suit }}</div>
    </div>
    <dl class="stats">
      <div class="stat">
        <dt v-if="card.type === 'monster'">Damage</dt>
        <dt v-else-if="card.type === 'weapon'">Block</dt>
        <dt v-else>Heal</dt>
        <dd>{{ card.value }}</dd>
      </div>
    </dl>
  </Button>
</template>

<style scoped>
.card.card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 100%;
  height: 100%;
  min-height: 0;
  text-align: left;
  border: 4px solid var(--border-color);
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.95), rgba(236, 233, 226, 0.95)),
    radial-gradient(circle at 18% 18%, rgba(148, 139, 122, 0.3), transparent 40%),
    radial-gradient(circle at 80% 10%, rgba(255, 214, 165, 0.22), transparent 40%) !important;
  color: #1f2937;
  padding: 1rem;
  border-radius: 16px;
  transition:
    transform 140ms ease,
    border-color 140ms ease,
    box-shadow 140ms ease;
  cursor: pointer;
  box-shadow: 0 6px 12px var(--shadow-color);
  box-sizing: border-box;
}

.card.card,
.card.card:hover:not(:disabled),
.card.card:active:not(:disabled),
.card.card:focus-visible,
.card.card[data-active='true'] {
  border-width: 8px !important;
  border-style: solid !important;
}

.card.card:focus-visible {
  outline: none;
}

.card.card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card.card:hover:not(:disabled) {
  transform: translateY(-8px);
  border: 4px;
  border-color: var(--border-hover);
  box-shadow: 0 12px 20px var(--shadow-color);
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.95), rgba(236, 233, 226, 0.95)),
    radial-gradient(circle at 18% 18%, rgba(148, 139, 122, 0.3), transparent 40%),
    radial-gradient(circle at 80% 10%, rgba(255, 214, 165, 0.22), transparent 40%) !important;
}

.card.card[data-active='true'] {
  border-color: var(--border-hover);
  box-shadow: 0 8px 20px hsla(0, 0%, 81%, 0.6);
  transform: translateY(-4px);
}

.card.card:active:not(:disabled) {
  transform: translateY(-4px);
}

.card__label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #080300;
  width: 100%;
  align-self: stretch;
  justify-content: flex-start;
  text-align: left;
}

.pill {
  text-transform: capitalize;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  letter-spacing: 0.01em;
  background: rgba(0, 0, 0, 0.04);
}

.card[data-kind='monster'] .pill {
  background-color: #3b1212;
  color: #fecdd3;
  border: 1px solid rgba(248, 113, 113, 0.35);
}

.card[data-kind='weapon'] .pill {
  background-color: #3b3007;
  color: #fef9c3;
  border: 1px solid rgba(250, 204, 21, 0.35);
}

.card[data-kind='potion'] .pill {
  background-color: #0f2f23;
  color: #bbf7d0;
  border: 1px solid rgba(52, 211, 153, 0.35);
}

.card[data-kind='monster'] {
  --border-color: #4d1010;
  --border-hover: #4d1010;
  --shadow-color: rgba(254, 205, 211, 0.28);
  --shadow-strong: rgba(254, 205, 211, 0.52);
}

.card[data-kind='weapon'] {
  --border-color: #4e3f07;
  --border-hover: #4e3f07;
  --shadow-color: rgba(254, 249, 195, 0.28);
  --shadow-strong: rgba(254, 249, 195, 0.52);
}

.card[data-kind='potion'] {
  --border-color: #094926;
  --border-hover: #094926;
  --shadow-color: rgba(187, 247, 208, 0.28);
  --shadow-strong: rgba(187, 247, 208, 0.52);
}

.name {
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: capitalize;
}

.face {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
  text-align: center;
  font-family: 'Iceberg', 'Noto Sans', sans-serif;
}

.rank {
  font-size: 4.5rem;
  font-weight: 800;
}

.suit {
  text-transform: capitalize;
  font-weight: 700;
}

.stats {
  display: flex;
  gap: 1.2rem;
  margin: 0;
  margin-top: auto;
  width: 100%;
  align-self: stretch;
  justify-content: flex-end;
  text-align: right;
}

.stat dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(31, 41, 55, 0.7);
}

.stat dd {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}
</style>
