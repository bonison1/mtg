"use client";

import { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';
import './DistanceCalculator.module.css';  // We'll create this file next

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
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<[number, number]>>([]);
  const [clickCount, setClickCount] = useState(0);
  const [activeInput, setActiveInput] = useState<'origin' | 'destination' | null>(null);

  const fetchSuggestions = async (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    
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
      setShowSuggestions(true);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const calculateDistance = async () => {
    if (!originCoords || !destinationCoords) {
      alert("Please select both origin and destination locations");
      return;
    }

    setDistance("Calculating...");
    const origin = `${originCoords.lat},${originCoords.lng}`;
    const destination = `${destinationCoords.lat},${destinationCoords.lng}`;

    try {
      const response = await fetch(`/api/distance-matrix?origin=${origin}&destination=${destination}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching distance:", response.statusText, errorText);
        setDistance("Error calculating distance");
        return;
      }
      const data = await response.json();

      const distanceInMeters = data.rows[0].elements[0].distance;
      const distanceInKm = (distanceInMeters / 1000).toFixed(2);
      setDistance(`${distanceInKm} km`);

      const routePolyline = data.rows[0].elements[0].polyline;
      const decodedPolyline = polyline.decode(routePolyline);
      setRouteCoordinates(decodedPolyline);
    } catch (error) {
      console.error("Fetch error:", error);
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
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      setLocation("Selected Location");
    }
  };

  const handleInputFocus = (inputType: 'origin' | 'destination') => {
    setActiveInput(inputType);
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks on the suggestions
    setTimeout(() => {
      setActiveInput(null);
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="distance-calculator-container">
      <div className="input-section">
        <h1 className="title">Distance Calculator</h1>
        
        <div className="input-wrapper">
          <label className="input-label">Origin</label>
          <input
            className="location-input"
            type="text"
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value);
              fetchSuggestions(e.target.value);
            }}
            placeholder="Enter origin location"
            onFocus={() => handleInputFocus('origin')}
            onBlur={handleInputBlur}
          />
          {showSuggestions && activeInput === 'origin' && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li
                  className="suggestion-item"
                  key={index}
                  onClick={() => {
                    setOrigin(suggestion.description);
                    setOriginCoords({ lat: suggestion.latitude, lng: suggestion.longitude });
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="input-wrapper">
          <label className="input-label">Destination</label>
          <input
            className="location-input"
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              fetchSuggestions(e.target.value);
            }}
            placeholder="Enter destination location"
            onFocus={() => handleInputFocus('destination')}
            onBlur={handleInputBlur}
          />
          {showSuggestions && activeInput === 'destination' && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li
                  className="suggestion-item"
                  key={index}
                  onClick={() => {
                    setDestination(suggestion.description);
                    setDestinationCoords({ lat: suggestion.latitude, lng: suggestion.longitude });
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="calculate-button" onClick={calculateDistance}>
          Calculate Distance
        </button>
        
        {distance && (
          <div className="distance-result">
            <span className="distance-label">Total Distance:</span>
            <span className="distance-value">{distance}</span>
          </div>
        )}
        
        <div className="instructions">
          <p>You can also click on the map to select locations</p>
          <p>First click: Origin | Second click: Destination</p>
        </div>
      </div>

      <div className="map-container">
        <MapContainer center={[20.5937, 78.9629]} zoom={5}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
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
            <Polyline positions={routeCoordinates} color="blue" weight={3} />
          )}
          <MapClickHandler />
        </MapContainer>
      </div>
    </div>
  );
};

export default DistanceCalculator;