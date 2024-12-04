// Fetch tours from the static JSON file
export async function fetchTours(): Promise<Tour[]> {
  const response = await fetch('/tour.json');
  if (!response.ok) {
    throw new Error('Failed to fetch tours');
  }
  return response.json();
}
