// Create a no-op module for SSR
const L = typeof window === 'undefined' 
  ? {} as any
  : require('leaflet');

// Only run this code on the client side
if (typeof window !== 'undefined') {
  // This block prevents errors with Leaflet's default icon
  const DefaultIcon = L.icon({
    iconUrl: '/images/marker-icon.png',
    iconRetinaUrl: '/images/marker-icon-2x.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
  });

  // Set default icon for all markers
  L.Marker.prototype.options.icon = DefaultIcon;

  // Fix Leaflet's CSS issues with Next.js
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  // Override default icon paths
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png',
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
  });

  // Add any additional Leaflet configuration here
  L.Map.addInitHook(function(this: L.Map) {
    // Disable 3D transforms which can cause visual glitches
    if (typeof this.options.transform3DLimit === 'undefined') {
      this.options.transform3DLimit = 2;
    }
  });
}

export default L;