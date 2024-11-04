"use client";
import { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';
import Header from './Header';
import styles from './DistanceCalculator.module.css';

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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [distance, setDistance] = useState<string | null>(null);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState<boolean>(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState<boolean>(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<[number, number]>>([]);
  const [clickCount, setClickCount] = useState(0);

  const fetchSuggestions = async (input: string) => {
    try {
      const response = await fetch(`/api/autocomplete?input=${input}`);
      if (!response.ok) {
        console.error("Error fetching suggestions:", response.statusText);
        return;
      }
      const data = await response.json();
      const suggestions = data.predictions.map((prediction: any) => ({
        description: prediction.description,
        latitude: prediction.geometry.location.lat,
        longitude: prediction.geometry.location.lng,
      }));
      setSuggestions(suggestions);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const calculateDistance = async () => {
    setDistance("Calculating...");
    if (!originCoords || !destinationCoords) return;

    try {
      const response = await fetch(`/api/distance-matrix?origin=${originCoords.lat},${originCoords.lng}&destination=${destinationCoords.lat},${destinationCoords.lng}`);
      if (!response.ok) {
        setDistance("Error calculating distance");
        return;
      }
      const data = await response.json();
      const distanceInKm = (data.rows[0].elements[0].distance / 1000).toFixed(2);
      setDistance(`${distanceInKm} km`);
      const decodedPolyline = polyline.decode(data.rows[0].elements[0].polyline);
      setRouteCoordinates(decodedPolyline);
    } catch (error) {
      setDistance("Error calculating distance");
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        const selectedCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
        if (clickCount === 0) {
          setOriginCoords(selectedCoords);
          setClickCount(1);
          reverseGeocode(selectedCoords, setOrigin);
        } else {
          setDestinationCoords(selectedCoords);
          setClickCount(0);
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
    } catch {
      setLocation("Selected Location");
    }
  };

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <div className={styles.inputSection}>
          <input
            type="text"
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value);
              fetchSuggestions(e.target.value);
              setShowOriginSuggestions(true);
              setShowDestinationSuggestions(false);
            }}
            placeholder="Enter origin"
            className={styles.inputField}
            onFocus={() => setShowOriginSuggestions(true)}
          />
          {showOriginSuggestions && (
            <ul className={styles.suggestionsList}>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setOrigin(suggestion.description);
                    setOriginCoords({ lat: suggestion.latitude, lng: suggestion.longitude });
                    setShowOriginSuggestions(false);
                  }}
                  className={styles.suggestionItem}
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
              fetchSuggestions(e.target.value);
              setShowDestinationSuggestions(true);
              setShowOriginSuggestions(false);
            }}
            placeholder="Enter destination"
            className={styles.inputField}
            onFocus={() => setShowDestinationSuggestions(true)}
          />
          {showDestinationSuggestions && (
            <ul className={styles.suggestionsList}>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setDestination(suggestion.description);
                    setDestinationCoords({ lat: suggestion.latitude, lng: suggestion.longitude });
                    setShowDestinationSuggestions(false);
                  }}
                  className={styles.suggestionItem}
                >
                  {suggestion.description}
                </li>
              ))}
            </ul>
          )}
          <button onClick={calculateDistance} className={styles.calculateButton}>Calculate Distance</button>
          <p>Distance: {distance || ""}</p>
        </div>
        <div className={styles.mapContainer}>
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
            {originCoords && <Marker position={[originCoords.lat, originCoords.lng]}><Popup>Origin: {origin}</Popup></Marker>}
            {destinationCoords && <Marker position={[destinationCoords.lat, destinationCoords.lng]}><Popup>Destination: {destination}</Popup></Marker>}
            {routeCoordinates.length > 0 && <Polyline positions={routeCoordinates} color="blue" />}
            <MapClickHandler />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default DistanceCalculator;
