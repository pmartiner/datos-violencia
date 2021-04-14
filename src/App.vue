<template>
  <SelectsWrapper>
    <Select
      v-model="hecho"
      :id="'select1'"
      :label="'Hecho o agresión'"
      :options="optionsHechos"
      @change="onChange"
    />
    <Select
      v-model="estado"
      :id="'select2'"
      :label="'Estado'"
      :options="optionsEstado"
      @change="onEstadoChange"
    />
    <Select
      v-model="municipio"
      :id="'select3'"
      :label="'Municipio'"
      :options="optionsMunicipios"
      @change="onChange"
    />
  </SelectsWrapper>
</template>

<script lang="ts">
// Librerías
import { Options, Vue } from "vue-class-component";
import styled from "vue3-styled-components";
import { csv } from "d3-fetch";
import _uniqBy from "lodash/uniqBy";

// Interfaces
import { Option } from "./interfaces/interfaces";

// Componentes
import Select from "./components/Select.vue";

// Utils
import request from "./utils/request";

const SelectsWrapper = styled.section`
  display: flex;
  flex-flow: row wrap;
`;

@Options({
  components: {
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
  optionsHechos: Option[] = [];
  optionsEstado: Option[] = [];
  optionsMunicipios: Option[] = [
    {
      id: "",
      name: "Por favor, seleccione un estado primero.",
    },
  ];

  async apiCall() {
    const response = await request(
      "https://spotlight-unfpa.datacivica.org/api/v1/timeline",
      "POST",
      {
        id_crime: parseInt(this.hecho),
        id_ent: parseInt(this.estado),
        id_mun1: parseInt(this.municipio),
      }
    );

    console.log(response);
  }

  mounted() {
    csv(
      "https://raw.githubusercontent.com/pmartiner/prueba-tecnica/main/src/data/crimenes.csv"
    ).then((data) => {
      // Mapeo todos los datos del CSV a un objeto tipo Option para pasarlo como props al Select
      this.optionsHechos = data.map((elem) => ({
        id: `${elem.id_crime}`,
        name: `${elem.crime_name}`,
      }));
    });

    csv(
      "https://raw.githubusercontent.com/pmartiner/prueba-tecnica/main/src/data/entidades_municipios.csv"
    ).then((data) => {
      // Mapeo todos los datos del CSV a un objeto tipo Option para pasarlo como props al Select
      const estados = data.map((elem) => ({
        id: `${elem.id_ent}`,
        name: `${elem.name_ent}`,
      }));
      // Como los estados están repetidos, limpio el arreglo con _uniqBy de Lodash
      const estadosFiltered = _uniqBy(estados, "id");

      this.optionsEstado = [...estadosFiltered];
    });
  }

  onEstadoChange() {
    csv(
      "https://raw.githubusercontent.com/pmartiner/prueba-tecnica/main/src/data/entidades_municipios.csv"
    ).then((data) => {
      // Si se selecciona un estado, entonces muestro los municipios de ese estado.
      this.optionsMunicipios = data
        .filter((elem) => elem.id_ent === this.estado)
        .map((elem) => ({
          id: `${elem.id_mun}`,
          name: `${elem.name_mun}`,
        }));
    });

    if (this.hecho !== "" && this.estado !== "" && this.municipio !== "") {
      this.apiCall();
    }
  }

  onChange() {
    if (this.hecho !== "" && this.estado !== "" && this.municipio !== "") {
      this.apiCall();
    }
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
