<template>
  <div class="loader lds-bars">
    <div class="bg-gray-light" />
    <div class="bg-gray-light" />
    <div class="bg-gray-light" />
    <div class="bg-gray-light" />
    <div class="bg-gray-light" />
  </div>
</template>

<style>
.lds-bars {
  display: flex;
  justify-content: space-between;
  width: 3rem;
  height: 1.5rem;
}
.lds-bars div {
  display: block;
  flex: 1;
  margin: 0 0.1rem;
  animation: lds-bars 1.6s cubic-bezier(0, 0.5, 0.5, 1) infinite;
}
.lds-bars div:nth-child(1) {
  animation-delay: 0.0s;
}
.lds-bars div:nth-child(2) {
  animation-delay: 0.12s;
}
.lds-bars div:nth-child(3) {
  animation-delay: 0.24s;
}
.lds-bars div:nth-child(4) {
  animation-delay: 0.12s;
}
.lds-bars div:nth-child(5) {
  animation-delay: 0.0s;
}
@keyframes lds-bars {
  0% {
    transform: scale(1, 1.4);
  }
  50%,
  100% {
    transform: scale(1, 1);
  }
}
</style>
