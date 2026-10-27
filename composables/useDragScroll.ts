import { onMounted, onUnmounted, type Ref } from 'vue'

export function useDragScroll(elRef: Ref<HTMLElement | null>) {
  let isDown = false
  let startX = 0
  let scrollLeft = 0
  let hasDragged = false

  const onMouseDown = (e: MouseEvent) => {
    const el = elRef.value
    if (!el) return
    isDown = true
    hasDragged = false
    startX = e.pageX - el.offsetLeft
    scrollLeft = el.scrollLeft
  }

  const onMouseLeave = () => {
    isDown = false
  }

  const onMouseUp = () => {
    isDown = false
  }

  const onMouseMove = (e: MouseEvent) => {
    const el = elRef.value
    if (!isDown || !el) return
    const x = e.pageX - el.offsetLeft
    const walk = (x - startX) * 1.5
    if (Math.abs(walk) > 6) {
      hasDragged = true
    }
    el.scrollLeft = scrollLeft - walk
  }

  const onClickCapture = (e: MouseEvent) => {
    if (hasDragged) {
      e.stopPropagation()
      e.preventDefault()
      hasDragged = false
    }
  }

  const onWheel = (e: WheelEvent) => {
    const el = elRef.value
    if (!el) return
    // Allow horizontal wheel scrolling if content overflows
    if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
  }

  onMounted(() => {
    const el = elRef.value
    if (!el) return
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mouseleave', onMouseLeave)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('click', onClickCapture, true)
    el.addEventListener('wheel', onWheel, { passive: false })
  })

  onUnmounted(() => {
    const el = elRef.value
    if (!el) return
    el.removeEventListener('mousedown', onMouseDown)
    el.removeEventListener('mouseleave', onMouseLeave)
    el.removeEventListener('mouseup', onMouseUp)
    el.removeEventListener('mousemove', onMouseMove)
    el.removeEventListener('click', onClickCapture, true)
    el.removeEventListener('wheel', onWheel)
  })
}
