<template>
  <main>
    <AppTitle>Datos de crímenes y hechos por municipio</AppTitle>
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
      <ChartTitle>{{ chartTitle }}</ChartTitle>
      <ChartWrapper id="data-chart" />
      <ChartSource>Fuente: Mortalidad general, INEGI</ChartSource>
    </section>
  </main>
</template>

<script lang="ts">
// Librerías
import { Options, Vue } from "vue-class-component";
// Opté por la librería de styled-components porque me permite aislar
// los estilos de CSS por componente
import styled from "vue3-styled-components";
import { csv } from "d3-fetch";
import { scaleLinear, scaleTime } from "d3-scale";
import { select } from "d3-selection";
import { line } from "d3-shape";
import { extent, max } from "d3-array";
import { axisLeft, axisBottom } from "d3-axis";
import _uniqBy from "lodash/uniqBy";

// Interfaces
import {
  Option,
  DataResponse,
  MappedDataElement,
} from "./interfaces/interfaces";

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

const ChartWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  padding-top: 50px;
  align-items: center;
  animation: fadeIn 1.5s;

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const AppTitle = styled.h1`
  font-size: 42px;
`;

const ChartTitle = styled.h2`
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  padding: 15px 0;
`;

const ChartSource = styled.h3`
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  padding: 15px 0;
`;

@Options({
  components: {
    AppTitle,
    SelectComponent,
    SelectsWrapper,
    SpinnerLoader,
    ChartWrapper,
    ChartTitle,
    ChartSource,
  },
})
// Primeras pruebas de métodos respondiendo a eventos y
// relación entre componentes padre-hijo ante cambios en los datos
export default class App extends Vue {
  loading: boolean = false;
  windowWidth: number = window.innerWidth;
  windowHeight: number = window.innerHeight;
  dataResponse: DataResponse[] = [];
  hecho: string = "";
  estado: string = "";
  chartTitle: string = "";
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

  onWindowResize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    console.log(this.windowWidth, this.windowHeight);
  }

  created() {
    window.addEventListener("resize", this.onWindowResize);
  }

  destroyed() {
    window.removeEventListener("resize", this.onWindowResize);
  }

  updated() {
    if (this.dataResponse.length > 0) {
      const width = this.windowWidth;
      const height = this.windowHeight * 0.8;
      const margin = 5;
      const padding = 5;
      const adj = 35;
      const mappedData: MappedDataElement[] = this.dataResponse
        .map((d) => ({
          year: new Date(d.year, 0),
          tasa_mun: parseFloat(d.tasa_mun1),
        }))
        .sort((a, b) => a.year.valueOf() - b.year.valueOf());

      // Creo al SVG que contendrá la gráfica

      const svg = select("#data-chart")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr(
          "viewBox",
          `-${adj} -${adj} ${width + adj * 3} ${height + adj * 3}`
        )
        .style("padding", padding)
        .style("margin", margin)
        .classed("svg-content", true);

      const yearAccesor = (d: MappedDataElement) => d.year;
      const indicadorAccesor = (d: MappedDataElement) => d.tasa_mun;

      // Creo el rango de la escala para poder posicionar los datos y el eje
      // El eje de las x será, si el ancho de la pantalla es mayor a 480px, el de los años
      // El eje de las y será el del indicador
      // Estos se invertirán si el ancho de pantalla es menor a 480px
      let xScale: any = scaleTime().range([0, width]);
      let yScale: any = scaleLinear().rangeRound([height, 0]);

      if (this.windowWidth <= 480) {
        yScale = scaleTime().range([height, 0]);
        xScale = scaleLinear().rangeRound([0, width]);
      }

      const intervaloAnos = extent(mappedData, yearAccesor) as Date[];
      const intervaloIndicador = [
        0,
        max(mappedData, indicadorAccesor),
      ] as number[];

      this.chartTitle = `Tasa total de ${
        this.optionsHechos.find((h) => h.id === this.hecho)?.name
      } por municipio de ${intervaloAnos[0].getFullYear()} a ${intervaloAnos[1].getFullYear()}`;

      xScale.domain(intervaloAnos);
      yScale.domain(intervaloIndicador);

      if (this.windowWidth <= 480) {
        yScale.domain(intervaloAnos);
        xScale.domain(intervaloIndicador);
      }

      const ejeX = axisBottom(xScale);
      const ejeY = axisLeft(yScale);

      // Para rotar etiquetas lo saqué de aquí: http://www.d3noob.org/2013/01/how-to-rotate-text-labels-for-x-axis-of.html
      svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(ejeX)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

      svg.append("g").attr("class", "axis").call(ejeY);

      // Constructor de las lineas el cual, dado un dato tipo MappedDataElement, me regresa un valor del plano
      let lineElement = line<MappedDataElement>()
        .x((d) => xScale(yearAccesor(d)))
        .y((d) => yScale(indicadorAccesor(d)));

      if (this.windowWidth <= 480) {
        lineElement = line<MappedDataElement>()
          .x((d) => xScale(indicadorAccesor(d)))
          .y((d) => yScale(yearAccesor(d)));
      }

      // Mappeo los puntos a una recta con elementos SVG;
      svg
        .selectAll("lines")
        .data(mappedData)
        .join("g")
        .append("path")
        .attr("d", lineElement(mappedData) as string);
    }
  }

  // Checa si el estado tiene un valor para mostrar los municipios de éste
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
      // Llamada al servicio web
      return fetchCrimenesByMunicipio(
        parseInt(this.hecho),
        parseInt(this.estado),
        parseInt(this.municipio)
      )
        .then((response) => {
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
      // Llamada al servicio web
      return fetchCrimenesByMunicipio(
        parseInt(this.hecho),
        parseInt(this.estado),
        parseInt(this.municipio)
      )
        .then((response: AxiosResponse<DataResponse[]>) => {
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

.axis line {
  stroke: #706f6f;
  stroke-width: 1.5;
  shape-rendering: crispEdges;
}

/* axis contour */
.axis path {
  stroke: #706f6f;
  stroke-width: 1.5;
  shape-rendering: crispEdges;
}

/* axis text */
.axis text {
  fill: #2b2929;
  font-family: Open Sans, sans-serif;
  font-size: 120%;
}

path {
  fill: none;
  stroke: mediumpurple;
  stroke-width: 1.8;
}
</style>
