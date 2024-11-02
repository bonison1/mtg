"use client";
import { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';
import styles from './DistanceCalculator.module.css';

// Setting default marker icon paths
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

interface Suggestion {
  description: string;
  latitude: number;
  longitude: number;
}

const DistanceCalculator = () => {
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<Suggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Suggestion[]>([]);
  const [distance, setDistance] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<[number, number]>>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async (input: string, setSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>) => {
    try {
      const response = await fetch(`/api/autocomplete?input=${input}`);
      if (!response.ok) throw new Error("Error fetching suggestions");
      const data = await response.json();
      const suggestions = data.predictions.map((prediction: any) => ({
        description: prediction.description,
        latitude: prediction.geometry.location.lat,
        longitude: prediction.geometry.location.lng,
      }));
      setSuggestions(suggestions);
    } catch (error) {
      console.error("Autocomplete fetch error:", error);
      setError("Could not fetch suggestions. Please try again.");
    }
  };

  const calculateDistance = async () => {
    setDistance("Calculating...");
    if (!originCoords || !destinationCoords) {
      setDistance("Please select both origin and destination.");
      return;
    }
  
    const origin = `${originCoords.lat},${originCoords.lng}`;
    const destination = `${destinationCoords.lat},${destinationCoords.lng}`;
  
    try {
      const response = await fetch(`/api/distance-matrix?origin=${origin}&destination=${destination}`);
      if (!response.ok) throw new Error("Distance Matrix request failed");
  
      const data = await response.json();
      console.log("Full Distance API Response:", data); // Log the entire response
  
      // Directly access the `distance` value
      const distanceElement = data.rows[0].elements[0];
      const distanceInMeters = distanceElement.distance; // Use `distance` directly, not `.value`
      const polylineData = distanceElement.polyline;
  
      if (distanceInMeters !== undefined) {
        const distanceInKm = (distanceInMeters / 1000).toFixed(2); // Convert meters to kilometers
        setDistance(`${distanceInKm} km`);
      } else {
        setDistance("Distance data not available");
        console.warn("Distance data is missing in response:", distanceElement);
      }
  
      // Decode the polyline if available, to draw the route on the map
      if (polylineData) {
        const decodedPolyline = polyline.decode(polylineData);
        setRouteCoordinates(decodedPolyline);
      } else {
        console.warn("Polyline data not available in response:", distanceElement);
        setRouteCoordinates([]);
      }
    } catch (error) {
      console.error("Distance calculation error:", error);
      setDistance("Error calculating distance");
    }
  };
  
  const MapClickHandler = () => {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        const selectedCoords = { lat: e.latlng.lat, lng: e.latlng.lng };

        if (!originCoords) {
          setOriginCoords(selectedCoords);
          reverseGeocode(selectedCoords, setOrigin);
        } else {
          setDestinationCoords(selectedCoords);
          reverseGeocode(selectedCoords, setDestination);
        }
      },
    });
    return null;
  };

  const reverseGeocode = async (coords: { lat: number; lng: number }, setLocation: (name: string) => void) => {
    try {
      const response = await fetch(`/api/reverse-geocode?lat=${coords.lat}&lng=${coords.lng}`);
      const data = await response.json();
      setLocation(data.place_name || "Selected Location");
    } catch (error) {
      console.error("Reverse geocode error:", error);
      setLocation("Location not found");
    }
  };

  return (
    <div className={styles.distanceCalculator}>
      <div className={styles.inputSection}>
        <input
          type="text"
          value={origin}
          onChange={(e) => {
            setOrigin(e.target.value);
            fetchSuggestions(e.target.value, setOriginSuggestions);
          }}
          placeholder="Enter origin"
          className={styles.inputField}
        />
        {originSuggestions.length > 0 && (
          <ul className={styles.suggestionsList}>
            {originSuggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => {
                  setOrigin(suggestion.description);
                  setOriginCoords({ lat: suggestion.latitude, lng: suggestion.longitude });
                  setOriginSuggestions([]);
                }}
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        )}

        <input
          type="text"
          value={destination}
          onChange={(e) => {
            setDestination(e.target.value);
            fetchSuggestions(e.target.value, setDestinationSuggestions);
          }}
          placeholder="Enter destination"
          className={styles.inputField}
        />
        {destinationSuggestions.length > 0 && (
          <ul className={styles.suggestionsList}>
            {destinationSuggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => {
                  setDestination(suggestion.description);
                  setDestinationCoords({ lat: suggestion.latitude, lng: suggestion.longitude });
                  setDestinationSuggestions([]);
                }}
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        )}

        <button onClick={calculateDistance} className={styles.calculateButton}>Calculate Distance</button>
        <p className={styles.distanceDisplay}>Distance: {distance || ""}</p>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.mapSection}>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {originCoords && (
            <Marker position={[originCoords.lat, originCoords.lng]}>
              <Popup>Origin: {origin}</Popup>
            </Marker>
          )}
          {destinationCoords && (
            <Marker position={[destinationCoords.lat, destinationCoords.lng]}>
              <Popup>Destination: {destination}</Popup>
            </Marker>
          )}
          {routeCoordinates.length > 0 && (
            <Polyline positions={routeCoordinates} color="blue" />
          )}
          <MapClickHandler />
        </MapContainer>
      </div>
    </div>
  );
};

export default DistanceCalculator;
