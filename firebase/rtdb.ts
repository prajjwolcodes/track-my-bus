import { onValue, ref, set } from "firebase/database";
import { realTimeDB } from "./firebase";

export function updateBusLocation(busId: number, position: Position | null) {
    try {
        return set(ref(realTimeDB, 'location/bus/' + busId), position);
    } catch (error) {
        return (error as Error).message
    }
}

export function listenBusLocation(busId: number, callback: (data: Position | null) => void) {
    const location = ref(realTimeDB, 'location/bus/' + busId);

    return onValue(location, (snapshot) => {
        const data: Position | null = snapshot.val();
        callback(data);
    });
}