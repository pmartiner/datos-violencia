// En este documento creo el componente del Select para hacerlo dinámico y que
todos los ajustes por parte de éste no los maneje el componente padre.
<template>
  <SelectWrapper class="select-wrapper">
    <SelectLabel v-bind:for="id">{{ !!label ? label : "" }}</SelectLabel>
    <Select v-model="selectedOption" v-bind:id="id" @change="onChange">
      <option value="" selected disabled>
        {{ !!placeholder ? placeholder : "Seleccione una opción" }}
      </option>
      <option v-for="opt in options" v-bind:value="opt.id" v-bind:key="opt.id">
        {{ opt.name }}
      </option>
    </Select>
  </SelectWrapper>
</template>

<script lang="ts">
// Librerías
import { PropType } from "vue";
import { Options, Vue } from "vue-class-component";
// Opté por la librería de styled-components porque me permite aislar
// los estilos de CSS por componente
import styled from "vue3-styled-components";

// Interfaces
import { Option } from "../interfaces/interfaces";

const SelectWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  max-width: 400px;
  padding-left: 5px;
`;

const SelectLabel = styled.label`
  font-size: 12px;
  font-weight: bold;
  color: #646464;
  padding-bottom: 5px;
`;

const Select = styled.select`
  padding: 2px 5px;
  font-size: 14px;
  color: #1e1e1e;
  border: 2px solid #1e1e1e;
  border-radius: 5px;
  background: transparent;
  background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position-x: 100%;
  background-position-y: 50%;
  appearance: none;
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 15px;
`;

@Options({
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: false,
    },
    options: {
      type: Array as PropType<Option[]>,
      required: true,
    },
    placeholder: {
      type: String,
      required: false,
    },
  },
  components: {
    SelectWrapper,
    Select,
    SelectLabel,
  },
})

// Utilizo la notación de clase por mi familiaridad con React
export default class SelectComponent extends Vue {
  selectedOption: string = "";

  onChange() {
    console.log(this.selectedOption);
  }
}
</script>
