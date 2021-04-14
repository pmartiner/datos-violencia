<template>
  <SelectsWrapper>
    <Select
      v-model="hecho"
      :id="'select1'"
      :label="'Hecho o agresión'"
      :options="[
        {
          id: 1,
          name: 'Test1',
        },
      ]"
    />
    <Select
      v-model="estado"
      :id="'select2'"
      :label="'Estado'"
      :options="[
        {
          id: 1,
          name: 'Test1',
        },
        {
          id: 2,
          name: 'Test2',
        },
      ]"
    />
    <Select
      v-model="municipio"
      :id="'select3'"
      :label="'Municipio'"
      :options="[
        {
          id: 1,
          name: 'Test1',
        },
        {
          id: 2,
          name: 'Test2',
        },
        {
          id: 3,
          name: 'Test3',
        },
      ]"
      @change="onChange"
    />
  </SelectsWrapper>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import styled from "vue3-styled-components";
import HelloWorld from "./components/HelloWorld.vue";
import Select from "./components/Select.vue";

const SelectsWrapper = styled.section`
  display: flex;
  flex-flow: row wrap;
`;

@Options({
  components: {
    HelloWorld,
    Select,
    SelectsWrapper,
  },
})
// Primeras pruebas de métodos respondiendo a eventos y
// relación entre componentes padre-hijo ante cambios en los datos
export default class App extends Vue {
  hecho: string = "";
  estado: string = "";
  municipio: string = "";

  mounted() {
    if (this.hecho === "" && this.estado === "" && this.municipio === "") {
      alert("aló");
    }
  }

  onChange() {
    console.log(this.hecho, this.estado, this.municipio);
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

#app {
  font-family: Open Sans, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
