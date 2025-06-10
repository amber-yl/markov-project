import { ref } from 'vue'

export function useCardSelection() {
  const selectedCards = ref<number[]>([])
  const isMultiSelect = ref(false)
  const activeCardId = ref<number>(-1)

  const toggleMultiSelect = () => {
    isMultiSelect.value = !isMultiSelect.value
    if (!isMultiSelect.value) {
      selectedCards.value = []
    }
  }

  const toggleCardSelection = (id: number) => {
    const position = selectedCards.value.indexOf(id)
    if (position === -1) {
      selectedCards.value.push(id)
    } else {
      selectedCards.value.splice(position, 1)
    }
  }

  const handleMouseEnter = (id: number) => {
    activeCardId.value = id
  }

  const handleMouseLeave = () => {
    activeCardId.value = -1
  }

  return {
    selectedCards,
    isMultiSelect,
    activeCardId,
    toggleMultiSelect,
    toggleCardSelection,
    handleMouseEnter,
    handleMouseLeave
  }
}