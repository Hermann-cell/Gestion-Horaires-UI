import { api } from "@/utils/api";

export function getTypeSalles() {
  return api.get("/typeSalles");
}
