import { onValue, ref, set, update } from "firebase/database";
import { realTimeDB } from "./firebase";

export interface BusLocationPayload extends Position {
    tripActive?: boolean;
}

export function updateBusLocation(busId: string | number, position: BusLocationPayload | null) {
    try {
        const busRef = ref(realTimeDB, 'location/bus/' + busId);

        if (position === null) {
            return set(busRef, null);
        }

        return update(busRef, {
            lat: position.lat,
            lng: position.lng,
            accuracy: position.accuracy,
            timestamp: position.timestamp,
            locationUpdatedAt: Date.now(),
        });
    } catch (error) {
        return (error as Error).message
    }
}

export function setBusTripActive(busId: string | number, tripActive: boolean) {
    try {
        return update(ref(realTimeDB, 'location/bus/' + busId), {
            tripActive,
            statusUpdatedAt: Date.now(),
        });
    } catch (error) {
        return (error as Error).message
    }
}

export function listenBusLocation(
    busId: string | number,
    callback: (data: BusLocationPayload | null) => void
) {
    const locationRef = ref(realTimeDB, 'location/bus/' + String(busId));

    return onValue(locationRef, (snapshot) => {
        const data = snapshot.val() as BusLocationPayload | null;
        callback(data);
    });
}
