"use client";

import { PageHeading } from "@/components/layout/page-heading";
import { ErrorCard } from "@/components/misc/error-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import {
  WIDGET_CUSTOM_DEFAULTS,
  WIDGET_MAX_DIMENSIONS,
  WidgetGridItem,
  WidgetSize,
  Widgets,
  WidgetsConfiguration,
  dimensionsToSize,
} from "@/constants/core";
import { cn } from "@/helpers/cn";
import { useUpdateGenericUserSetting } from "@/hooks/trpc/use-update-generic-user-setting";
import {
  CheckIcon,
  LayoutDashboardIcon,
  PlusIcon,
  Settings2Icon,
  XIcon,
} from "lucide-react";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WIDGET_COMPONENTS, WIDGET_NAMES, isCustomizableWidget } from "./index";

// Clean interface definitions
export interface ResponsiveWidget extends WidgetGridItem {
  size: WidgetSize;
}

interface WidgetDragState {
  isDragging: boolean;
  dragType: "move" | "resize" | null;
  widgetId: string | null;
  startSize: { width: number; height: number };
  startMousePos: { x: number; y: number };
}
const initialDragState: WidgetDragState = {
  isDragging: false,
  dragType: null,
  widgetId: null,
  startSize: { width: 1, height: 1 },
  startMousePos: { x: 0, y: 0 },
};
export const WidgetContext = createContext<{
  isEditing: boolean;
  handleRemoveWidget: (widgetId: string) => void;
  handleCustomizeWidget: (widget: WidgetGridItem) => void;
  handleResizeStart: (
    e: React.MouseEvent | React.TouchEvent,
    widgetId: string
  ) => void;

  dragOverIndex: number | null;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragEnd: () => void;
  gridColumns: number;
  dragState: WidgetDragState;
}>({
  isEditing: false,
  handleRemoveWidget: () => {},
  handleCustomizeWidget: () => {},
  handleResizeStart: () => {},
  dragOverIndex: null,
  handleDragStart: () => {},
  handleDragOver: () => {},
  handleDrop: () => {},
  handleDragEnd: () => {},
  gridColumns: 4,
  dragState: initialDragState,
});
const getNewWidgetConfiguration = (type: Widgets) => {
  // Get the default size for this widget type (start with 2x2 or max allowed)

  const newWidget: WidgetGridItem = {
    id: `${type}-${Date.now()}`,
    type,
    width: 1,
    height: 1,
    custom: { ...WIDGET_CUSTOM_DEFAULTS[type] },
  };
  return newWidget;
};
export function WidgetEditor({
  configuration: initialConfiguration,
}: {
  configuration: WidgetsConfiguration;
}) {
  const updateSetting = useUpdateGenericUserSetting();

  const [isEditing, setIsEditing] = useState(false);
  const [configuration, setConfiguration] =
    useState<WidgetsConfiguration>(initialConfiguration);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [gridColumns, setGridColumns] = useState(4);
  const [customizingWidget, setCustomizingWidget] =
    useState<WidgetGridItem | null>(null);
  const [dragState, setDragState] = useState<WidgetDragState>(initialDragState);
  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState(false);

  // Update grid columns based on screen size
  useEffect(() => {
    const updateGridColumns = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setGridColumns(1); // Mobile: 1 column
      } else if (width < 1024) {
        setGridColumns(2); // Tablet: 2 columns
      } else if (width < 1440) {
        setGridColumns(3); // Desktop: 3 columns
      } else {
        setGridColumns(4); // Large: 4 columns
      }
    };

    updateGridColumns();
    window.addEventListener("resize", updateGridColumns);
    return () => window.removeEventListener("resize", updateGridColumns);
  }, []);

  // Calculate responsive widgets with appropriate sizing
  const responsiveWidgets = useMemo(
    () => calculateResponsiveLayout(configuration, gridColumns),
    [configuration, gridColumns]
  );

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    updateSetting.mutate({
      key: "widgetsConfiguration",
      value: configuration,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setConfiguration(initialConfiguration);
  };

  const handleAddWidget = (type: Widgets) => {
    const newWidget = getNewWidgetConfiguration(type);
    setConfiguration([...configuration, newWidget]);
  };
  const handleRemoveWidget = (widgetId: string) => {
    const newConfiguration = configuration.filter(
      (widget) => widget.id !== widgetId
    );
    setConfiguration(newConfiguration);
  };

  const updateWidgetInConfiguration = useCallback(
    (widgetId: string, updates: Partial<WidgetGridItem>) => {
      const newConfiguration = configuration.map((widget) =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      );

      setConfiguration(newConfiguration);
    },
    [configuration]
  );

  const handleCustomizeWidget = (widget: WidgetGridItem) => {
    setCustomizingWidget(widget);
  };

  const handleSaveCustomization = (widgetId: string, customValues: any) => {
    updateWidgetInConfiguration(widgetId, { custom: customValues });
    setCustomizingWidget(null);
  };

  const handleCancelCustomization = () => {
    setCustomizingWidget(null);
  };

  // Move widget to a different position
  const moveWidget = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex < 0 || fromIndex >= configuration.length) return;

      const newConfiguration = [...configuration];
      const [movedWidget] = newConfiguration.splice(fromIndex, 1);
      if (!movedWidget) return;

      newConfiguration.splice(toIndex, 0, movedWidget);
      setConfiguration(newConfiguration);
    },
    [configuration]
  );

  // Drag and drop handlers for moving
  const handleDragStart = useCallback(
    (e: React.DragEvent, widgetIndex: number) => {
      e.dataTransfer.setData("text/plain", `widget:${widgetIndex.toString()}`);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  // New drag start handler for palette buttons
  const handlePaletteDragStart = useCallback(
    (e: React.DragEvent, widgetType: Widgets) => {
      e.dataTransfer.setData("text/plain", `palette:${widgetType}`);
      e.dataTransfer.effectAllowed = "copy";
      setIsDraggingFromPalette(true);

      // Create a custom drag image showing the widget type
      const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
      dragElement.style.transform = "rotate(5deg)";
      dragElement.style.opacity = "0.8";
      document.body.appendChild(dragElement);
      e.dataTransfer.setDragImage(dragElement, 20, 20);

      // Clean up the drag image after a short delay
      setTimeout(() => {
        document.body.removeChild(dragElement);
      }, 0);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();

      // Set appropriate drop effect based on drag source
      if (isDraggingFromPalette) {
        e.dataTransfer.dropEffect = "copy";
      } else {
        e.dataTransfer.dropEffect = "move";
      }

      setDragOverIndex(targetIndex);
    },
    [isDraggingFromPalette]
  );
  const handleDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      const dragData = e.dataTransfer.getData("text/plain");

      try {
        if (dragData.startsWith("widget:")) {
          // Moving existing widget
          const fromIndexStr = dragData.replace("widget:", "");
          const fromIndex = parseInt(fromIndexStr, 10);
          if (!isNaN(fromIndex) && fromIndex !== targetIndex) {
            moveWidget(fromIndex, targetIndex);
          }
        } else if (dragData.startsWith("palette:")) {
          // Creating new widget from palette
          const widgetType = dragData.replace("palette:", "") as Widgets;

          const newWidget = getNewWidgetConfiguration(widgetType);

          // Insert the new widget at the target position
          const newConfiguration = [...configuration];
          newConfiguration.splice(targetIndex, 0, newWidget);
          setConfiguration(newConfiguration);
        }
      } catch (error) {
        console.error("Error parsing drag data:", error);
      }

      setDragOverIndex(null);
      setIsDraggingFromPalette(false);
    },
    [moveWidget, configuration]
  );

  // Add drag end handler to reset palette drag state
  const handleDragEnd = useCallback(() => {
    setIsDraggingFromPalette(false);
    setDragOverIndex(null);
  }, []);

  // Add drag leave handler to clear drop target highlighting when dragging away
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if we're leaving the grid container entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  }, []);

  // Handle resize functionality
  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, widgetId: string) => {
      e.preventDefault();
      e.stopPropagation();

      const widget = configuration.find((w) => w.id === widgetId);
      if (!widget) return;

      let clientX = 0;
      let clientY = 0;

      if ("touches" in e && e.touches && e.touches.length > 0) {
        clientX = e.touches[0]!.clientX;
        clientY = e.touches[0]!.clientY;
      } else if ("clientX" in e && "clientY" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      setDragState({
        isDragging: true,
        dragType: "resize",
        widgetId,
        startSize: { width: widget.width, height: widget.height },
        startMousePos: { x: clientX, y: clientY },
      });

      const handleResizeMove = (e: MouseEvent | TouchEvent) => {
        // Re-find the widget to ensure it still exists and get current dimensions
        const currentWidget = configuration.find((w) => w.id === widgetId);
        if (!currentWidget) return;

        let currentX = clientX;
        let currentY = clientY;

        if ("touches" in e && e.touches && e.touches.length > 0) {
          currentX = e.touches[0]!.clientX;
          currentY = e.touches[0]!.clientY;
        } else if ("clientX" in e && "clientY" in e) {
          currentX = e.clientX;
          currentY = e.clientY;
        }

        const deltaX = currentX - clientX;
        const deltaY = currentY - clientY;

        // Calculate new size based on mouse delta
        const gridCellWidth = 250; // Approximate grid cell width
        const gridCellHeight = 200; // Approximate grid cell height

        const newWidth = Math.max(
          1,
          currentWidget.width + Math.round(deltaX / gridCellWidth)
        );
        const newHeight = Math.max(
          1,
          currentWidget.height + Math.round(deltaY / gridCellHeight)
        );

        // Apply max constraints for this widget type
        const maxDimensions = WIDGET_MAX_DIMENSIONS[currentWidget.type];
        const constrainedWidth = Math.min(maxDimensions.width, newWidth);
        const constrainedHeight = Math.min(
          constrainedWidth,
          Math.min(maxDimensions.height, newHeight)
        );

        updateWidgetInConfiguration(widgetId, {
          width: constrainedWidth,
          height: constrainedHeight,
        });
      };

      const handleResizeEnd = () => {
        setDragState({
          isDragging: false,
          dragType: null,
          widgetId: null,
          startSize: { width: 1, height: 1 },
          startMousePos: { x: 0, y: 0 },
        });

        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
        document.removeEventListener("touchmove", handleResizeMove);
        document.removeEventListener("touchend", handleResizeEnd);
      };

      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
      document.addEventListener("touchmove", handleResizeMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleResizeEnd);
    },
    [configuration, updateWidgetInConfiguration]
  );

  return (
    <div className="space-y-4">
      {/* Editor Controls */}

      <PageHeading
        rightContent={
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  leftIcon={<XIcon className="size-4 sm:hidden" />}
                >
                  <p className="hidden sm:block">Cancel</p>
                </Button>
                <Button size="sm" onClick={handleSave} leftIcon={<CheckIcon />}>
                  <p className="hidden sm:block">Save</p>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={handleStartEditing}
                size="sm"
                className="border-none px-0 h-fit sm:h-9 sm:px-3 sm:border-solid"
                leftIcon={<LayoutDashboardIcon />}
              >
                <p className="hidden sm:block">Customize</p>
              </Button>
            )}
          </div>
        }
      />

      {/* Widget Palette */}
      {isEditing && (
        <Card>
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium">Add Widgets</h3>
              <p className="text-xs text-muted-foreground">
                Click to add or drag to place widgets
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.values(Widgets).map((widgetType) => (
                <Button
                  key={widgetType}
                  variant="outline"
                  size="sm"
                  draggable={true}
                  onClick={() => handleAddWidget(widgetType)}
                  onDragStart={(e) => handlePaletteDragStart(e, widgetType)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center gap-2 cursor-grab active:cursor-grabbing transition-transform hover:scale-105"
                >
                  <PlusIcon className="size-4" />
                  {WIDGET_NAMES[widgetType]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Responsive Widget Grid */}
      {configuration.length > 0 ? (
        <WidgetContext.Provider
          value={{
            isEditing,
            handleRemoveWidget,
            handleCustomizeWidget,
            handleResizeStart,
            dragOverIndex,
            handleDragStart,
            handleDragOver,
            handleDrop,
            handleDragEnd,
            gridColumns,
            dragState,
          }}
        >
          <div
            className="grid gap-4 auto-rows-min grid-flow-dense"
            style={{
              gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            }}
            onDragLeave={handleDragLeave}
          >
            {responsiveWidgets.map((widget, index) => {
              const widgetExport = WIDGET_COMPONENTS[widget.type];

              const isCustomizable = isCustomizableWidget(widgetExport);
              const WidgetComponent = isCustomizable
                ? widgetExport.component
                : widgetExport;

              return (
                <WidgetComponent
                  key={widget.id}
                  {...widget}
                  isEditing={isEditing}
                  index={index}
                />
              );
            })}

            {/* Drop zone for adding at the end */}
            {isEditing && (
              <div
                className="flex flex-col items-center gap-2"
                onDragOver={(e) => handleDragOver(e, configuration.length)}
                onDrop={(e) => handleDrop(e, configuration.length)}
              >
                <div
                  className={cn(
                    "min-h-[120px] sm:min-h-[200px] w-full flex-1 border border-dashed border-muted-foreground/25 rounded-lg flex flex-col gap-3 items-center justify-center text-muted-foreground text-sm transition-all",

                    {
                      "border-brand bg-brand/15 text-brand":
                        dragOverIndex === configuration.length &&
                        isDraggingFromPalette,
                    }
                  )}
                >
                  <PlusIcon className="size-6" />
                  {isDraggingFromPalette &&
                  dragOverIndex === configuration.length
                    ? "Release to add widget here"
                    : "Drop widget here"}
                </div>
                <p className="text-xs invisible">
                  Dummy title for the drop zone
                </p>
              </div>
            )}

            <CustomizationModal
              widget={customizingWidget}
              onSaveCustomization={handleSaveCustomization}
              onClose={handleCancelCustomization}
            />
          </div>
        </WidgetContext.Provider>
      ) : (
        <ErrorCard emoji="📊">No widgets added yet</ErrorCard>
      )}
    </div>
  );
}

// Calculate responsive layout with downsizing logic
function calculateResponsiveLayout(
  widgets: WidgetsConfiguration,
  gridColumns: number
): ResponsiveWidget[] {
  return widgets.map((widget) => {
    // Convert width/height to size enum
    if (widget.width <= gridColumns) {
      const baseSize = dimensionsToSize(widget.width, widget.height);
      return { ...widget, size: baseSize, isHidden: false };
    }
    const newSize = dimensionsToSize(gridColumns, widget.height);
    return { ...widget, size: newSize, isHidden: false };
  });
}
function CustomizationModal({
  onSaveCustomization,
  widget,
  onClose,
}: {
  onSaveCustomization: (widgetId: string, values: any) => void;
  widget: WidgetGridItem | null;
  onClose: () => void;
}) {
  const widgetExport = widget ? WIDGET_COMPONENTS[widget.type] : null;

  const isCustomizable = widgetExport && isCustomizableWidget(widgetExport);

  return (
    <ResponsiveDialog open={!!widget} onOpenChange={onClose}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Settings2Icon className="size-4" />
            Customize
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        {isCustomizable &&
          widgetExport.getCustomizationContent(
            {
              ...WIDGET_CUSTOM_DEFAULTS[widget!.type],
              ...widget!.custom,
            },
            (values) => onSaveCustomization(widget!.id, values)
          )}

        <ResponsiveDialogFooter>
          <Button>Save</Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
