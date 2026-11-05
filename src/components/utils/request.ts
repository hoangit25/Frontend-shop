import {http} from "./axios-config"

const request = {
  get: async <T>(url: string, params?: object): Promise<T> => {
    const response = await http.get<T>(url, { params });
    return response.data;
  },

  post: async <T, D = unknown>(
    url: string,
    data?: D
  ): Promise<T> => {
    const response = await http.post<T>(url, data);
    return response.data;
  },

  put: async <T, D = unknown>(
    url: string,
    data?: D
  ): Promise<T> => {
    const response = await http.put<T>(url, data);
    return response.data;
  },

  patch: async <T, D = unknown>(
    url: string,
    data?: D
  ): Promise<T> => {
    const response = await http.patch<T>(url, data);
    return response.data;
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await http.delete<T>(url);
    return response.data;
  },
};

export default request;