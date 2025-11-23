<script setup>
import { computed, reactive, ref } from 'vue'
import ScoundrelCard from './ScoundrelCard.vue'

const emit = defineEmits(['run-started'])

const maxHealth = 20
const isDev = import.meta.env.DEV
const debugCollapsed = ref(true)

const ranks = [
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
  { label: 'J', value: 11 },
  { label: 'Q', value: 12 },
  { label: 'K', value: 13 },
  { label: 'A', value: 14 },
]

const suits = ['clubs', 'spades', 'diamonds', 'hearts']

const createDeck = () => {
  const deck = []

  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      const isRedSuit = suit === 'hearts' || suit === 'diamonds'
      const isFaceOrAce = ['J', 'Q', 'K', 'A'].includes(rank.label)
      if (isRedSuit && isFaceOrAce) return

      const type =
        suit === 'clubs' || suit === 'spades'
          ? 'monster'
          : suit === 'diamonds'
            ? 'weapon'
            : 'potion'

      deck.push({
        id: `${rank.label}-${suit}-${Math.random().toString(16).slice(2)}`,
        suit,
        rank: rank.label,
        value: rank.value,
        type,
      })
    })
  })

  return shuffle(deck)
}

const shuffle = (list) => {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const state = reactive({
  board: Array(4).fill(null),
  deck: [],
  discard: [],
  health: maxHealth,
  status: 'ready', // ready | playing | won | lost
  message: 'Start a new run to enter the dungeon.',
  turn: 1,
  room: 1,
  potionUsedThisRoom: false,
  weapon: null,
  lastWeaponUseValue: null,
  selectedCard: null,
  roomInteracted: false,
  previousRoomFled: false,
})

const deckCount = computed(() => state.deck.length)
const boardCount = computed(() => state.board.filter(Boolean).length)
const roomLabel = computed(() => `Room ${state.room}`)
const weaponLabel = computed(() => {
  if (!state.weapon) return 'None'
  return `${state.weapon.rank} of ${formatSuit(state.weapon.suit)}`
})
const weaponRuleLabel = computed(() => {
  if (!state.weapon) return 'Equip a diamond to block.'
  if (state.lastWeaponUseValue === null) return 'Next use: any monster.'
  return `Next use: monster under ${state.lastWeaponUseValue}`
})

const statusLabel = computed(() => {
  if (state.status === 'won') return 'Victory! You cleared the dungeon!'
  if (state.status === 'lost') return 'Defeated. Your run ends here.'
  if (state.status === 'playing') return state.message || 'Choose a card to resolve.'
  return state.message
})

const canFlee = computed(
  () =>
    state.status === 'playing' &&
    !state.roomInteracted &&
    !state.previousRoomFled &&
    boardCount.value === 4,
)

const contextActions = computed(() => {
  if (state.status !== 'playing' || !state.selectedCard) return []
  const card = state.selectedCard
  const actions = []

  if (card.type === 'monster') {
    actions.push({
      key: 'fight-unarmed',
      label: 'Fight unarmed',
      severity: 'info',
      outlined: false,
      disabled: false,
      onClick: fightUnarmed,
    })
    actions.push({
      key: 'use-weapon',
      label: 'Use weapon',
      severity: 'warning',
      outlined: !canUseWeaponOn(card),
      disabled: !canUseWeaponOn(card),
      onClick: fightWithWeapon,
    })
  }

  if (card.type === 'weapon') {
    actions.push({
      key: 'equip-weapon',
      label: 'Equip weapon',
      severity: 'info',
      outlined: false,
      disabled: false,
      onClick: equipWeapon,
    })
  }

  if (card.type === 'potion') {
    actions.push({
      key: 'drink-potion',
      label: state.potionUsedThisRoom ? 'Potion already used' : 'Drink potion',
      severity: 'success',
      outlined: state.potionUsedThisRoom,
      disabled: state.potionUsedThisRoom,
      onClick: drinkPotion,
    })
  }

  return actions
})

const startRun = () => {
  state.deck = createDeck()
  state.board = Array(4).fill(null)
  state.discard = []
  state.health = maxHealth
  state.status = 'playing'
  state.turn = 1
  state.message = 'Four cards await. Pick wisely.'
  state.room = 1
  state.potionUsedThisRoom = false
  state.weapon = null
  state.lastWeaponUseValue = null
  state.selectedCard = null
  state.roomInteracted = false
  state.previousRoomFled = false
  emit('run-started')
  drawNewRoom(4)
}

const selectCard = (card) => {
  if (state.status !== 'playing') return
  state.selectedCard = card
  state.message = `Choose an action for ${formatCardLabel(card)}.`
}

const fightUnarmed = () => {
  if (!state.selectedCard || state.selectedCard.type !== 'monster') return
  const card = state.selectedCard
  const damage = card.value
  state.health -= damage
  state.message = `${formatCardLabel(card)} hits for ${damage}.`
  state.roomInteracted = true
  resolveCard(card)
}

const fightWithWeapon = () => {
  if (!state.selectedCard || state.selectedCard.type !== 'monster') return
  const card = state.selectedCard
  if (!canUseWeaponOn(card)) return

  const blockedAmount = Math.min(card.value, state.weapon.value)
  const damage = card.value - blockedAmount
  state.lastWeaponUseValue = card.value
  state.health -= damage
  state.message =
    damage === 0
      ? `${formatCardLabel(card)} is fully blocked by ${formatCardLabel(state.weapon)}.`
      : `${formatCardLabel(card)} hits for ${damage} (blocked ${blockedAmount}).`
  state.roomInteracted = true
  resolveCard(card)
}

const equipWeapon = () => {
  if (!state.selectedCard || state.selectedCard.type !== 'weapon') return
  const card = state.selectedCard
  state.weapon = card
  state.lastWeaponUseValue = null
  state.message = `Equipped ${formatCardLabel(card)}. Use on descending monster strengths.`
  state.roomInteracted = true
  resolveCard(card)
}

const drinkPotion = () => {
  if (!state.selectedCard || state.selectedCard.type !== 'potion') return
  const card = state.selectedCard
  if (!state.potionUsedThisRoom) {
    state.health = Math.min(maxHealth, state.health + card.value)
    state.potionUsedThisRoom = true
    state.message = `You recover ${card.value} health.`
  } else {
    state.message = `${formatCardLabel(card)} is wasted; only one potion works per room.`
  }
  state.roomInteracted = true
  resolveCard(card)
}

const canUseWeaponOn = (card) =>
  state.weapon &&
  card.type === 'monster' &&
  (state.lastWeaponUseValue === null || card.value < state.lastWeaponUseValue)

const resolveCard = (card) => {
  const index = state.board.findIndex((entry) => entry && entry.id === card.id)
  if (index === -1) return

  state.board[index] = null
  state.discard.push(card)
  state.turn += 1
  state.selectedCard = null

  if (state.health <= 0) {
    state.status = 'lost'
    state.message = 'You fall in the dungeon. Try again.'
    return
  }

  handleRoomProgress()
}

const handleRoomProgress = () => {
  if (boardCount.value === 1 && state.deck.length) {
    state.room += 1
    state.potionUsedThisRoom = false
    state.roomInteracted = false
    state.previousRoomFled = false
    drawNewRoom(3)
    state.message = `A new room opens. ${roomLabel.value}.`
    return
  }

  if (boardCount.value === 0 && state.deck.length) {
    state.room += 1
    state.potionUsedThisRoom = false
    state.roomInteracted = false
    state.previousRoomFled = false
    drawNewRoom(4)
    state.message = `A new room opens. ${roomLabel.value}.`
  }

  if (!state.deck.length && boardCount.value === 0) {
    state.status = 'won'
    state.message = 'All threats cleared. A scoundrel lives to fight again.'
  }
}

const drawNewRoom = (count) => {
  const drawCount = Math.min(count, state.deck.length)
  let placed = 0
  for (let i = 0; i < state.board.length && placed < drawCount; i += 1) {
    if (state.board[i] === null) {
      state.board[i] = state.deck.shift()
      placed += 1
    }
  }
}

const formatCardLabel = (card) => `${card.rank} of ${formatSuit(card.suit)}`
const formatSuit = (suit) => suit.charAt(0).toUpperCase() + suit.slice(1)

const fleeRoom = () => {
  if (!canFlee.value) return

  const shuffledRoom = shuffle(state.board.filter(Boolean))
  state.board = Array(4).fill(null)
  state.deck.push(...shuffledRoom)

  state.room += 1
  state.potionUsedThisRoom = false
  state.roomInteracted = false
  state.previousRoomFled = true
  state.selectedCard = null
  state.message = `${roomLabel.value}: You flee, the dungeon shifts.`
  state.turn += 1

  drawNewRoom(4)
}

const restoreFullHealth = () => {
  state.health = maxHealth
  if (state.status === 'lost') {
    state.status = 'playing'
  }
  state.message = 'Health restored (debug).'
}

const toggleDebug = () => {
  debugCollapsed.value = !debugCollapsed.value
}

const handleDebugClick = () => {
  if (debugCollapsed.value) {
    debugCollapsed.value = false
  }
}
</script>

<template>
  <section class="game-shell">
    <header class="game-hud">
      <div class="hud-block">
        <p class="label">Deck</p>
        <p class="value">{{ deckCount }}</p>
      </div>
      <div class="hud-block">
        <p class="label">Board</p>
        <p class="value">{{ boardCount }}</p>
      </div>
      <div class="hud-block">
        <p class="label">Room</p>
        <p class="value">{{ roomLabel }}</p>
      </div>
      <div class="hud-actions">
        <Button
          :label="state.status === 'playing' ? 'Restart Run' : 'Start New Run'"
          type="button"
          severity="warn"
          @click="startRun"
        />
        <span class="turn">Turn {{ state.turn }}</span>
      </div>
    </header>

    <div class="status">
      <p class="status__text">{{ statusLabel }}</p>
      <p v-if="state.status === 'won'" class="status__hint">
        Discarded: {{ state.discard.length }} cards
      </p>
    </div>

    <div class="board-rail">
      <div class="board">
        <div v-for="(card, idx) in state.board" :key="card ? card.id : `slot-${idx}`" class="slot">
          <template v-if="card">
            <div class="card-surface">
              <ScoundrelCard
                :card="card"
                :disabled="state.status !== 'playing'"
                :active="state.selectedCard && state.selectedCard.id === card.id"
                @select="selectCard"
              />
            </div>
            <div
              v-if="
                state.selectedCard && state.selectedCard.id === card.id && contextActions.length
              "
              class="card-actions"
            >
              <div class="card-actions__list">
                <Button
                  v-for="action in contextActions"
                  :key="action.key"
                  :label="action.label"
                  :severity="action.severity"
                  :outlined="action.outlined"
                  :disabled="action.disabled"
                  type="button"
                  @click="action.onClick"
                />
              </div>
            </div>
          </template>
          <div v-else class="slot-placeholder" aria-hidden="true"></div>
        </div>
      </div>
    </div>

    <footer class="footer-hud">
      <div class="hud-block">
        <div class="stat-group">
          <p class="label">Health</p>
          <p class="value" :data-warn="state.health <= maxHealth * 0.25">
            {{ state.health }} / {{ maxHealth }}
          </p>
        </div>
        <div class="stat-group weapon-group">
          <p class="label">Weapon</p>
          <p class="value">{{ weaponLabel }}</p>
          <p class="hint">{{ weaponRuleLabel }}</p>
        </div>
      </div>
      <div class="hud-block flee-block">
        <p class="label">Room Exit</p>
        <Button
          label="Flee this room"
          type="button"
          severity="help"
          outlined
          :disabled="!canFlee"
          @click="fleeRoom"
        />
      </div>
    </footer>

    <div
      v-if="isDev"
      class="debug-shell"
      :class="{ 'debug-shell--collapsed': debugCollapsed }"
      @click="handleDebugClick"
    >
      <div class="debug-panel">
        <div class="debug-row">
          <p><strong>Deck (top to bottom)</strong></p>
          <div class="debug-actions">
            <Button
              label="Restore full health (debug)"
              type="button"
              severity="secondary"
              outlined
              @click.stop="restoreFullHealth"
            />
            <Button
              :label="debugCollapsed ? 'Open debug' : 'Stow debug'"
              type="button"
              severity="help"
              outlined
              @click.stop="toggleDebug"
            />
          </div>
        </div>
        <div class="debug-list">
          <span v-for="(card, idx) in state.deck" :key="card.id">
            {{ idx + 1 }}. {{ formatCardLabel(card) }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.game-shell {
  width: min(1080px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  color: #e4e4e7;
  padding-bottom: 280px;
}

.game-hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  background: linear-gradient(135deg, rgba(24, 24, 27, 0.9), rgba(9, 9, 11, 0.85));
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem 1.25rem;
  border-radius: 18px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
}

.hud-block {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  padding: 0.9rem 0.9rem;
  display: grid;
  gap: 0.3rem;
}

.label {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  color: rgba(228, 228, 231, 0.7);
  margin: 0;
  line-height: 1.2;
}

.value {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0.02rem 0 0;
  line-height: 1.2;
}

.value[data-warn='true'] {
  color: #fca5a5;
}

.hud-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  grid-column: span 2;
}

.turn {
  font-weight: 600;
  color: rgba(228, 228, 231, 0.9);
}

.status {
  background: rgba(24, 24, 27, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 0.9rem 1rem;
  border-radius: 14px;
}

.status__text {
  margin: 0;
  font-weight: 700;
  font-size: 1.1rem;
}

.status__hint {
  margin: 0.35rem 0 0;
  color: rgba(228, 228, 231, 0.8);
}

.board {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  justify-items: stretch;
  align-items: start;
  width: 100%;
}

.slot {
  position: relative;
  width: 100%;
}

.slot-placeholder {
  width: 100%;
  aspect-ratio: 7 / 10;
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
}

.card-surface {
  position: relative;
  width: 100%;
  aspect-ratio: 7 / 10;
}

.card-surface > * {
  position: absolute;
  inset: 0;
}

.empty-board {
  grid-column: 1 / -1;
  padding: 1rem;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
}

.card-actions {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  display: grid;
  padding: 0.7rem 1.5rem;
  z-index: 3;
}

.card-actions__list {
  display: grid;
  gap: 0.6rem;
}

.debug-panel {
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 0.9rem 1.1rem;
  display: grid;
  gap: 0.35rem;
  color: rgba(228, 228, 231, 0.8);
}

.debug-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.debug-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.8rem;
  font-size: 0.9rem;
}

.footer-hud {
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  width: min(1080px, calc(100% - 32px));
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  background: linear-gradient(135deg, rgba(15, 12, 10, 0.95), rgba(22, 18, 16, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 0.85rem 1rem;
  box-shadow:
    0 16px 50px rgba(0, 0, 0, 0.55),
    0 -4px 18px rgba(0, 0, 0, 0.35);
  z-index: 3;
}

.flee-block {
  display: grid;
  align-content: center;
  gap: 0.35rem;
}

.board-rail {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(1080px, 100%);
  display: flex;
  justify-content: center;
  padding: 0.5rem 0 0.5rem;
  z-index: 2;
}

.stat-group {
  display: grid;
  gap: 0.04rem;
}

.weapon-group {
  margin-top: 0.35rem;
}

.debug-shell {
  position: fixed;
  width: 400px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 4;
  transition:
    transform 0.4s ease,
    opacity 0.4s ease,
    filter 0.4s ease;
}

.debug-shell--collapsed {
  transform-origin: center center;
  transform: translate(-50%, -50%) translateX(40vw) scale(0.8);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  cursor: pointer;
}

.debug-panel {
  background: rgba(24, 24, 27, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 0.9rem 1.1rem;
  display: grid;
  gap: 0.35rem;
  color: rgba(228, 228, 231, 0.9);
  box-shadow: 0 12px 38px rgba(0, 0, 0, 0.45);
}

.debug-actions {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .hud-actions {
    grid-column: span 1;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
