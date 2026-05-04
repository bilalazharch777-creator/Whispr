
export const uploadToCloudinary = async (file, onProgress) => {
  const CLOUDINARY_UPLOAD_PRESET = "POVAProject";
  const CLOUDINARY_CLOUD_NAME = "divuzbycr";
  return new Promise((resolve, reject) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      file.type.startsWith("video")
        ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`
        : `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          url: response.secure_url,
          type: file.type.startsWith("video") ? "video" : "image",
        });
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Cloudinary upload failed"));
    xhr.send(data);
  });
};

export const uploadMediaFiles = async (mediaPreviews, onProgress) => {
  const uploadedMedia = [];
  const totalFiles = mediaPreviews.length;
  let filesProcessed = 0;

  for (const preview of mediaPreviews) {
    const response = await fetch(preview);
    const blob = await response.blob();
    const file = new File([blob], `media-${Date.now()}`, {
      type: blob.type,
    });

    const result = await uploadToCloudinary(file, (percent) => {
      const fileProgress = (percent / 100) * (1 / totalFiles);
      const overallProgress = filesProcessed / totalFiles + fileProgress;
      onProgress(Math.round(overallProgress * 100));
    });

    uploadedMedia.push(result);
    filesProcessed++;
    onProgress(Math.round((filesProcessed / totalFiles) * 100));
  }

  return uploadedMedia;
};