// Librerías
import axios, { AxiosRequestConfig, Method } from "axios";

// Util para llamar a servicios web desde axios
export default function request<T = any>(
  url = "",
  method: Method = "get",
  data = {},
  config?: AxiosRequestConfig
) {
  return axios(url, {
    method,
    data,
    ...config,
  });
}
