const USDA_API_KEY = "xqbqeQRjpP3xQPBfygsNcPeUvzgdsnC3oKbQnhd1";

export async function searchFood(query) {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&pageSize=10&api_key=${USDA_API_KEY}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("USDA API request failed");
  }

  const data = await res.json();
  return data.foods || [];
}
