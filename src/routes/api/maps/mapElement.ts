let MapElementSingleton: MapElementConstructor;

export async function getMapElement(): Promise<typeof google.maps.Map> {
  
  if (!MapElementSingleton) {
    // Import only once and store it
		const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
    MapElementSingleton = Map;
  }
  return MapElementSingleton;
}