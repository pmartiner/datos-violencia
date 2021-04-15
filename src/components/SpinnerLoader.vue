<template>
  <Spinner />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
// Opté por la librería de styled-components porque me permite aislar
// los estilos de CSS por componente
import styled from "vue3-styled-components";

// Spinner tomado de https://codepen.io/chris22smith/pen/gOpdmma
const Spinner = styled.i`
  animation: spin 1s infinite linear;
  border: solid 2vmin transparent;
  border-radius: 50%;
  border-right-color: #09f;
  border-top-color: #09f;
  box-sizing: border-box;
  height: 20vmin;
  left: calc(50% - 10vmin);
  position: fixed;
  top: calc(50% - 10vmin);
  width: 20vmin;
  z-index: 1;

  &:before {
    animation: spin 2s infinite linear;
    border: solid 2vmin transparent;
    border-radius: 50%;
    border-right-color: #3cf;
    border-top-color: #3cf;
    box-sizing: border-box;
    content: "";
    height: 16vmin;
    left: 0;
    position: absolute;
    top: 0;
    width: 16vmin;
  }
  &:after {
    animation: spin 3s infinite linear;
    border: solid 2vmin transparent;
    border-radius: 50%;
    border-right-color: #6ff;
    border-top-color: #6ff;
    box-sizing: border-box;
    content: "";
    height: 12vmin;
    left: 2vmin;
    position: absolute;
    top: 2vmin;
    width: 12vmin;
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;

@Options({
  components: {
    Spinner,
  },
})

// Utilizo la notación de clase por mi familiaridad con React
export default class SpinnerLoader extends Vue {}
</script>
