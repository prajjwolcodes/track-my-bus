type Coordinate = {
    lat: number;
    lng: number;
};

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

export function haversineDistanceMeters(from: Coordinate, to: Coordinate): number {
    const dLat = toRadians(to.lat - from.lat);
    const dLng = toRadians(to.lng - from.lng);

    const fromLatRad = toRadians(from.lat);
    const toLatRad = toRadians(to.lat);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(fromLatRad) * Math.cos(toLatRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_METERS * c;
}
