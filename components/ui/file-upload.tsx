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
  PresentationBarChart01StrokeRounded as PresentationIcon,
  Upload01StrokeRounded,
  Video02StrokeRounded as VideoIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
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
  selectedFile,
  accept,
  maxSize = 10, // 10MB default
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File) => {
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB`);
        return false;
      }
      setError(null);
      return true;
    },
    [maxSize]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelect(file);

        // Generate image preview if it's an image file
        if (isImageFile(file.name)) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setImagePreview(null);
        }
      }
    },
    [validateFile, onFileSelect]
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
      if (files.length > 0 && files[0]) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleRemoveFile = useCallback(() => {
    onFileSelect(null);
    setError(null);
    setImagePreview(null);
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
          selectedFile && "p-4",
          isDragOver && "border-primary bg-primary/5",
          error && "border-destructive"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="File preview"
                    className="size-12 object-cover rounded-xl"
                  />
                </div>
              ) : (
                <FileTypeIcon fileName={selectedFile.name} className="size-6" />
              )}
              <div className="flex flex-col">
                <span className="font-medium text-sm">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="smallIcon"
              onClick={handleRemoveFile}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <HugeiconsIcon icon={Cancel01StrokeRounded} />
            </Button>
          </div>
        ) : (
          <>
            <input
              type="file"
              accept={accept}
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center text-center">
              <HugeiconsIcon
                icon={Upload01StrokeRounded}
                className="size-6 text-muted-foreground mb-2"
              />
              <p className="text-sm font-medium mb-1">
                Drop your file here, or{" "}
                <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Max size: {maxSize}MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
export function FileTypeIcon({
  fileName,
  className,
}: {
  fileName: string;
  className?: string;
}) {
  const icon = getFileTypeIcon(fileName);
  return (
    <HugeiconsIcon icon={icon} className={cn("size-4 text-brand", className)} />
  );
}
