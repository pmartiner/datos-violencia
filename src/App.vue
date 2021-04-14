<template>
  <h1>Datos de crímenes y hechos por municipio</h1>
  <SelectsWrapper>
    <SelectComponent
      v-model="hecho"
      :id="'select1'"
      :label="'Hecho o agresión'"
      :options="optionsHechos"
      @change="onChange"
    />
    <SelectComponent
      v-model="estado"
      :id="'select2'"
      :label="'Estado'"
      :options="optionsEstado"
      @change="onEstadoChange"
    />
    <SelectComponent
      v-model="municipio"
      :id="'select3'"
      :label="'Municipio'"
      :options="optionsMunicipios"
      @change="onChange"
    />
  </SelectsWrapper>
  <SpinnerLoader v-if="loading" />
  <section v-else-if="!loading && dataResponse.length > 0">
    {{ dataResponse }}
  </section>
</template>

<script lang="ts">
// Librerías
import { Options, Vue } from "vue-class-component";
// Opté por la librería de styled-components porque me permite aislar
// los estilos de CSS por componente
import styled from "vue3-styled-components";
import { csv } from "d3-fetch";
import _uniqBy from "lodash/uniqBy";

// Interfaces
import { Option, DataResponse } from "./interfaces/interfaces";

// Componentes
import SpinnerLoader from "./components/SpinnerLoader.vue";
import SelectComponent from "./components/SelectComponent.vue";

// Utils
import { AxiosResponse } from "axios";

// Api
import fetchCrimenesByMunicipio from "./api/crimenesMunicipio";

const SelectsWrapper = styled.section`
  display: flex;
  flex-flow: row wrap;
`;

@Options({
  components: {
    SelectComponent,
    SelectsWrapper,
    SpinnerLoader,
  },
})
// Primeras pruebas de métodos respondiendo a eventos y
// relación entre componentes padre-hijo ante cambios en los datos
export default class App extends Vue {
  loading: boolean = false;
  dataResponse: DataResponse[] = [];
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
      this.loading = true;
      return fetchCrimenesByMunicipio(
        parseInt(this.hecho),
        parseInt(this.estado),
        parseInt(this.municipio)
      )
        .then((response) => {
          console.log(response);
          this.dataResponse = response.data;
          return response;
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  onChange() {
    if (this.hecho !== "" && this.estado !== "" && this.municipio !== "") {
      this.loading = true;
      return fetchCrimenesByMunicipio(
        parseInt(this.hecho),
        parseInt(this.estado),
        parseInt(this.municipio)
      )
        .then((response: AxiosResponse<DataResponse[]>) => {
          console.log(response);
          this.dataResponse = response.data;
          return response;
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

#app {
  padding: 5px 25px;
  font-family: Open Sans, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
