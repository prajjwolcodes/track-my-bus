/**
 * Utility to clear all service worker registrations
 * Use this in browser console: window.clearAllServiceWorkers()
 */
export const clearAllServiceWorkers = async () => {
    if (typeof window === "undefined") return;

    try {
        const registrations = await navigator.serviceWorker.getRegistrations();

        console.log(`Found ${registrations.length} service worker(s)`);

        for (const registration of registrations) {
            await registration.unregister();
            console.log("Unregistered:", registration.scope);
        }

        console.log("All service workers cleared! Please refresh the page.");
        return true;
    } catch (error) {
        console.error("Error clearing service workers:", error);
        return false;
    }
};

// Make it available globally in development
if (typeof window !== "undefined") {
    (window as any).clearAllServiceWorkers = clearAllServiceWorkers;
}
