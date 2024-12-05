<script lang="ts">
	interface DeviceOrientationEventWithWebkit extends DeviceOrientationEvent {
		webkitCompassHeading?: number;
	}

	import { onMount, onDestroy } from 'svelte';
	import { getAdvancedMarkerElement } from '../../routes/api/maps/advancedMarkerElement';
	import { getMapElement } from '../../routes/api/maps/mapElement';
	import LoadingDots from './LoadingDots.svelte';

	let mapElement: HTMLElement | null = null;
	let map: google.maps.Map | null = null;
	let Marker: AdvancedMarkerElementConstructor | null = null;
	let Map: MapElementConstructor | null = null;

	let center: Coordinates;

	let markerElement: HTMLElement;

	let watchId: number;
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

	let selectedLocation: Tour['locations'][number] | null = $state(null);

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
				clickableIcons: false,
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
				const marker = new Marker!({
					map: map,
					position: location.coords,
					title: location.location_name,
					gmpClickable: true,
					collisionBehavior: google.maps.CollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL
				});
				marker.addListener('gmp-click', () => {
					selectedLocation = location;
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
			const userSvg = markerElement.querySelector('svg circle');
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

		if (markerElement && map) {
			// Get the map's current heading (rotation)
			const mapHeading = map.getHeading() || 0;

			// Adjust the icon's rotation relative to the map's rotation
			const adjustedRotation = currentRotation - mapHeading;

			markerElement.style.transform = `translate(-50%, -50%) scale(1.35) rotate(${adjustedRotation}deg)`;
		}

		// Continue animation if target is not reached
		if (Math.abs(diff) > 0.1) {
			requestAnimationFrame(() => animateRotation(targetRotation));
		} else {
			// Finish animation and reset flag
			isRotating = false;
		}
	}

	function updateUserLocation(coords: { lat: number; lng: number }) {
		if (!user) {
			user = new Marker!({
				map: map,
				position: coords,
				content: markerElement,
				zIndex: 99
			});
			animateUserCircle();
			tracking = new google.maps.Circle({
				map,
				center: coords,
				radius: 10,
				strokeColor: '#92C6E0',
				strokeOpacity: 0.75,
				strokeWeight: 1,
				fillColor: '#ADD8E6',
				fillOpacity: 0.5
			});
		}
		user.position = coords;
		tracking.setCenter(coords);
		console.log('User location updated:', coords);
	}

	function stopLocationUpdates() {
		if (watchId) {
			navigator.geolocation.clearWatch(watchId);
		}
	}

	function handleCenterButtonClick() {
		if (map && center) {
			map.panTo(center);
			map.setZoom(15);
		}
	}
	async function handleNavButtonClick() {
		// Ensure Marker class is loaded
		if (!Marker) {
			Marker = await getAdvancedMarkerElement();
		}
		if (map && navigator.geolocation && !user && !watchId) {
			loadingLocation = true;
			try {
				// Get initial position first
				const position = await new Promise<GeolocationPosition>((resolve, reject) => {
					navigator.geolocation.getCurrentPosition(resolve, reject, {
						timeout: 10000
					});
				});
				// Update user location with initial position
				const initCoords = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				updateUserLocation(initCoords);

				// Then start watching for updates
				watchId = navigator.geolocation.watchPosition(
					(position) => {
						const coords = {
							lat: position.coords.latitude,
							lng: position.coords.longitude
						};
						updateUserLocation(coords);
					},
					(error) => {
						console.error('Error fetching location:', error);
					},
					{
						enableHighAccuracy: true,
						maximumAge: 2000,
						timeout: 5000
					}
				);
			} catch (error) {
				console.error('Error getting initial position:', error);
			} finally {
				loadingLocation = false;
			}
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
		if (user && map) {
			const position = user.position as google.maps.LatLng;
			map.panTo(position);
			return;
		}
	}

	onMount(async () => {
		try {
			markerElement = document.createElement('div');
			markerElement.innerHTML = `
    <svg 
      viewBox="-3 -3 30 30" 
      xmlns="http://www.w3.org/2000/svg" 
      style="width: 24px; height: 24px; transform-origin: center center;)">
      <circle cx="12" cy="12" r="12.5" fill="white" />
      <path
        fill-rule="evenodd" 
        clip-rule="evenodd" 
        d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM15.7071 13.7071C15.3166 14.0976 14.6834 14.0976 14.2929 13.7071L12 11.4142L9.70711 13.7071C9.31658 14.0976 8.68342 14.0976 8.29289 13.7071C7.90237 13.3166 7.90237 12.6834 8.29289 12.2929L11.0915 9.49425C11.5933 8.99252 12.4067 8.99252 12.9085 9.49425L15.7071 12.2929C16.0976 12.6834 16.0976 13.3166 15.7071 13.7071Z" 
        fill="#4285F4"/>
    </svg>
    `;
			markerElement.style.position = 'absolute';
			markerElement.style.transform = 'translate(-50%, -50%) scale(1.35) rotate(0deg)';
			markerElement.style.transformOrigin = 'center center';
			await loadGoogleMapsScript();
			const tours = await fetchTours();
			const selectedTour = tours.find((tour) => tour.district === id);
			if (selectedTour) {
				await initMap(selectedTour);
				center = selectedTour.center_coords;
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
		stopLocationUpdates();
	});
</script>

<div
	bind:this={mapElement}
	id="map"
	class="w-100 h-[calc(100vh-52px)] lg:h-[calc(100vh-72px)]"
></div>
{#if loadingLocation}
	<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
		<div class="text-white text-lg font-bold">Loading<LoadingDots /></div>
	</div>
{/if}

<button
	aria-label="Locate"
	class="absolute bottom-[125px] lg:bottom-[145px] right-4 bg-[#4285F4] w-[50px] h-[50px] rounded-full flex items-center justify-center z-14"
	onclick={handleNavButtonClick}
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

<button
	aria-label="Center"
	class="absolute bottom-[70px] lg:bottom-[90px] right-4 bg-[#FFFFFF] w-[50px] h-[50px] rounded-full flex items-center justify-center z-14"
	onclick={handleCenterButtonClick}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="lucide lucide-locate-fixed"
		><line x1="2" x2="5" y1="12" y2="12" /><line x1="19" x2="22" y1="12" y2="12" /><line
			x1="12"
			x2="12"
			y1="2"
			y2="5"
		/><line x1="12" x2="12" y1="19" y2="22" /><circle cx="12" cy="12" r="7" /><circle
			cx="12"
			cy="12"
			r="3"
		/></svg
	>
</button>

{#if selectedLocation}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-30 p-4"
		role="button"
		tabindex="0"
		aria-label="Open Modal"
		onclick={(e) => e.target === e.currentTarget && (selectedLocation = null)}
	>
		<div class="bg-white rounded-lg w-full max-w-md shadow-lg relative">
			<!-- Header -->
			<div class="p-4 border-b">
				<h2 class="text-xl font-bold text-gray-900">{selectedLocation.location_name}</h2>
				<button
					onclick={() => (selectedLocation = null)}
					class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
					aria-label="Close modal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="p-4 space-y-4">
        <div class="flex justify-between">
          {#if selectedLocation.address}
					<div class="w-1/2">
						<h3 class="italic text-gray-900">Address</h3>
						<p class="text-gray-700">{selectedLocation.address}</p>
					</div>
				{/if}
				{#if selectedLocation.occupant}
					<div class="w-1/2">
						<h3 class="italic text-gray-900">Occupant</h3>
						<p class="text-gray-700">{selectedLocation.occupant}</p>
					</div>
				{/if}
        </div>

        {#if selectedLocation.audio_url}
          <div>
            <h3 class="italic text-gray-900">Audio Guide</h3>
            <audio controls class="w-full mt-2">
              <source src={selectedLocation.audio_url} type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
          </div>
        {/if}

				{#if selectedLocation.brief_description}
					<div>
						<h3 class="italic text-gray-900">Description</h3>
						<p class="text-gray-700">{selectedLocation.brief_description}</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	button:hover {
		box-shadow: 0 0 0 2px rgba(100, 135, 215, 0.4);
	}
</style>
