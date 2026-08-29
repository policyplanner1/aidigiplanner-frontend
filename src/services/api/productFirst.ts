import axios, { type AxiosResponse } from "axios";

export async function productFirst<T>(
  productId: string,
  suffix: string,
  request: (path: string) => Promise<AxiosResponse<T>>,
): Promise<AxiosResponse<T>> {
  try {
    return await request(`/products/${productId}${suffix}`);
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;
    return request(`/projects/${productId}${suffix}`);
  }
}
