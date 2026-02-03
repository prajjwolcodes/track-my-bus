import { onValue, ref, set } from "firebase/database";
import { realTimeDB } from "./firebase";

export function listenBusLocation(position: Position | null, busId: number): string {
    try {
        set(ref(realTimeDB, 'location/bus/' + busId), {
            lat: position?.lat,
            lng: position?.lng,
            accuracy: position?.accuracy,
            timestamp: position?.timestamp
        });
        return "OK"
    } catch (error) {
        return (error as Error).message
    }
}

export function getBusLocation(busId: number, callback: (data: Position | null) => void): void {
    const location = ref(realTimeDB, 'location/bus/' + busId);
    onValue(location, (snapshot) => {
        const data: Position | null = snapshot.val();
        callback(data);
    });
}