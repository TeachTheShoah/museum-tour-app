import { error, json } from '@sveltejs/kit';

export async function GET() {
  try {
    const apiKey = import.meta.env.VITE_MAPS_API_KEY;
    const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta&libraries=maps,marker`;
    return json({ scriptUrl });
  } catch (err) {
		console.error('Error in maps API:', err);
		throw error(500, 'Internal Server Error');
  }
}
 