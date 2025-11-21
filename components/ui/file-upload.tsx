import { Button } from "@/components/ui/button";
import { cn } from "@/helpers/cn";

import {
  Archive03StrokeRounded as ArchiveIcon,
  Cancel01StrokeRounded,
  FileScriptStrokeRounded as FileCodeIcon,
  FileEmpty02StrokeRounded as FileIcon,
  TableStrokeRounded as FileSpreadsheetIcon,
  File02StrokeRounded as FileTextIcon,
  Image02StrokeRounded as ImageIcon,
  MusicNote03StrokeRounded as MusicIcon,
  PlusSignStrokeRounded,
  PresentationBarChart01StrokeRounded as PresentationIcon,
  Upload01StrokeRounded,
  Video02StrokeRounded as VideoIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon, HugeiconsIconProps } from "@hugeicons/react";
import { useCallback, useMemo, useRef, useState } from "react";

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  selectedFiles: File[];
  accept?: string;
  maxSize?: number; // in MB (total size of all files)
  className?: string;
  disableControls?: boolean;
}
const extensionToIcon = {
  jpg: ImageIcon,
  jpeg: ImageIcon,
  png: ImageIcon,
  gif: ImageIcon,
  bmp: ImageIcon,
  webp: ImageIcon,
  svg: ImageIcon,
  mp3: MusicIcon,
  wav: MusicIcon,
  flac: MusicIcon,
  aac: MusicIcon,
  ogg: MusicIcon,
  m4a: MusicIcon,
  mp4: VideoIcon,
  avi: VideoIcon,
  mov: VideoIcon,
  wmv: VideoIcon,
  flv: VideoIcon,
  webm: VideoIcon,
  mkv: VideoIcon,
  pdf: FileTextIcon,
  docx: FileTextIcon,
  doc: FileTextIcon,
  pages: FileTextIcon,
  zip: ArchiveIcon,
  rar: ArchiveIcon,
  tar: ArchiveIcon,
  gz: ArchiveIcon,
  xlsx: FileSpreadsheetIcon,
  xls: FileSpreadsheetIcon,
  csv: FileSpreadsheetIcon,
  numbers: FileSpreadsheetIcon,
  js: FileCodeIcon,
  ts: FileCodeIcon,
  jsx: FileCodeIcon,
  tsx: FileCodeIcon,
  html: FileCodeIcon,
  css: FileCodeIcon,
  json: FileCodeIcon,
  xml: FileCodeIcon,
  py: FileCodeIcon,
  java: FileCodeIcon,
  cpp: FileCodeIcon,
  c: FileCodeIcon,
  pptx: PresentationIcon,
  ppt: PresentationIcon,
  key: PresentationIcon,
};
// Helper function to get file type icon
const getFileTypeIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension) {
    return FileIcon;
  }
  return extensionToIcon[extension as keyof typeof extensionToIcon] || FileIcon;
};

// Helper function to check if file is an image
const isImageFile = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(
    extension || ""
  );
};

