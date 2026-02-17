import imageCompression from "browser-image-compression";

export const uploadSignedImage = async (file: File, type: 'drivers' | 'students') => {
    const folderPath = `bus-tracker/${type}`;

    try {
        // 1. Compress image
        const compressedFile = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true
        });

        // 2. Get signature from API 
        const signRes = await fetch("/api/cloudinarySignature", {
            method: "POST",
            body: JSON.stringify({ folder: folderPath }),
            headers: { "Content-Type": "application/json" }
        });

        if (!signRes.ok) throw new Error("Failed to get Cloudinary signature");

        const { timestamp, signature, cloudName, apiKey } = await signRes.json();

        // 3. Prepare form data
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString()); 
        formData.append("signature", signature);
        formData.append("folder", folderPath); 

        // 4. Upload to Cloudinary
        const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await uploadRes.json();

        if (!uploadRes.ok) {
            console.error("Cloudinary Error:", data);
            throw new Error(data.error?.message || "Cloudinary upload failed");
        }

        return data.secure_url;

    } catch (error) {
        console.error("Upload process error:", error);
        return null; 
    }
};