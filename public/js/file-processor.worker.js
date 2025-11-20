/**
 * Web Worker for processing files off the main thread
 * Handles PDF generation and ZIP creation without blocking the UI
 */

// Load pdf-lib and jszip from CDN
// Using jsDelivr which provides UMD builds compatible with importScripts
importScripts(
  "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js"
);
importScripts("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js");

// Check if a file is an image (only png, jpg, jpeg)
function isImageFile(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png"].includes(extension || "");
}

// Check if all files are images
function areAllImages(fileNames) {
  return fileNames.length > 0 && fileNames.every((name) => isImageFile(name));
}

// Load image data URL as Uint8Array
async function dataURLToUint8Array(dataURL) {
  const response = await fetch(dataURL);
  return new Uint8Array(await response.arrayBuffer());
}

// Merge images into a PDF
async function mergeImagesToPDF(files, onProgress) {
  // pdf-lib UMD build exposes as global pdfLib
  // Check multiple possible global names for compatibility
  const PDFLib = self.pdfLib || self.PDFLib;
  if (!PDFLib || !PDFLib.PDFDocument) {
    throw new Error("PDFLib not loaded. Check CDN URL.");
  }
  const { PDFDocument } = PDFLib;
  const pdfDoc = await PDFDocument.create();

  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      // Report progress: processing file
      if (onProgress) {
        onProgress({
          type: "PROCESSING_FILE",
          current: i + 1,
          total: totalFiles,
          fileName: file.name,
        });
      }

      const imageBytes = await dataURLToUint8Array(file.dataURL);
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      let image;

      if (extension === "png") {
        image = await pdfDoc.embedPng(imageBytes);
      } else if (extension === "jpg" || extension === "jpeg") {
        image = await pdfDoc.embedJpg(imageBytes);
      } else {
        continue;
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    } catch (error) {
      console.error(`Error processing image ${file.name}:`, error);
    }
  }

  // Report progress: generating PDF
  if (onProgress) {
    onProgress({
      type: "GENERATING",
      stage: "PDF",
    });
  }

  return await pdfDoc.save();
}

// Create a ZIP archive
async function createZipArchive(files, onProgress) {
  // JSZip UMD build exposes as global JSZip
  // Check multiple possible global names for compatibility
  const JSZipClass = self.JSZip || self.jszip;
  if (!JSZipClass) {
    throw new Error("JSZip not loaded. Check CDN URL.");
  }
  const zip = new JSZipClass();

  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      // Report progress: adding file to ZIP
      if (onProgress) {
        onProgress({
          type: "PROCESSING_FILE",
          current: i + 1,
          total: totalFiles,
          fileName: file.name,
        });
      }

      zip.file(file.name, file.content);
    } catch (error) {
      console.error(`Error adding file ${file.name} to zip:`, error);
    }
  }

  // Report progress: generating ZIP
  if (onProgress) {
    onProgress({
      type: "GENERATING",
      stage: "ZIP",
    });
  }

  return await zip.generateAsync({ type: "blob" });
}

// Worker message handler
self.onmessage = async function (event) {
  const { type, payload } = event.data;

  try {
    if (type === "PROCESS_FILES") {
      const { files } = payload;

      // Progress callback to send updates to main thread
      const onProgress = (progress) => {
        self.postMessage({
          type: "PROGRESS",
          payload: progress,
        });
      };

      if (areAllImages(files.map((f) => f.name))) {
        // All images: create PDF
        // Filter to only files that have dataURL (images)
        const fileData = files
          .filter((file) => file.dataURL)
          .map((file) => ({
            name: file.name,
            dataURL: file.dataURL,
          }));

        if (fileData.length === 0) {
          throw new Error("No image files found to process");
        }

        const pdfBytes = await mergeImagesToPDF(fileData, onProgress);

        // Send PDF back to main thread
        self.postMessage({
          type: "SUCCESS",
          payload: {
            file: {
              name: "submission.pdf",
              type: "application/pdf",
              data: pdfBytes.buffer,
            },
          },
        });
      } else {
        // Mixed files: create ZIP
        // Use content for non-images, dataURL for images (convert to ArrayBuffer)
        const fileData = await Promise.all(
          files.map(async (file) => {
            if (file.content) {
              return {
                name: file.name,
                content: file.content,
              };
            } else if (file.dataURL) {
              // Convert image dataURL to ArrayBuffer for ZIP
              const response = await fetch(file.dataURL);
              return {
                name: file.name,
                content: await response.arrayBuffer(),
              };
            } else {
              throw new Error(`File ${file.name} has no content or dataURL`);
            }
          })
        );
        const zipBlob = await createZipArchive(fileData, onProgress);
        const zipArrayBuffer = await zipBlob.arrayBuffer();

        // Send ZIP back to main thread
        self.postMessage({
          type: "SUCCESS",
          payload: {
            file: {
              name: "submission.zip",
              type: "application/zip",
              data: zipArrayBuffer,
            },
          },
        });
      }
    }
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      payload: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
};
