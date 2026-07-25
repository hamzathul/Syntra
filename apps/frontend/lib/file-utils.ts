const MAX_IMAGE_SIZE = 500_000;

export async function readImageFileAsDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`"${file.name}" is not an image. Please select a valid image file.`);
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`"${file.name}" exceeds the 500KB limit.`);
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}