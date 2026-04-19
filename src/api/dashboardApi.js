import { api } from "@/utils/api";

export const dashboardApi = {
  getStats: async () => {
    return await api.get("/dashboard");
  },
};