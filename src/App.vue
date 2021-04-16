<template>
  <main>
    <AppTitle>Datos de crímenes y hechos por municipio</AppTitle>
    <SelectsWrapper>
      <!-- <SelectComponent
        v-model="hecho"
        :id="'select1'"
        :label="'Hecho o agresión'"
        :options="optionsHechos"
        @change="onChange"
      /> -->
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
        @change="onMunicipioChange"
      />
      <SelectComponent
        v-model="sort"
        :id="'select4'"
        :label="'Ordenar datos'"
        :options="optionsSort"
        @change="onSortChange"
      />
    </SelectsWrapper>
    <SpinnerLoader v-if="loading" />
    <section>
      <ChartTitle v-if="!loading && dataResponse.length > 0">
        {{ chartTitle }}
      </ChartTitle>
      <ChartWrapper id="data-chart" />
      <ChartSource v-if="!loading && dataResponse.length > 0">
        Fuente: Mortalidad general, INEGI
      </ChartSource>
    </section>
  </main>
</template>

<script lang="ts">
// Librerías
import { Options, Vue } from "vue-class-component";
// Opté por la librería de styled-components porque me permite aislar
// los estilos de CSS por componente
import styled from "vue3-styled-components";
import _uniqBy from "lodash/uniqBy";
import {
  csv,
  scaleLinear,
  scaleTime,
  line as d3Line,
  extent,
  max,
  axisLeft,
  axisBottom,
  select,
  easeLinear,
} from "d3";

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

const yearAccesor = (d: MappedDataElement) => d.year;
const indicadorAccesor = (d: MappedDataElement) => d.tasa_mun;

const width = 800;
const height = 600;
const margin = 25;
const padding = 15;
const adj = 35;

let xScale: any = scaleTime().range([0, width]);
let yScale: any = scaleLinear().rangeRound([height, 0]);

