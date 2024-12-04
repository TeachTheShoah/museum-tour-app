import { error, json } from '@sveltejs/kit';
import { VITE_MAPS_API_KEY } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET({ url }: RequestEvent) {
	try {
		// Parse client-provided coordinates
		const lat = url.searchParams.get('lat');
		const lng = url.searchParams.get('lng');
		if (!lat || !lng) {
			throw error(400, 'Latitude and longitude are required.');
		}

		const latitude = parseFloat(lat);
		const longitude = parseFloat(lng);

		if (isNaN(latitude) || isNaN(longitude)) {
			throw error(400, 'Invalid latitude or longitude.');
		}

		// Get city and state
		const location = await getCityandStateFromCoordinates(latitude, longitude);

		// Respond with location and tour data
		return json({
			city: location.city,
			state: location.state,
		});
	} catch (err) {
		console.error('Error in locate API:', err);
		throw error(500, 'Internal Server Error');
	}
}

async function getCityandStateFromCoordinates(
	latitude: number,
	longitude: number
): Promise<{ city: string; state: string }> {
	const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${VITE_MAPS_API_KEY}`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error('Failed to fetch location data from Google Maps API.');
	}

	const data = await response.json();

	if (data.status !== 'OK' || !data.results || data.results.length === 0) {
		throw new Error('No results found for the given coordinates.');
	}

	// Extract city and state from response
	const addressComponents = data.results[0].address_components;

	const cityComponent = addressComponents.find((component: AddressComponent) =>
		component.types.includes('locality')
	);

	const stateComponent = addressComponents.find((component: AddressComponent) =>
		component.types.includes('administrative_area_level_1')
	);

	if (!cityComponent || !stateComponent) {
		throw new Error('City or state not found in the location data.');
	}

	return {
		city: cityComponent.long_name,
		state: stateComponent.long_name
	};
}