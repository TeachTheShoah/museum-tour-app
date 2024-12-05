<script lang="ts">
	interface DeviceOrientationEventWithWebkit extends DeviceOrientationEvent {
		webkitCompassHeading?: number;
	}

	import { onMount, onDestroy } from 'svelte';
	import { getAdvancedMarkerElement } from '../../routes/api/maps/advancedMarkerElement';
	import { getMapElement } from '../../routes/api/maps/mapElement';

	let mapElement: HTMLElement | null = null;
	let map: google.maps.Map | null = null;
	let Marker: AdvancedMarkerElementConstructor | null = null;
	let Map: MapElementConstructor | null = null;

	let markerElement: HTMLElement;
	let user: google.maps.marker.AdvancedMarkerElement;
	let tracking: google.maps.Circle;

	let loadingLocation = $state(false);

	const rotationBuffer: number[] = [];
	const bufferSize = 2;

	let animationFrameId: number | null = null;
	let isAnimating = false;

	let currentRotation = 0;
	let rotationFrameId: number | null = null;
	let isRotating = false;

	let deviceOrientationListenerAdded = false;

	let { id } = $props();

	async function loadGoogleMapsScript(): Promise<void> {
		if (typeof google !== 'undefined' && google.maps) {
			console.log('Google Maps already loaded.');
			return;
		}

		if (document.querySelector('script[src*="maps.googleapis.com"]')) {
			console.log('Google Maps script already loaded.');
			return;
		}
		const res = await fetch('/api/maps');
		const data = await res.json();

		if (data.error) {
			throw new Error(data.error);
		}

		const script = document.createElement('script');
		script.src = data.scriptUrl;
		script.async = true;
		script.defer = true;

		// Convert the script load event to a promise
		await new Promise<void>((resolve, reject) => {
			script.onload = () => resolve();
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

	async function initMap(tour: Tour): Promise<void> {
		if (map) {
			return;
		}

		const timeout = new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error('Timeout waiting for libraries')), 5000);
		});

		const waitForMarker = new Promise<typeof google.maps.marker.AdvancedMarkerElement>(
			(resolve) => {
				if (google.maps.marker?.AdvancedMarkerElement) {
					resolve(google.maps.marker.AdvancedMarkerElement);
				}
				const interval = setInterval(() => {
					if (google.maps.marker?.AdvancedMarkerElement) {
						clearInterval(interval);
						resolve(google.maps.marker.AdvancedMarkerElement);
					}
				}, 100);
			}
		);

		const waitForMap = new Promise<typeof google.maps.Map>((resolve) => {
			if (google.maps.Map) {
				resolve(google.maps.Map);
			}
			const interval = setInterval(() => {
				if (google.maps.Map) {
					clearInterval(interval);
					resolve(google.maps.Map);
				}
			}, 100);
		});

		try {
			await Promise.race([Promise.all([waitForMarker, waitForMap]), timeout]);
		} catch (error: unknown) {
			if (error instanceof Error) {
				throw new Error('Google Maps libraries not available: ' + error.message);
			}
			throw new Error('Google Maps libraries not available: Unknown error');
		}

		if (!Marker) {
			Marker = await getAdvancedMarkerElement();
		}
		if (!Map) {
			Map = await getMapElement();
		}
		// Initialize the map
		if (mapElement) {
			map = new Map(mapElement, {
				zoom: 15,
				minZoom: 13,
				maxZoom: 20,
				center: tour.center_coords,
				mapId: 'a3e0c95b63c4277f',
				disableDefaultUI: true,
				gestureHandling: 'greedy'
			});
			map.addListener('zoom_changed', () => {
				const zoom = map?.getZoom();
				if (zoom && zoom > 20) {
					map?.setZoom(20);
				}
			});
			const locations = tour.locations;
			locations.forEach((location) => {
				new Marker!({
					map: map,
					position: location.coords,
					title: location.location_name,
					gmpClickable: true,
					collisionBehavior: google.maps.CollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL
				});
			});
		} else {
			console.error('Map element is not bound.');
		}
	}

	function animateUserCircle() {
		if (!user) {
			console.warn('User circle is not initialized.');
			return;
		}
		if (isAnimating) {
			return;
		}
		isAnimating = true;
		let increasing = true;
		let radius = 12.5;
		function updateRadius() {
			if (increasing) {
				radius += 0.1;
				if (radius >= 14) increasing = false;
			} else {
				radius -= 0.1;
				if (radius < 12.5) increasing = true;
			}
			const userSvg = document.querySelector('svg circle');
			if (userSvg) {
				userSvg.setAttribute('r', `${radius}`);
			}
			setTimeout(() => {
				animationFrameId = requestAnimationFrame(updateRadius);
			}, 100);
		}
		updateRadius();
	}

	function handleDeviceOrientation(event: DeviceOrientationEventWithWebkit) {
		if (event.alpha != null) {
			let compassHeading = 360 - event.alpha;

			if (event.webkitCompassHeading) {
				compassHeading = event.webkitCompassHeading;
			}

			rotationBuffer.push(compassHeading);

			if (rotationBuffer.length > bufferSize) {
				rotationBuffer.shift();
			}

			const radians = rotationBuffer.map((deg) => deg * (Math.PI / 180));
			const sumSin = radians.reduce((sum, rad) => sum + Math.sin(rad), 0);
			const sumCos = radians.reduce((sum, rad) => sum + Math.cos(rad), 0);
			const smoothedRotation = Math.atan2(sumSin, sumCos) * (180 / Math.PI);
			const normalizedRotation = smoothedRotation < 0 ? smoothedRotation + 360 : smoothedRotation;

			if (!isRotating) {
				isRotating = true; // Block new triggers
				console.log(`Rotation: ${normalizedRotation}`);
				animateRotation(normalizedRotation);
			}
		}
	}

	function animateRotation(targetRotation: number) {
		let diff = (targetRotation - currentRotation + 360) % 360;

		// Determine the shortest direction (clockwise or counterclockwise)
		if (diff > 180) {
			diff -= 360; // Go counterclockwise
		}

		// Smoothly update the rotation
		currentRotation += diff * 0.1; // Adjust step size for smoothness

		// Normalize rotation to the range [0, 360)
		currentRotation = (currentRotation + 360) % 360;

		if (markerElement) {
			markerElement.style.transform = `scale(1.35) rotate(${currentRotation}deg)`;
		}

		// Continue animation if target is not reached
		if (Math.abs(diff) > 0.1) {
			requestAnimationFrame(() => animateRotation(targetRotation));
		} else {
			// Finish animation and reset flag
			isRotating = false;
		}
	}

	async function handleButtonClick() {
		// Ensure Marker class is loaded
		if (!Marker) {
			Marker = await getAdvancedMarkerElement();
		}
		// Add the user's location to the map
		if (map && navigator.geolocation && !user) {
			loadingLocation = true;
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
              style="width: 24px; height: 24px; transform-origin: center center; transform: scale(1.35)">
              <circle cx="12" cy="12" r="12.5" fill="white" />
              <path
                fill-rule="evenodd" 
                clip-rule="evenodd" 
                d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM15.7071 13.7071C15.3166 14.0976 14.6834 14.0976 14.2929 13.7071L12 11.4142L9.70711 13.7071C9.31658 14.0976 8.68342 14.0976 8.29289 13.7071C7.90237 13.3166 7.90237 12.6834 8.29289 12.2929L11.0915 9.49425C11.5933 8.99252 12.4067 8.99252 12.9085 9.49425L15.7071 12.2929C16.0976 12.6834 16.0976 13.3166 15.7071 13.7071Z" 
                fill="#4285F4"/>
            </svg>
            `;
					markerElement.style.position = 'absolute';
					markerElement.style.transform = 'scale(1.35) rotate(0deg)';
					markerElement.style.transformOrigin = 'center center';
          
					user = new Marker!({
						map: map,
						position: placeholderCoords,
						content: markerElement,
						zIndex: 99
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
			loadingLocation = false;
		} else {
		}
		// hacky way to get device orientation on ios + chrome with ts
		if (!deviceOrientationListenerAdded) {
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
							deviceOrientationListenerAdded = true;
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
				deviceOrientationListenerAdded = true;
			}
		}
	}

	onMount(async () => {
		try {
			await loadGoogleMapsScript();
			const tours = await fetchTours();
			const selectedTour = tours.find((tour) => tour.district === id);
			if (selectedTour) {
				await initMap(selectedTour);
			}
		} catch (err) {
			console.error('Error mounting:', err);
		}
	});

	onDestroy(() => {
		if (deviceOrientationListenerAdded) {
			window.removeEventListener('deviceorientation', handleDeviceOrientation);
			deviceOrientationListenerAdded = false;
		}
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
		isAnimating = false;
		if (rotationFrameId !== null) {
			rotationFrameId = null;
		}
		isRotating = false;
	});
</script>

<div
	bind:this={mapElement}
	id="map"
	class="w-100 h-[calc(100vh-60px)] lg:h-[calc(100vh-80px)]"
></div>
{#if loadingLocation}
	<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-999">
		<div class="text-white text-lg font-bold">Loading...</div>
	</div>
{/if}
<button
	aria-label="Locate"
	class="absolute bottom-[70px] lg:bottom-[90px] right-4 bg-[#4285F4] w-[50px] h-[50px] rounded-full flex items-center justify-center z-999"
	onclick={handleButtonClick}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		style="transform: translate(-1.5px, 1.5px);"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="#FFFFFF"
		stroke="#FFFFFF"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="lucide lucide-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg
	>
</button>

<style>
	button:hover {
		outline: none;
		box-shadow: 0 0 0 2px rgba(10, 80, 200, 0.4);
	}
</style>
