const MAX_IMAGE_SIZE = 500_000;
const MAX_DOCUMENT_SIZE = 2_000_000;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function readImageFileAsDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error(
      `"${file.name}" is not an image. Please select a valid image file.`,
    );
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`"${file.name}" exceeds the 500KB limit.`);
  }
  return readAsDataUrl(file);
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  if (file.size > MAX_DOCUMENT_SIZE) {
    throw new Error(`"${file.name}" exceeds the 2MB limit.`);
  }
  return readAsDataUrl(file);
}
