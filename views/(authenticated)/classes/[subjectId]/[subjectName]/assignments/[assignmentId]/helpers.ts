/**
 * Helper functions for processing submission files
 * - If all files are images (png, jpg, jpeg): merge into PDF
 * - If any file is not an image: create ZIP archive
 */

// Check if a file is an image (only png, jpg, jpeg)
export function isImageFile(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png"].includes(extension || "");
}

// Check if all files are images
export function areAllImages(files: File[]): boolean {
  return files.length > 0 && files.every((file) => isImageFile(file.name));
}

// Load image file as base64 data URL
async function loadImageAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export type ProcessingProgress = {
  type: "PROCESSING_FILE" | "GENERATING";
  current?: number;
  total?: number;
  fileName?: string;
  stage?: string;
};

// Process files using Web Worker
async function processFilesWithWorker(
  files: File[],
  onProgress?: (progress: ProcessingProgress) => void
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Create worker instance
    const worker = new Worker("/js/file-processor.worker.js");

    // Set up error handler
    worker.onerror = (error) => {
      worker.terminate();
      reject(new Error(`Worker error: ${error.message}`));
    };

    // Set up message handler
    worker.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === "PROGRESS") {
        // Forward progress updates
        if (onProgress) {
          onProgress(payload);
        }
      } else if (type === "SUCCESS") {
        const { file: processedFile } = payload;
        worker.terminate();

        // Create File object from processed data
        const blob = new Blob([processedFile.data], {
          type: processedFile.type,
        });
        const file = new File([blob], processedFile.name, {
          type: processedFile.type,
        });

        resolve(file);
      } else if (type === "ERROR") {
        worker.terminate();
        reject(new Error(payload.error));
      }
    };

    // Prepare files for worker
    Promise.all(
      files.map(async (file) => {
        if (isImageFile(file.name)) {
          // For images, send data URL
          const dataURL = await loadImageAsDataURL(file);
          return {
            name: file.name,
            dataURL,
          };
        } else {
          // For other files, send ArrayBuffer
          const content = await file.arrayBuffer();
          return {
            name: file.name,
            content,
          };
        }
      })
    )
      .then((preparedFiles) => {
        // Send files to worker
        worker.postMessage({
          type: "PROCESS_FILES",
          payload: { files: preparedFiles },
        });
      })
      .catch((error) => {
        worker.terminate();
        reject(error);
      });
  });
}

// Main function to process files and return the appropriate file to upload
// Uses Web Worker to offload processing from main thread
export async function processSubmissionFiles(
  files: File[],
  onProgress?: (progress: ProcessingProgress) => void
): Promise<File> {
  if (files.length === 0) {
    throw new Error("No files provided");
  }
  if (files.length === 1) return files[0]!;
  // Check if Worker is supported
  if (typeof Worker === "undefined") {
    throw new Error("Web Workers are not supported in this browser");
  }

  // Process files using Web Worker
  return await processFilesWithWorker(files, onProgress);
}
