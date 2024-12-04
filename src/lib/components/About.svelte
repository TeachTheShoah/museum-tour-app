<script lang="ts">
	export let image: string;
</script>

<div class="flex mt-8 lg:mt-16 mb-16 px-8 md:px-16 lg:px-32 z-10">
	<div class="w-full lg:w-2/3">
		<div class="flex flex-col justify-between">
			<h3 class="text-2xl lg:text-3xl font-bold">
				<p>About Us</p>
			</h3>
			<div class="mt-4 lg:mt-8 mr-2 lg:mr-12 font-bold text-base lg:text-2xl text-gray-600">
				<p>
					We are a collaboration between SWIGGI, the Simon Wiesenthal Genealogical Geolocation
					Initiative, and Teach the Shoah. Together, we aim to link genealogy and geolocation data
					to tell multitudes of stories from the Holocaust while preserving and commemorating these
					living environments through our curated tours.
				</p>
			</div>
		</div>
	</div>
	<div class="hidden w-0 lg:w-1/3 lg:block">
		<img
			src={image}
			alt="Simon Wiesenthal Hero"
			class="w-full h-auto object-cover"
			loading="lazy"
		/>
	</div>
</div>

<style>
</style>
