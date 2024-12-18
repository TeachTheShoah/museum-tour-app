let AdvancedMarkerElementSingleton: AdvancedMarkerElementConstructor;

export async function getAdvancedMarkerElement(): Promise<typeof google.maps.marker.AdvancedMarkerElement> {
  
  if (!AdvancedMarkerElementSingleton) {
    // Import only once and store it
    const { AdvancedMarkerElement } = (await google.maps.importLibrary(
      'marker'
    )) as google.maps.MarkerLibrary;
    AdvancedMarkerElementSingleton = AdvancedMarkerElement;
  }
  return AdvancedMarkerElementSingleton;
}