function ratingFactory(opts = {}) {
  const max = Number.isFinite(opts.max) ? opts.max : 5;
  const readonly = !!opts.readonly;
  const initial = Number.isFinite(opts.initial) ? opts.initial : 0;
  return {
    value: initial,
    max,
    readonly,
    isActive(star) {
      return this.value >= star;
    },
    set(value) {
      if (!this.readonly) this.value = value;
    },
    clear() {
      if (!this.readonly) this.value = 0;
    },
    inc() {
      if (!this.readonly && this.value < this.max) this.value++;
    },
    dec() {
      if (!this.readonly && this.value > 0) this.value--;
    },
  };
}
function ratingTemplate({ max, readonly, modelExpr }) {
  const modelAttr = modelExpr ? `x-model="${modelExpr}"` : "";
  const ro = String(readonly) === "true" ? "true" : "false";
  return `
      <div
        x-data="ratingFactory({ max: ${+max || 5}, readonly: ${ro} })"
        x-modelable="value"
        ${modelAttr}
        role="radiogroup"
        aria-label="Rating"
        class="flex items-center gap-1"
      >
        <template x-for="star in max" :key="star">
          <button
            type="button"
            role="radio"
            :aria-checked="value === star"
            :aria-label="\`\${star} star\`"
            class="text-2xl leading-none rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :class="isActive(star) ? 'text-yellow-500' : 'text-gray-300'"
            @click="set(star)"
            @keydown.enter.prevent="set(star)"
            @keydown.space.prevent="set(star)"
            @keydown.arrow-right.prevent="inc()" @keydown.arrow-up.prevent="inc()"
            @keydown.arrow-left.prevent="dec()"  @keydown.arrow-down.prevent="dec()"
          >★</button>
        </template>
        <span class="ml-2 text-sm text-gray-600">(<span x-text="value"></span>/<span x-text="max"></span>)</span>
      </div>
    `;
}
function RatingPlugin(Alpine) {
  window.ratingFactory = ratingFactory;
  Alpine.directive("rating", (el, { expression }, { evaluate, cleanup }) => {
    const max = el.dataset.max ?? 5;
    const readonly = el.dataset.readonly ?? "false";
    const modelExpr = el.getAttribute("x-model");
    if (modelExpr) el.removeAttribute("x-model");
    const hostClass = el.getAttribute("class") || "";
    el.innerHTML = ratingTemplate({ max, readonly, modelExpr });
    Alpine.initTree(el);
    cleanup(() => {
      // Any manual listeners/timeouts could be cleared here if you add them in the future.
    });
  });
}
document.addEventListener("alpine:init", () => {
  window.Alpine.plugin(RatingPlugin);
});
