<script lang="ts">
	import { onMount } from 'svelte';
	import { getAdvancedMarkerElement } from '$lib/utils/advancedMarker';

	let mapElement: HTMLElement | null = null;
	let map: google.maps.Map;
	let markerElement: HTMLElement;
	let user: google.maps.marker.AdvancedMarkerElement;
	let tracking: google.maps.Circle;
	type AdvancedMarkerElementConstructor = typeof google.maps.marker.AdvancedMarkerElement;
	let { id } = $props();

	async function loadGoogleMapsScript(): Promise<void> {
		const res = await fetch('/api/maps');
		const data = await res.json();

		if (data.error) {
			throw new Error(data.error);
		}

		return new Promise<void>((resolve, reject) => {
			const script = document.createElement('script');
			script.src = data.scriptUrl;
			script.async = true;
			script.defer = true;

			script.onload = () => resolve(); // Resolves the promise successfully
			script.onerror = () => reject(new Error('Failed to load Google Maps script'));

			document.head.appendChild(script);
		});
	}

	async function fetchTours(): Promise<Tour[]> {
		const fetchResponse = await fetch('/data/tours.json');
		if (!fetchResponse.ok) {
			throw new Error(`Failed to fetch`);
		}
		const tours = await fetchResponse.json();
		return tours;
	}

	async function initMap(Marker: AdvancedMarkerElementConstructor, tour: Tour): Promise<void> {
		//@ts-ignore
		const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
		//@ts-ignore

		// Initialize the map
		if (mapElement) {
			map = new Map(mapElement, {
				zoom: 15,
				minZoom: 13,
				maxZoom: 20,
				center: tour.center_coords,
				mapId: 'a3e0c95b63c4277f',
				disableDefaultUI: true
			});

			const locations = tour.locations;
			locations.forEach((location) => {
				new Marker({
					map: map,
					position: location.coords,
					title: location.location_name,
					gmpClickable: true,
					collisionBehavior: google.maps.CollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL
				});
			});
			// Add the user's location to the map
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						// const userCoords = {
						// 	lat: position.coords.latitude,
						// 	lng: position.coords.longitude
						// };
						const placeholderCoords = {
							lat: 48.21774803393539,
							lng: 16.380806841905153
						};
						markerElement = document.createElement('div');
						markerElement.innerHTML = `
            <svg 
              viewBox="-3 -3 30 30" 
              xmlns="http://www.w3.org/2000/svg" 
              style="width: 24px; height: 24px; transform-origin: center; transform: scale(1.35)">
              <circle cx="12" cy="12" r="13" fill="white" />
              <path
                fill-rule="evenodd" 
                clip-rule="evenodd" 
                d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM15.7071 13.7071C15.3166 14.0976 14.6834 14.0976 14.2929 13.7071L12 11.4142L9.70711 13.7071C9.31658 14.0976 8.68342 14.0976 8.29289 13.7071C7.90237 13.3166 7.90237 12.6834 8.29289 12.2929L11.0915 9.49425C11.5933 8.99252 12.4067 8.99252 12.9085 9.49425L15.7071 12.2929C16.0976 12.6834 16.0976 13.3166 15.7071 13.7071Z" 
                fill="#4285F4"/>
            </svg>
            `;
						markerElement.style.transform = 'translate(0%, 50%) rotate(0deg)';
						markerElement.style.transition = 'transform 0.1s ease';

						user = new Marker({
							map: map,
							position: placeholderCoords,
							content: markerElement
						});
						animateUserCircle();
						tracking = new google.maps.Circle({
							map,
							center: placeholderCoords,
							radius: 10,
							strokeColor: '#92C6E0',
							strokeOpacity: 0.75,
							strokeWeight: 1,
							fillColor: '#ADD8E6',
							fillOpacity: 0.5
						});
					},
					(error) => {
						console.error('Error getting user location:', error);
					}
				);
			} else {
				console.warn('Geolocation is not supported by this browser.');
			}
      // hacky way to get device orientation on ios + chrome with ts
			if (
				typeof DeviceOrientationEvent !== 'undefined' &&
				typeof (DeviceOrientationEvent as any).requestPermission === 'function'
			) {
				// iOS Safari requires explicit permission
				(DeviceOrientationEvent as any)
					.requestPermission()
					.then((response: string) => {
						if (response === 'granted') {
							console.log('DeviceOrientationEvent permission granted.');
							window.addEventListener('deviceorientation', handleDeviceOrientation);
						} else {
							console.error('DeviceOrientationEvent permission denied.');
						}
					})
					.catch((error: any) => {
						console.error('Error requesting DeviceOrientationEvent permission:', error);
					});
			} else {
				// Non-iOS browsers
				console.log('DeviceOrientationEvent does not require permission.');
				window.addEventListener('deviceorientation', handleDeviceOrientation);
			}
		} else {
			console.error('Map element is not bound.');
		}
	}

	function animateUserCircle() {
		if (!user) {
			console.warn('User circle is not initialized.');
			return;
		}

		let increasing = true;
		let radius = 13;

		function updateRadius() {
			// Update the radius
			if (increasing) {
				radius += 0.1;
				if (radius >= 13.5) increasing = false; // Reverse direction
			} else {
				radius -= 0.1;
				if (radius <= 12.5) increasing = true; // Reverse direction
			}
			// Update the circle's radius in the SVG
			const userSvg = document.querySelector('svg circle'); // Select the circle in your SVG
			if (userSvg) {
				userSvg.setAttribute('r', `${radius}`);
			}
			// Schedule the next frame
			setTimeout(() => {
				requestAnimationFrame(updateRadius);
			}, 80); // Adjust timing here for the desired pulsing effect
		}

		updateRadius();
	}

	function handleDeviceOrientation(event: DeviceOrientationEvent) {
		const alpha = event.alpha; // Degrees relative to true north (0° to 360°)
		if (alpha != null) {
			updateUserDirection(alpha);
		}
	}

	function updateUserDirection(rotation: number) {
		if (markerElement) {
			markerElement.style.transform = `rotate(${rotation}deg)`;
		}
	}

	onMount(async () => {
		try {
			await loadGoogleMapsScript();
			const Marker = await getAdvancedMarkerElement();
			const tours = await fetchTours();
			const selectedTour = tours.find((tour) => tour.district === id);
			if (selectedTour) {
				initMap(Marker, selectedTour).catch((error) =>
					console.error('Error initializing map:', error)
				);
			}
		} catch (err) {
			console.error('Error initializing map:', err);
		}
	});
</script>

<div bind:this={mapElement} id="map" class="w-100 h-[calc(100vh-60px)]"></div>
