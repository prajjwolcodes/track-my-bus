interface SuccessPosition {
    coords: GeolocationCoordinates;
    timestamp: number;
}

interface GeolocationError {
    code: number;
    message: string;
}


interface Position {
    lat: number
    lng: number
    accuracy: number
    timestamp: number
}
