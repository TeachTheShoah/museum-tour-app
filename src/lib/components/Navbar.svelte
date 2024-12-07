<script lang="ts">
	import { locateUser } from '$lib/utils/geolocation.svelte';
	import LoadingDots from '$lib/components/LoadingDots.svelte';

	let showExhibitSubmenu = $state(false);
	let showLocateMeSubmenu = $state(false);
	let showMobileMenu = $state(false);
	let showExhibitMobileMenu = $state(false);
	let showLocateMeMobileMenu = $state(false);
	let locale = $state('EN');
	let loadingLocation = $state(false);
	let loc: UserLocation | null = $state(null);
	let err: string | null = $state(null);
	let { innerWidth } = $props();

	function toggleLocale() {
		if (locale === 'EN') {
			locale = 'DE';
		} else {
			locale = 'EN';
		}
	}

	async function handleLocateMe() {
		if (loadingLocation) return;
		loadingLocation = true;
		err = null;
		try {
			loc = await locateUser();
		} catch (error) {
			console.error('Error locating user:', error);
			err = `${error instanceof Error ? error.message : 'Unknown error'}`;
		} finally {
			loadingLocation = false;
		}
	}
</script>

<nav
	class="mt-8 lg:mt-12 mb-2 bg-white text-gray-500 border-gray-200 divide-gray-200 px-4 sm:pl-8 md:pl-16 lg:pl-32 w-full z-20"
