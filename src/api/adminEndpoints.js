import { ApiError, request } from "./client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const enc = encodeURIComponent;

const query = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : "";
};

const post = (path, body, signal) =>
  request(path, { method: "POST", body, signal });
const patch = (path, body, signal) =>
  request(path, { method: "PATCH", body, signal });

export const adminApi = {
  buildings: (signal) => request("/buildings", { signal }),
  building: (buildingId, signal) =>
    request(`/buildings/${enc(buildingId)}`, { signal }),
  defaults: (signal) => request("/assumptions/defaults", { signal }),
  simulate: (input, signal) => post("/simulations", input, signal),
  compare: (baseline, current, signal) =>
    post("/simulations/compare", { baseline, current }, signal),

  vents: (buildingId, signal) =>
    request(`/buildings/${enc(buildingId)}/vents`, { signal }),
  vent: (ventId, signal) => request(`/vents/${enc(ventId)}`, { signal }),
  sensors: (signal) => request("/sensors", { signal }),
  sensor: (sensorId, signal) =>
    request(`/sensors/${enc(sensorId)}`, { signal }),
  sceneConfig: (buildingId, signal) =>
    request(`/buildings/${enc(buildingId)}/scene-config`, { signal }),
  dashboard: (buildingId, signal) =>
    request(`/buildings/${enc(buildingId)}/dashboard`, { signal }),
  referenceFactors: (signal) =>
    request("/reference-factors/current", { signal }),
  turbines: (signal) => request("/turbines", { signal }),
  turbine: (turbineId, signal) =>
    request(`/turbines/${enc(turbineId)}`, { signal }),

  measurements: (params, signal) =>
    request(`/measurements${query({ ...params, sort: "measuredAt,desc" })}`, {
      signal,
    }),
  measurement: (measurementId, signal) =>
    request(`/measurements/${measurementId}`, { signal }),
  createMeasurement: (input, signal) => post("/measurements", input, signal),
  createMeasurementBatch: (batchId, records, signal) =>
    post("/measurements/batch", { batchId, records }, signal),
  updateQuality: (measurementId, body, signal) =>
    patch(`/measurements/${measurementId}/quality`, body, signal),
  qualityHistory: (measurementId, signal) =>
    request(`/measurements/${measurementId}/history`, { signal }),
  measurementSummary: (params, signal) =>
    request(`/measurements/summary${query(params)}`, { signal }),
  exportMeasurements: async (params) => {
    let response;
    try {
      response = await fetch(
        `${BASE_URL}/exports/measurements${query(params)}`,
      );
    } catch {
      throw new ApiError(0);
    }
    if (!response.ok) throw new ApiError(response.status);
    return response.blob();
  },

  timeseries: (body, signal) => post("/simulations/timeseries", body, signal),
  placement: (body, signal) => post("/optimizations/placement", body, signal),
  createValidation: (body, signal) => post("/validations", body, signal),
  validations: (buildingId, signal) =>
    request(`/validations${query({ buildingId })}`, { signal }),
  validation: (validationId, signal) =>
    request(`/validations/${enc(validationId)}`, { signal }),

  candidates: (buildingId, signal) =>
    request(`/candidates${query({ buildingId })}`, { signal }),
  candidate: (candidateId, signal) =>
    request(`/candidates/${enc(candidateId)}`, { signal }),
  createDecision: (body, signal) => post("/decisions", body, signal),
  decisions: (params = {}, signal) =>
    request(`/decisions${query(params)}`, { signal }),
  decision: (decisionId, signal) =>
    request(`/decisions/${enc(decisionId)}`, { signal }),
  updateDecision: (decisionId, body, signal) =>
    patch(`/decisions/${enc(decisionId)}`, body, signal),
};
