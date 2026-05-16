"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

type LatLng = {
  lat: number;
  lng: number;
};

const LocationPicker = ({
  setPickupLocation,
}: {
  setPickupLocation: (location: LatLng | null) => void;
}) => {
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showMap) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      () => {
        setUserLocation({ lat: 27.7172, lng: 85.324 });
        setLoading(false);
      }
    );
  }, [showMap]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setSelectedLocation({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      },
    });

    return selectedLocation ? (
      <Marker
        position={[selectedLocation.lat, selectedLocation.lng]}
        icon={L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })}
      />
    ) : null;
  }

  const handleConfirm = () => {
    if (!selectedLocation) return;
    setPickupLocation(selectedLocation);
    setShowMap(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowMap(true)}
        className="px-3 py-2 bg-blue-900 text-white rounded-lg"
      >
        Select Location
      </button>

      {showMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] h-[80%] rounded-xl flex flex-col">

            {loading ? (
              <div className="flex items-center justify-center flex-1">
                Loading map...
              </div>
            ) : (
              <div className="flex-1">
                <MapContainer
                  center={[userLocation!.lat, userLocation!.lng]}
                  zoom={16}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker />
                </MapContainer>
              </div>
            )}

            <div className="p-4 flex justify-end gap-3 border-t">
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedLocation}
                className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;