>
	<div class="flex flex-col mb-1 lg:mb-0">
		<!-- First Row: Logo + Support Us -->
		<div class="flex justify-between items-start w-full">
			<!-- Logo -->
			<div class="flex items-start">
				{#if innerWidth > 380}
					<span class="whitespace-nowrap font-bold text-base lg:text-3xl text-black">
						{#if locale === 'EN'}
							SWIGGI & TEACH THE SHOAH PRESENT:
						{/if}
						{#if locale === 'DE'}
							SWIGGI & TEACH THE SHOAH PRÄSENTIEREN:
						{/if}
					</span>
				{:else}
					<span class="whitespace-nowrap font-bold text-sm text-black ml-2">
						{#if locale === 'EN'}
							SWIGGI & TEACH THE SHOAH PRESENT:
						{/if}
						{#if locale === 'DE'}
							SWIGGI & TEACH THE SHOAH PRÄSENTIEREN:
						{/if}
					</span>
				{/if}
			</div>

			{#if innerWidth > 540}
				<div class="flex -mt-4">
					<button
						class="flex items-center space-x-1 px-2 lg:px-4 py-1 lg:py-2 bg-gray-200 hover:bg-gray-300"
						aria-label="Change Locale"
						onclick={toggleLocale}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="w-4 h-4 mb-1 text-black"
							aria-labelledby="languageIconTitle"
							role="img"
						>
							<title id="languageIconTitle">Language</title>
							<circle cx="12" cy="12" r="10"></circle>
							<path
								d="M12 22c2.667-2.424 4-5.758 4-10s-1.333-7.576-4-10c-2.667 2.424-4 5.758-4 10s1.333 7.576 4 10z"
							></path>
							<path d="M2.5 9h19M2.5 15h19"></path>
						</svg>
						<span class="font-bold text-xs lg:text-base text-black">{locale}</span>
					</button>
					<a
						href="https://www.teachtheshoah.org/donate/"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center px-2 lg:px-4 py-1 lg:py-2 bg-primary-400 text-white text-xs lg:text-base font-bold hover:bg-primary-500"
					>
						Support Us
					</a>
				</div>
			{/if}
		</div>

		<div class="flex flex-wrap w-full">
			<span class="font-bold text-black">
				{#if locale === 'EN'}
					{#if innerWidth > 380}
						<span class="whitespace-nowrap text-3xl lg:text-5xl">THE VIENNA HOLOCAUST&nbsp;</span>
					{:else}
						<span class="whitespace-nowrap text-2xl ml-2">THE VIENNA HOLOCAUST&nbsp;</span>
					{/if}
					{#if innerWidth <= 540}
						<div class="flex items-center">
							{#if innerWidth > 380}
								<span class="whitespace-nowrap text-3xl lg:text-5xl"> REMEMBRANCE TOURS </span>
							{:else}
								<span class="whitespace-nowrap text-2xl ml-2"> REMEMBRANCE TOURS </span>
							{/if}
							<button
								aria-label="Toggle Mobile Menu"
								onclick={() => {
									showMobileMenu = !showMobileMenu;
									showExhibitMobileMenu = false;
									showLocateMeMobileMenu = false;
								}}
							>
								{#if !showMobileMenu}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="lucide lucide-menu mb-2 ml-2"
										><line x1="4" x2="20" y1="12" y2="12" /><line
											x1="4"
											x2="20"
											y1="6"
											y2="6"
										/><line x1="4" x2="20" y1="18" y2="18" /></svg
									>
								{:else}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="lucide lucide-x mb-2 ml-2"
										><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
									>
								{/if}
							</button>
						</div>
					{:else}
						<span class="whitespace-nowrap text-3xl lg:text-5xl"> REMEMBRANCE TOURS </span>
					{/if}
				{/if}
				{#if locale === 'DE'}
					<span class="whitespace-nowrap text-3xl lg:text-5xl">
						DIE WIENER HOLOCAUST-ERINNERUNGSTOUREN
					</span>
				{/if}
			</span>
		</div>

		{#if innerWidth <= 540}
			{#if showMobileMenu && !(showExhibitMobileMenu || showLocateMeMobileMenu)}
				<div class="flex flex-col items-start w-full">
					<!-- Exhibits with Submenu -->
					<button
						onclick={() => {
							showExhibitMobileMenu = !showExhibitMobileMenu;
							showLocateMeMobileMenu = false;
						}}
						class="mt-2 py-3 text-black text-3xl font-bold active:underline"
						aria-expanded={showExhibitMobileMenu}
					>
						Exhibits
					</button>
					<button
						onclick={async () => {
							showLocateMeMobileMenu = !showLocateMeMobileMenu;
							showExhibitMobileMenu = false;
							if (showLocateMeMobileMenu) {
								handleLocateMe();
							}
						}}
						class="py-3 text-black text-3xl font-bold active:underline"
						aria-expanded={showLocateMeMobileMenu}
					>
						Locate Me
					</button>
					<div class="flex group">
						<a
							href="https://www.teachtheshoah.org/"
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center py-3 text-black text-3xl font-bold group-active:underline"
						>
							Learn More
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="30"
								height="30"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="lucide lucide-arrow-up-right text-gray-400 group-active:text-primary-400"
							>
								<path d="M7 7h10v10" />
								<path d="M7 17 17 7" />
							</svg>
						</a>
					</div>
					<div class="flex group">
						<a
							href="https://www.teachtheshoah.org/donate"
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center py-4 text-black text-3xl font-bold group-active:underline"
						>
							Support Us
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="30"
								height="30"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="lucide lucide-arrow-up-right text-gray-400 group-active:text-primary-400"
							>
								<path d="M7 7h10v10" />
								<path d="M7 17 17 7" />
							</svg>
						</a>
					</div>
					<button class="flex mt-2 mb-2" aria-label="Change Locale" onclick={toggleLocale}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="w-7 h-7 text-black self-start mr-1"
							aria-labelledby="languageIconTitle"
							role="img"
						>
							<title id="languageIconTitle">Language</title>
							<circle cx="12" cy="12" r="10"></circle>
							<path
								d="M12 22c2.667-2.424 4-5.758 4-10s-1.333-7.576-4-10c-2.667 2.424-4 5.758-4 10s1.333 7.576 4 10z"
							></path>
							<path d="M2.5 9h19M2.5 15h19"></path>
						</svg>
						<span class="font-bold text-3xl text-black">{locale}</span>
					</button>
				</div>
			{/if}
			{#if showExhibitMobileMenu}
				<div class="bg-white flex gap-x-4 w-full pr-8 mb-4 z-20 mt-0">
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="120"
						height="30"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-arrow-left-to-line flex text-black mt-5"
						role="button"
						tabindex="0"
						aria-label="Close Exhibit Mobile Menu"
						onclick={() => {
							showExhibitMobileMenu = false;
						}}
					>
						<path d="M3 19V5" /><path d="m13 6-6 6 6 6" /><path d="M7 12h14" />
					</svg>
					<div>
						<p class="mt-2 py-3 font-bold text-black text-3xl">Exhibits</p>
						<p class="font-bold text-xl text-gray-500 mt-2">Plan Your Visit</p>
						<p class="mt-4 text-base lg:text-xl">
							Our Holocaust museum tours can exclusivly be found in Vienna, Austria. There are
							currently two tours available: Leopoldstadt and Inner Stadt. Please enjoy our
							thoughtfully curated tours, designed to provide an authentic and educational
							experience.
						</p>
					</div>
				</div>
			{/if}
			{#if showLocateMeMobileMenu}
				<div class="bg-white flex gap-x-4 w-full pr-8 mb-8 z-20 mt-0">
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="23.61"
						height="30"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-arrow-left-to-line flex text-black mt-5"
						role="button"
						tabindex="0"
						aria-label="Close Locate Me Mobile Menu"
						onclick={() => {
							showLocateMeMobileMenu = false;
						}}
					>
						<path d="M3 19V5" /><path d="m13 6-6 6 6 6" /><path d="M7 12h14" />
					</svg>
					<div class="flex-grow">
						<p class="mt-2 py-3 font-bold text-black text-3xl">Locate Me</p>
						<p class="font-bold text-xl mt-2 text-gray-500">Where Am I?</p>
						<div class="mt-4 text-xl"></div>
						{#if loc}
							<p class="mt-2 text-2xl">Looks like you're currently in {loc.city}, {loc.state}.</p>
							<p class="mt-0.5 text-2xl">
								{#if loc.state != 'Austria'}
									Come visit us in Austria!
								{:else}
									Your nearest tour is in {loc.tour}, {loc.distance}km away.{/if}
							</p>
						{:else if err}
							<p class="mt-0.5 text-2xl">
								Error locating your location. Please enable location in your browser, refresh the
								page, and try again.
							</p>
						{:else}
							<p class="mt-0.5 text-2xl">Loading your location<LoadingDots /></p>
						{/if}
					</div>
				</div>
			{/if}
		{:else}
			<div class="flex justify-start space-x-16 w-full mt-2 mb-1">
				<!-- Exhibits with Submenu -->
				<button
					onclick={() => {
						showExhibitSubmenu = !showExhibitSubmenu;
						showLocateMeSubmenu = false;
					}}
					class="py-2 text-black text-2xl font-bold hover:underline"
					aria-expanded={showExhibitSubmenu}
				>
					Exhibits
				</button>
				<button
					onclick={async () => {
						showLocateMeSubmenu = !showLocateMeSubmenu;
						showExhibitSubmenu = false;
						if (showLocateMeSubmenu) {
							handleLocateMe();
						}
					}}
					class="py-2 text-black text-2xl font-bold hover:underline"
					aria-expanded={showLocateMeSubmenu}
				>
					Locate Me
				</button>
				<div class="flex group">
					<a
						href="https://www.teachtheshoah.org/"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center py-2 text-black text-2xl font-bold group-hover:underline"
					>
						Learn More
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-arrow-up-right text-gray-400 group-hover:text-primary-400 mb-4 ms-0.5"
						>
							<path d="M7 7h10v10" />
							<path d="M7 17 17 7" />
						</svg>
					</a>
				</div>
			</div>
		{/if}
	</div>
</nav>

{#if showExhibitSubmenu && innerWidth > 500}
	<div class="bg-white w-full px-8 md:px-16 lg:px-32 mb-12 z-20 mt-4">
		<p class="font-bold text-2xl text-gray-500">Plan Your Visit</p>
		<p class="mt-2 text-2xl">
			Our Holocaust museum tours can exclusivly be found in Vienna, Austria.
		</p>
		<p class="mt-0.5 text-2xl">
			There are currently two tours available: Leopoldstadt and Inner Stadt.
		</p>
		<p class="mt-4 text-base">
			Please enjoy our thoughtfully curated tours, designed to provide an authentic and educational
			experience.
		</p>
	</div>
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed bottom-0 left-0 w-full h-full bg-white opacity-50 z-10"
		role="button"
		tabindex="0"
		aria-label="Close Submenus"
		onclick={() => {
			showExhibitSubmenu = false;
		}}
	></div>
{/if}

{#if showLocateMeSubmenu && innerWidth > 500}
	<div class="bg-white w-full px-8 md:px-16 lg:px-32 mb-12 z-20 mt-4">
		<p class="font-bold text-2xl text-gray-500">Where Am I?</p>
		{#if loc}
			<p class="mt-2 text-2xl">Looks like you're currently in {loc.city}, {loc.state}.</p>
			<p class="mt-0.5 text-2xl">
				{#if loc.state != 'Austria'}
					Come visit us in Austria!
				{:else}
					Your nearest tour is in {loc.tour}, {loc.distance}km away.{/if}
			</p>
		{:else if err}
			<p class="mt-0.5 text-2xl">
				Error locating your location. Please enable location in your browser, refresh the page, and
				try again.
			</p>
		{:else}
			<p class="mt-0.5 text-2xl">Loading your location<LoadingDots /></p>
		{/if}
	</div>
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed bottom-0 left-0 w-full h-full bg-white opacity-50 z-10"
		role="button"
		tabindex="0"
		aria-label="Close Submenus"
		onclick={() => {
			showLocateMeSubmenu = false;
		}}
	></div>
{/if}

{#if showMobileMenu && innerWidth <= 450}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed bottom-0 left-0 w-full h-full bg-white opacity-50 z-10"
		role="button"
		tabindex="0"
		aria-label="Close Mobile Menus"
		onclick={() => {
			showMobileMenu = false;
			showExhibitMobileMenu = false;
			showLocateMeMobileMenu = false;
		}}
	></div>
{/if}

<style>
</style>
