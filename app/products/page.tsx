/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";

async function getProducts() {
  const cookieStore = await cookies();

  const sessionId = cookieStore.get("odoo_session_id")?.value;

  if (!sessionId) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${process.env.ODOO_URL}/api/b2b/products`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_id=${sessionId}`,
      },
      body: JSON.stringify({
        limit: 20,
        offset: 0,
      }),
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok || result.error) {
    console.error("Odoo products error:", result);

    throw new Error(
      result.error?.data?.message ||
        result.error?.message ||
        "Failed to fetch products"
    );
  }

  return result.result;
}

export default async function ProductsPage() {
  const result = await getProducts();

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Products
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {result.data.map((product: any) => (
          <div
            key={product.id}
            className="rounded-lg border p-5"
          >
            <h2 className="font-semibold">
              {product.name}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              SKU: {product.sku || "-"}
            </p>

            <p className="mt-4 text-xl font-bold">
              ${product.price}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}