export function FileUpload({
  onFileSelect,
  selectedFiles,
  accept,
  maxSize = 18.9,
  className,
  disableControls = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filePreviews, setFilePreviews] = useState<Map<string, string>>(
    new Map()
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate total size of all files
  const totalSize = useMemo(() => {
    return selectedFiles.reduce((sum, file) => sum + file.size, 0);
  }, [selectedFiles]);

  const validateFiles = useCallback(
    (files: File[]) => {
      const currentTotal = totalSize;
      const newFilesTotal = files.reduce((sum, file) => sum + file.size, 0);
      const combinedTotal = currentTotal + newFilesTotal;

      if (maxSize && combinedTotal > maxSize * 1024 * 1024) {
        setError(
          `Total file size must be less than ${maxSize}MB. Current total: ${formatFileSize(
            combinedTotal
          )}`
        );
        return false;
      }
      setError(null);
      return true;
    },
    [maxSize, totalSize]
  );

  const generateImagePreviews = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        if (isImageFile(file.name) && !filePreviews.has(file.name)) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              setFilePreviews((prev) => {
                // Only create new Map if file doesn't exist
                if (prev.has(file.name)) {
                  return prev;
                }
                const updated = new Map(prev);
                updated.set(file.name, e.target!.result as string);
                return updated;
              });
            }
          };
          reader.readAsDataURL(file);
        }
      });
    },
    [filePreviews]
  );

  const handleFilesSelect = useCallback(
    (newFiles: File[]) => {
      if (newFiles.length === 0) return;

      // Filter out files that are already selected
      const uniqueNewFiles = newFiles.filter(
        (newFile) =>
          !selectedFiles.some(
            (existingFile) =>
              existingFile.name === newFile.name &&
              existingFile.size === newFile.size &&
              existingFile.lastModified === newFile.lastModified
          )
      );

      if (uniqueNewFiles.length === 0) return;

      if (validateFiles(uniqueNewFiles)) {
        const updatedFiles = [...selectedFiles, ...uniqueNewFiles];
        onFileSelect(updatedFiles);
        generateImagePreviews(uniqueNewFiles);
      }
    },
    [selectedFiles, validateFiles, onFileSelect, generateImagePreviews]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFilesSelect(files);
      }
    },
    [handleFilesSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleFilesSelect(files);
      }
      // Reset input so same files can be selected again
      e.target.value = "";
    },
    [handleFilesSelect]
  );

  const handleRemoveFile = useCallback(
    (fileToRemove: File) => {
      const updatedFiles = selectedFiles.filter(
        (file) =>
          !(
            file.name === fileToRemove.name &&
            file.size === fileToRemove.size &&
            file.lastModified === fileToRemove.lastModified
          )
      );
      onFileSelect(updatedFiles);

      // Remove preview if it exists
      if (filePreviews.has(fileToRemove.name)) {
        setFilePreviews((prev) => {
          const updated = new Map(prev);
          updated.delete(fileToRemove.name);
          return updated;
        });
      }

      setError(null);
    },
    [selectedFiles, onFileSelect, filePreviews]
  );

  const handleAddFilesClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleResetClick = useCallback(() => {
    onFileSelect([]);
    setFilePreviews(new Map());
    setError(null);
  }, [onFileSelect]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      <div
        className={cn(
          "relative border border-dashed rounded-xl p-6 transition-colors w-full",
          "hover:border-primary/30",
          selectedFiles.length > 0 && "p-4",
          isDragOver && "border-primary bg-primary/5",
          error && "border-destructive"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />
        {selectedFiles.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto">
              {selectedFiles.map((file, index) => {
                const preview = filePreviews.get(file.name);
                return (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {preview ? (
                        <div className="relative flex-shrink-0">
                          <img
                            src={preview}
                            alt={file.name}
                            className="size-12 object-cover rounded-xl"
                          />
                        </div>
                      ) : (
                        <div className="bg-brand/10 rounded-xl size-12 flex justify-center items-center">
                          <FileTypeIcon
                            fileName={file.name}
                            className="size-6 flex-shrink-0"
                            data-auto-stroke-width
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium text-sm truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="smallIcon"
                      onClick={() => handleRemoveFile(file)}
                      className="hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                      disabled={disableControls}
                    >
                      <HugeiconsIcon icon={Cancel01StrokeRounded} />
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xs text-muted-foreground">
                {selectedFiles.length} file
                {selectedFiles.length !== 1 ? "s" : ""}
                {" · "}
                Total: {formatFileSize(totalSize)}
              </span>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddFilesClick}
                  disabled={disableControls}
                  leftIcon={<HugeiconsIcon icon={PlusSignStrokeRounded} />}
                >
                  Add files
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetClick}
                  disabled={disableControls}
                  leftIcon={<HugeiconsIcon icon={Cancel01StrokeRounded} />}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={handleAddFilesClick}
            className="flex flex-col items-center justify-center text-center cursor-pointer"
          >
            <HugeiconsIcon
              icon={Upload01StrokeRounded}
              className="size-6 text-muted-foreground mb-2"
            />
            <p className="text-sm font-medium mb-1">
              Click or drop your files here
            </p>
            <p className="text-xs text-muted-foreground">
              Max total size: {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
export function FileTypeIcon({
  fileName,
  className,
  ...props
}: {
  fileName: string;
  className?: string;
} & Omit<HugeiconsIconProps, "icon">) {
  const icon = getFileTypeIcon(fileName);
  return (
    <HugeiconsIcon
      icon={icon}
      className={cn("size-4 text-brand", className)}
      {...props}
    />
  );
}
