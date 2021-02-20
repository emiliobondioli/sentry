<template>
  <div class="lds-dual-ring"></div>
</template>

<style>
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 80%;
  height: 80%;
  border-radius: 100%;
  animation: lds-dual-ring 1.2s linear infinite;
  @apply border-2;
  @apply border-green-light;
  border-right-color: transparent;
  border-left-color: transparent;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
