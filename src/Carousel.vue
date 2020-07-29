<template>
  <div class="_CustomCarousel">
    <div class="scroll-wrapper">
      <slot name="left" v-bind="{show: leftToggle, scroll: previous}"></slot>
      <slot name="right" v-bind="{show: rightToggle, scroll: next}"></slot>
      
      <div class="scroll-wrapper">
        <div class="wrapper"
          ref="wrapper"
          @scroll.passive='_onScroll'
        >
          <slot></slot>
        </div>
      </div>
    </div>
    <div v-if="numberOfPages !== 1" class="pagination">
      <slot v-for="num in numberOfPages"
        name="pagination"
        v-bind="{
          number: num,
          active: num === (active + 1),
          scroll: () => scroll(num - 1),
        }"
      ></slot>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      resizeTimeout: null,
      scrollTimeout: null,

      rightToggle: false,
      leftToggle: false,
      numberOfPages: 0,
      active: this.value,
    }
  },
  created() {
    window.addEventListener('resize', this._resize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._resize)
  },
  mounted() {
    this._calc()
  },
  updated() {
    this._calc()
  },
  methods: {
    focus(elm) {
      if (elm && elm.getBoundingClientRect) {
        const div = this.$refs.wrapper
        const rect = elm.getBoundingClientRect()

        div.scrollLeft = div.scrollLeft + (rect.x - div.clientWidth / 2)
      }
    },
    previous() {
      if (this.active !== 0)
        this.scroll(this.active - 1)
    },
    next() {
      if ((this.active + 1) !== this.numberOfPages)
        this.scroll(this.active + 1)
    },
    scroll(index) {
      if (index === this.active)
        return index;
      if ((index + 1) > this.numberOfPages) {
        index = this.numberOfPages - 1
      }
      if (index < 0) {
        index = 0
      }
      
      const div = this.$refs.wrapper
      const max = div.scrollWidth
      
      let newScroll = index * div.clientWidth

      if (newScroll > max)
        newScroll = max

      div.scrollLeft = newScroll
      this.$emit('trigger', newScroll)
      this._calc()
      return index
    },
    _onScroll() {
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout)
        this.scrollTimeout = null
      }
      
      this.scrollTimeout = setTimeout(() => {
        this._calc()
      }, 100)
    },
    _resize() {
      if (this.resizeTimeout) { 
        clearTimeout(this.resizeTimeout)
        this.resizeTimeout = null
      }

      this.resizeTimeout = setTimeout(() => {
        this._calc()
      }, 100)
    },
    _calc() {
      const div = this.$refs.wrapper
      
      this.numberOfPages = Math.ceil(div.scrollWidth / div.clientWidth)
      this.active = Math.ceil(div.scrollLeft / div.clientWidth) | 0
      this.rightToggle = (div.scrollLeft + div.clientWidth) < div.scrollWidth
      this.leftToggle = 0 !== div.scrollLeft

      this.$emit('calculated', {
        numberOfPages: this.numberOfPages,
        activePage: this.active,
        showRightNavigation: this.leftToggle,
        showLeftNavigation: this.rightToggle,
      })
    },
  },
  watch: {
    value(val) {
      const value = this.scroll(val)
      if (value !== this.active)
        this.active = value
    },
    active(val) {
      this.$emit('input', val)
    },
  },
}

</script>

<style scoped>

._CustomCarousel, .scroll-wrapper {
  position: relative;
  max-width: 100%;
}

.pagination, .scroll-wrapper, .wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-basis: 100%;
}

.scroll-wrapper {
  position: relative;
  width: 100%;
}

.wrapper {
  justify-content: flex-start;
  scroll-behavior: smooth;
  overflow: auto;
  width: unset;
  flex-basis: unset;
  max-width: 100%;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: -ms-autohiding-scrollbar;
}

.wrapper::-webkit-scrollbar {
  display: none;
}

</style>
