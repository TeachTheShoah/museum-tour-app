export function haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
	const R = 6371; // Radius of the Earth in kilometers
	const toRadians = (degrees: number) => degrees * (Math.PI / 180);

	const lat1 = toRadians(coord1.latitude);
	const lon1 = toRadians(coord1.longitude);
	const lat2 = toRadians(coord2.latitude);
	const lon2 = toRadians(coord2.longitude);

	const dLat = lat2 - lat1;
	const dLon = lon2 - lon1;

	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}
