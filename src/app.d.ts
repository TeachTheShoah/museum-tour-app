// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
	}
	type AdvancedMarkerElementConstructor = typeof google.maps.marker.AdvancedMarkerElement;
	type AddressComponent = {
		long_name: string;
		short_name: string;
		types: string[];
	};
	
	type Coordinates = {
		latitude: number;
		longitude: number;
	};

	interface UserLocation {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    tour: string;
    distance: string;
  };
	interface Tour {
		id: number;
		district: string;
		stops: number;
		walking_distance: number;
		walking_time: number;
		center_coords: {
			lat: number;
			lng: number;
		};
		locations: {
			location_id: number | string;
			location_name: string;
			address: string;
			occupant: string;
			brief_description: string;
			biography: string;
			coords: {
				lat: number;
				lng: number;
			};
		}[];
	};
	interface TourDistance extends Tour {
    distance: number;
  }
}

export {};
