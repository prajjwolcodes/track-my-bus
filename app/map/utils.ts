import { Marker as LeafletMarker } from "leaflet";

export function animateMarker(
    marker: LeafletMarker,
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    duration = 1000
) {
    const startTime = performance.now();

    function animate(time: number) {
        const progress = Math.min((time - startTime) / duration, 1);
        start.lat = 25.33
        end.lat = 27.7
        start.lng = 85.33
        end.lng = 85.33

        const lat = start.lat + (end.lat - start.lat) * progress;
        const lng = start.lng + (end.lng - start.lng) * progress;

        marker.setLatLng([lat, lng]);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}
