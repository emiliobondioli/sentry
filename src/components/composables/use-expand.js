import { ref } from "vue";

export default function useExpand() {
  const expanded = ref(false);

  const expand = () => {
    expanded.value = true
  }
  
  const collapse = () => {
    expanded.value = false
  }

  const toggle = () => {
    if(expanded.value) collapse()
    else expand()
  }

  return {
    expand,
    collapse,
    toggle,
    expanded
  };
}
