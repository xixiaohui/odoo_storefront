const ODOO_URL = process.env.ODOO_URL;

if (!ODOO_URL) {
  throw new Error("ODOO_URL is not configured");
}

export async function getOdooProducts(params?: {
  limit?: number;
  offset?: number;
  sessionId?: string;
}) {
  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;

  const response = await fetch(`${ODOO_URL}/api/b2b/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(params?.sessionId
        ? {
            Cookie: `session_id=${params.sessionId}`,
          }
        : {}),
    },
    body: JSON.stringify({
      limit,
      offset,
    }),
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || result.error) {
    throw new Error(
      result.error?.data?.message ||
        result.error?.message ||
        `Odoo API failed: ${response.status}`
    );
  }

  return result.result;
}