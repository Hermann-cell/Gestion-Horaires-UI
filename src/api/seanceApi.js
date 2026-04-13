import { api } from "../utils/api";

export const seanceApi = {
  getAll: async () => {
    return await api.get("/seances");
  },
};