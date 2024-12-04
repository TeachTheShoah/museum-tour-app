import { haversineDistance } from './haversine';

export async function locateUser(): Promise<UserLocation> {
	if (!navigator.geolocation) {
		throw new Error('Geolocation is not supported by your browser.');
	}
	// Get user's current position
	const position = await new Promise<GeolocationPosition>((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject);
	});

	const { latitude, longitude } = position.coords;

	try {
		const serverResponse = await fetch(`/api/geolocate?lat=${latitude}&lng=${longitude}`, {
			method: 'GET'
		});
		if (!serverResponse.ok) {
			throw new Error(await serverResponse.text());
		}
		const cityState = await serverResponse.json();

		// Fetch tours
		const fetchResponse = await fetch('/tour.json');
		if (!fetchResponse.ok) {
			throw new Error(`Failed to fetch`);
		}
		const tours = await fetchResponse.json();

		// Calculate pairwise distances
		const distances: TourDistance[] = tours.map((tour: Tour) => ({
			...tour, // Spread properties from `Tour`
			distance: haversineDistance({ latitude, longitude }, {
				latitude: tour.center_coords.lat,
				longitude: tour.center_coords.lng
			})
		}));
		// Find the closest tour
		const closest = distances.reduce((prev: TourDistance, current: TourDistance) =>
			prev.distance < current.distance ? prev : current
		);
		return {
			latitude,
			longitude,
			city: cityState.city,
			state: cityState.state,
			tour: closest.district,
			distance: closest.distance.toFixed(2)
		};
	} catch (err) {
		throw new Error(
			`Failed to locate user: ${err instanceof Error ? err.message : 'Unknown error'}`
		);
	}


}
