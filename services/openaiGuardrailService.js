export const MAX_INPUT = 200;
export const MAX_RETRIES = 3;
export const TIMEOUT = 30000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function guardrail(fn, input) {

  if (typeof input === "string" && input.length > MAX_INPUT) {
    throw {
      status: 400,
      message: "Input exceeds maximum length",
    };
  }

  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, TIMEOUT);

      const result = await fn(controller);

      clearTimeout(timeout);

     
      if (!result) {
        throw new Error("Invalid LLM response");
      }

      return result;

    } catch (err) {

      if (err.name === "AbortError") {
        throw {
          status: 504,
          message: "LLM request timed out",
        };
      }

      const status = err.status || err.code;

      if (status === 429 || status >= 500) {
        attempt++;

        if (attempt >= MAX_RETRIES) {
          throw {
            status: 500,
            message: "LLM failed after retries",
          };
        }

        const delay = Math.pow(2, attempt) * 1000;
        await sleep(delay);

      } else {
        throw err;
      }
    }
  }
}