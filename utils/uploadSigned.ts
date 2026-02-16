export const uploadSignedImage = async (file: File) => {

    //  Get signature from API
  const signRes = await fetch("/api/cloudinarySignature", {
    method: "POST",
  });

  const { timestamp, signature, cloudName, apiKey } =
    await signRes.json();

  // Prepare form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", "bus-tracker");

  // Upload to Cloudinary
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await uploadRes.json();
  return data.secure_url;
};