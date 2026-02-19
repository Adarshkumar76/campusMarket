import { useState } from "react";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function ImageUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (data.secure_url) {
        onUpload(data.secure_url);
      } else {
        alert("Upload failed, try again.");
        console.error("Cloudinary response:", data);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Could not upload image.");
    }

    setUploading(false);
  }

  return (
    <div className="image-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <span className="upload-status">Uploading...</span>}
    </div>
  );
}

export default ImageUpload;
