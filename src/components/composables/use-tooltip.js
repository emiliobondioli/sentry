import { ref } from "vue";

export default function useTooltip() {
  const show = ref(false);

  const open = () => {
    show.value = true;
    document.addEventListener("click", close);
  };
  
  const close = () => {
    show.value = false;
    document.removeEventListener("click", close);
  };

  return {
    open,
    close,
    show,
  };
}
