const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FALLBACK_MESSAGES = {
  0: "서버에 연결할 수 없습니다.",
  400: "입력값을 확인해주세요.",
  404: "요청한 데이터를 찾을 수 없습니다.",
};

export class ApiError extends Error {
  constructor(status, message, fieldErrors = {}) {
    super(
      message ?? FALLBACK_MESSAGES[status] ?? "요청을 처리하지 못했습니다.",
    );
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function request(path, { method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(0);
  }

  const data = await readJson(response);
  if (!response.ok) {
    throw new ApiError(response.status, data?.message, data?.fieldErrors);
  }
  return data;
}

export const isAbort = (error) => error?.name === "AbortError";