if (window.innerWidth <= 480) {
  yScale = scaleTime().range([height, 0]);
  xScale = scaleLinear().rangeRound([0, width]);
}

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
  dataResponse: DataResponse[] = [];
  hecho: string = "2";
  estado: string = "";
  chartTitle: string = "";
  municipio: string = "";
  sort: "asc" | "desc" = "asc";
  optionsHechos: Option[] = [];
  optionsEstado: Option[] = [];
  optionsSort: Option[] = [
    {
      id: "asc",
      name: "Ascendente",
    },
    {
      id: "desc",
      name: "Descendente",
    },
  ];
  optionsMunicipios: Option[] = [
    {
      id: "",
      name: "Por favor, seleccione un estado primero.",
    },
  ];

  // Esta función inicializa los dominios de cada eje y devuelve su escala
  initChart(data: MappedDataElement[]) {
    const intervaloAnos = extent(data, yearAccesor) as Date[];
    const intervaloIndicador = [0, max(data, indicadorAccesor)] as number[];

    if (this.sort === "asc") {
      xScale.domain(intervaloAnos);
    } else {
      xScale.domain(intervaloAnos.reverse());
    }

    yScale.domain(intervaloIndicador);

    if (window.innerWidth <= 480) {
      if (this.sort === "asc") {
        yScale.domain(intervaloAnos);
      } else {
        yScale.domain(intervaloAnos.reverse());
      }
      xScale.domain(intervaloIndicador);
    }

    const ejeX = axisBottom(xScale);
    const ejeY = axisLeft(yScale);

    return {
      ejeX,
      ejeY,
    };
  }

  // Esta función crea, prepara, los ejes de la gráfica
  buildAxes() {
    select(".line-chart").append("g").attr("class", "line-chart-yaxis");
    select(".line-chart").append("g").attr("class", "line-chart-xaxis");
  }

  // Esta función crea, prepara, las líneas de la gráfica
  buildLine() {
    select(".line-chart").append("path").attr("class", "line-chart-line");
  }

  // Esta función pinta los ejes a base de las escalas de initChart(data)
  drawAxes(ejeX: any, ejeY: any) {
    select(".line-chart-xaxis")
      .call(ejeX)
      .style("transform", `translateY(${height}px)`);

    select(".line-chart-yaxis").call(ejeY);
  }

  // Esta función pinta las líneas de la gráfica a partir de los datos
  drawLine(data: MappedDataElement[]) {
    let line = d3Line<MappedDataElement>()
      .x((d) => xScale(yearAccesor(d)))
      .y((d) => yScale(indicadorAccesor(d)));

    if (window.innerWidth <= 480) {
      line = d3Line<MappedDataElement>()
        .x((d) => xScale(indicadorAccesor(d)))
        .y((d) => yScale(yearAccesor(d)));
    }

    select(".line-chart-line")
      .transition()
      .duration(750)
      .ease(easeLinear)
      .attr("d", line(data) as string);
  }

  // Esta función vuelve a calcular la escala de Y a partir de los nuevos datos
  adjustYScale(data: MappedDataElement[]) {
    const intervaloAnos = extent(data, yearAccesor) as Date[];
    const intervaloIndicador = [0, max(data, indicadorAccesor)] as number[];

    yScale.domain(intervaloIndicador);

    if (window.innerWidth <= 480) {
      if (this.sort === "asc") {
        yScale.domain(intervaloAnos);
      } else {
        yScale.domain(intervaloAnos.reverse());
      }
    }
  }

  // Esta función vuelve a calcular la escala de X a partir de los nuevos datos
  adjustXScale(data: MappedDataElement[]) {
    const intervaloAnos = extent(data, yearAccesor) as Date[];
    const intervaloIndicador = [0, max(data, indicadorAccesor)] as number[];

    if (this.sort === "asc") {
      xScale.domain(intervaloAnos);
    } else {
      xScale.domain(intervaloAnos.reverse());
    }

    if (window.innerWidth <= 480) {
      xScale.domain(intervaloIndicador);
    }
  }

  // Esta función vuelve a pintar todo, pero con los nuevos datos
  renderChanges(data: MappedDataElement[]) {
    const ejes = this.initChart(data);
    this.drawAxes(ejes?.ejeX, ejes?.ejeY);
    this.drawLine(data);
  }

  mounted() {
    // Mapeo los datos útiles
    const mappedData: MappedDataElement[] = this.dataResponse
      .map((d) => ({
        year: new Date(d.year, 0),
        tasa_mun: parseFloat(d.tasa_mun1),
      }))
      .sort((a, b) => {
        if (this.sort === "asc") {
          return a.year.valueOf() - b.year.valueOf();
        }

        return b.year.valueOf() - a.year.valueOf();
      });

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

    // Preparo el SVG que contendrá a la gráfica
    select("#data-chart")
      .append("svg")
      .attr("class", "line-chart")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `-${adj} -${adj} ${width + adj * 3} ${height + adj * 3}`)
      .style("padding", padding)
      .style("margin", margin)
      .style("display", "none")
      .classed("svg-content", true);

    // Inicializo la gráfica
    this.buildAxes();
    this.buildLine();
    this.renderChanges(mappedData);
  }

  onWindowResize() {
    const svg = document.getElementsByClassName("line-chart");

    // Ajusto el tamaño del SVG de la gráfica dependiendo del ancho de la ventana
    if (svg.length > 0) {
      const newWidth = window.innerWidth > 800 ? 800 : window.innerWidth;
      const newHeight = window.innerHeight > 800 ? 800 : window.innerHeight;
      select("#data-chart").attr(
        "viewBox",
        `-${adj} 
        -${adj} 
        ${newWidth + adj * 3} 
        ${newHeight + adj * 3}`
      );

      xScale = scaleTime().range([0, width]);
      yScale = scaleLinear().rangeRound([height, 0]);

      if (window.innerWidth <= 480) {
        yScale = scaleTime().range([height, 0]);
        xScale = scaleLinear().rangeRound([0, width]);
      }

      this.$forceUpdate();
    }
  }

  created() {
    window.addEventListener("resize", this.onWindowResize);
  }

  destroyed() {
    window.removeEventListener("resize", this.onWindowResize);
  }

  updated() {
    // Mapeo los datos útiles
    const mappedData: MappedDataElement[] = this.dataResponse
      .map((d) => ({
        year: new Date(d.year, 0),
        tasa_mun: parseFloat(d.tasa_mun1),
      }))
      // Ascendente
      .sort((a, b) => {
        if (this.sort === "asc") {
          return a.year.valueOf() - b.year.valueOf();
        }

        return b.year.valueOf() - a.year.valueOf();
      });

    // Tomo el título a partir del ID del crimen
    if (mappedData.length > 0) {
      const intervaloAnos = extent(mappedData, yearAccesor) as Date[];

      this.chartTitle = `Tasa total de ${
        this.optionsHechos.find((h) => h.id === this.hecho)?.name
      } por municipio de ${intervaloAnos[0].getFullYear()} a ${intervaloAnos[1].getFullYear()}`;
    }

    // Actualizo los datos
    this.adjustYScale(mappedData);
    this.adjustXScale(mappedData);
    this.renderChanges(mappedData);

    // Muestro la gráfica si todo cargó
    if (this.loading === false && mappedData.length) {
      select("#data-chart").select("svg").style("display", "flex");
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
      select("#data-chart").select("svg").style("display", "none");

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

  onMunicipioChange() {
    if (this.hecho !== "" && this.estado !== "" && this.municipio !== "") {
      select("#data-chart").select("svg").style("display", "none");

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

  onSortChange() {
    this.$forceUpdate();
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

/* axis contour */
path.line-chart-yaxis,
path.line-chart-xaxis {
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

path.line-chart-line {
  fill: none;
  stroke: mediumpurple;
  stroke-width: 1.8;
}

.line-chart {
  animation: fadeIn 1.5s;

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
}
</style>
