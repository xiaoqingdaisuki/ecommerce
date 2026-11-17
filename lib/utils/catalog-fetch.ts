/** Bound retries to public catalog reads; cart and checkout clients never use this transport. */
export async function catalogFetch(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) {
  const delays = [250, 750];
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(input, init);
      if (attempt >= delays.length || init?.signal?.aborted || ![502, 503, 504].includes(response.status))
        return response;
      await response.body?.cancel();
    } catch (error) {
      const code = (error as { cause?: { code?: string } })?.cause?.code;
      if (
        attempt >= delays.length ||
        init?.signal?.aborted ||
        !['ECONNRESET', 'ETIMEDOUT', 'UND_ERR_SOCKET', 'UND_ERR_CONNECT_TIMEOUT', 'EAI_AGAIN'].includes(
          code ?? '',
        )
      )
        throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
  }
}
