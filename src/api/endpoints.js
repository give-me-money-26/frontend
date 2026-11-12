import { request } from "./client";

export const getBuildings = (signal) => request("/buildings", { signal });

export const getBuilding = (buildingId, signal) =>
  request(`/buildings/${encodeURIComponent(buildingId)}`, { signal });

export const getDefaultAssumptions = (signal) =>
  request("/assumptions/defaults", { signal });

export const simulate = (body, signal) =>
  request("/simulations", { method: "POST", body, signal });

export const compareSimulations = (baseline, current, signal) =>
  request("/simulations/compare", {
    method: "POST",
    body: { baseline, current },
    signal,
  });
