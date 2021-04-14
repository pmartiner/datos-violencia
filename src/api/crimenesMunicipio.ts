// Utils
import request from "@/utils/request";

// Interfaces
import { DataResponse, ErrorResponse } from "@/interfaces/interfaces";
import { AxiosError, AxiosResponse } from "axios";

// Api para obtener los datos de un indicador de un crimen por su ID,
// por el ID del estado y por el ID del municipio
const fetchCrimenesByMunicipio = (
  crimenId: number,
  estadoId: number,
  municipioId: number
) => {
  return request<DataResponse[]>(
    "https://spotlight-unfpa.datacivica.org/api/v1/timeline",
    "POST",
    {
      id_crime: crimenId,
      id_ent: estadoId,
      id_mun1: municipioId,
    }
  )
    .then((response: AxiosResponse<DataResponse[]>) => response)
    .catch((error: AxiosError<ErrorResponse>) => {
      if (error.response) {
        alert(
          error.response.data.hint
            ? `${error.response?.data.severity}. \nCódigo: ${error.response?.data.code}. \nMensaje: ${error.response?.data.hint}`
            : `${error.response?.data.severity}. \nCódigo: ${error.response?.data.code}.`
        );
      } else {
        alert(
          "Hubo un error con su petición. \nPor favor, intente nuevamente."
        );
      }

      throw Error;
    });
};

export default fetchCrimenesByMunicipio;
