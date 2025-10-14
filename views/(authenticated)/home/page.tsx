"use client";

import { PageHeading } from "@/components/layout/page-heading";
import { ErrorCard } from "@/components/misc/error-card";
import { TitleManager } from "@/components/misc/title-manager";
import { Button, ButtonProps } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
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
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { queryClient, trpc } from "@/views/trpc";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  ScreenReaderInstructions,
  TouchSensor,
  UniqueIdentifier,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Cancel01StrokeRounded,
  DashboardSquareEditStrokeRounded,
  PlusSignStrokeRounded,
  SlidersHorizontalStrokeRounded,
  Tick02StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { GripIcon } from "lucide-react";
import React, {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChangelogCard } from "./changelog-card";
import {
  WIDGET_COMPONENTS,
  WIDGET_NAMES,
  isCustomizableWidget,
} from "./helpers";
import scheduleTodayWidget from "./schedule-today-widget";

// Clean interface definitions
export interface ResponsiveWidget<T extends Widgets = Widgets>
  extends WidgetGridItem<T> {
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
  gridColumns: number;
  dragState: WidgetDragState;
}>({
  isEditing: false,
  handleRemoveWidget: () => {},
  handleCustomizeWidget: () => {},
  handleResizeStart: () => {},

  gridColumns: 4,
  dragState: initialDragState,
});
const screenReaderInstructions: ScreenReaderInstructions = {
  draggable: `
    To pick up a sortable item, press the space bar.
    While sorting, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};
const getNewWidgetConfiguration = (type: Widgets) => {
  // Get the default size for this widget type (start with 2x2 or max allowed)

  const newWidget: WidgetGridItem = {
    id: `${type}-${Date.now()}`,
    type,
    width: 1,
    height: 1,
    custom: WIDGET_CUSTOM_DEFAULTS[type],
  };
  return newWidget;
};

export default function HomePage() {
  const settings = useUserSettings();
  useLayoutEffect(() => {
    const widgets = settings.widgetsConfiguration;
    const widgetTypes = new Set(widgets.map((w) => w.type));

    if (widgetTypes.has(Widgets.SCHEDULE_TODAY)) {
      queryClient.prefetchQuery(scheduleTodayWidget.getQuery());
    }
  }, []);
  return (
    <>
      <TitleManager />
      <WidgetEditor configuration={settings.widgetsConfiguration} />
    </>
  );
}
function WidgetEditor({
  configuration: initialConfiguration,
}: {
  configuration: WidgetsConfiguration;
}) {
  const updateSetting = useUpdateGenericUserSetting();

  const [isEditing, setIsEditing] = useState(false);
  const [configuration, setConfiguration] =
    useState<WidgetsConfiguration>(initialConfiguration);

  const [customizingWidget, setCustomizingWidget] =
    useState<WidgetGridItem | null>(null);
  const [dragState, setDragState] = useState<WidgetDragState>(initialDragState);
  const [activeWidget, setActiveWidget] = useState<
    (ResponsiveWidget & { isPreview?: boolean }) | null
  >(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const getIndex = (id: UniqueIdentifier) =>
    configuration.findIndex((w) => w.id === id);

  const autoScrollDirectionRef = React.useRef<0 | 1 | -1>(0);
  const autoScrollRafRef = React.useRef<number | null>(null);

  const gridColumns = useGridColumns();
  // Calculate responsive widgets with appropriate sizing
  const responsiveWidgets = useMemo(
    () => calculateResponsiveLayout(configuration, gridColumns),
    [configuration, gridColumns]
  );

  const stopAutoScroll = useCallback(() => {
    autoScrollDirectionRef.current = 0;
    if (autoScrollRafRef.current != null) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  // Window scrolling only (no container detection per request)

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleSave = async (providedConfiguration?: WidgetsConfiguration) => {
    if (!providedConfiguration) setIsEditing(false);
    await updateSetting.mutateAsync({
      key: "widgetsConfiguration",
      value: providedConfiguration ?? configuration,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setConfiguration(initialConfiguration);
  };

  const handleAddWidget = (type: Widgets, index = 0) => {
    const newWidget = getNewWidgetConfiguration(type);
    setConfiguration([
      ...configuration.slice(0, index),
      newWidget,
      ...configuration.slice(index),
    ]);
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

  const handleSaveCustomization = async (
    widgetId: string,
    customValues: any
  ) => {
    updateWidgetInConfiguration(widgetId, { custom: customValues });
    await handleSave(
      initialConfiguration.map((w) =>
        w.id === widgetId ? { ...w, custom: customValues } : w
      )
    );
    setCustomizingWidget(null);
  };

  const handleCancelCustomization = () => {
    setCustomizingWidget(null);
  };

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
  const changelog = useQuery(trpc.core.updates.getChangelog.queryOptions());
  return (
    <DndContext
      accessibility={{
        screenReaderInstructions,
      }}
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={({ active }) => {
        if (active) {
          const widget = active.data.current as DraggableElement;
          setActiveWidget({
            ...widget,
            isPreview: widget.elementType === "add-widget",
          });
        }
      }}
      onDragEnd={({ over, active }) => {
        setActiveWidget(null);

        if (over) {
          const overIndex = getIndex(over.id);
          if (active.data.current?.elementType === "add-widget") {
            handleAddWidget(
              active.data.current.type,
              over.data.current?.elementType === "drop-zone"
                ? configuration.length
                : overIndex
            );
            return;
          }
          const activeIndex = getIndex(active.id);
          if (activeIndex !== overIndex) {
            setConfiguration((items) =>
              arrayMove(items, activeIndex, overIndex)
            );
          }
        }
      }}
      onDragCancel={() => setActiveWidget(null)}
    >
      <div className="flex flex-col gap-4">
        {/* Editor Controls */}

        <PageHeading
          className={cn({
            "sticky sm:static top-0 bg-background -my-4 py-4 z-20": isEditing,
          })}
          rightContent={
            <div
              className={cn(
                "flex items-center rounded-lg sm:rounded-xl sm:gap-2",
                {
                  "border sm:border-none": isEditing,
                }
              )}
            >
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg sm:rounded-xl border-0 h-7 px-3 sm:h-9 hover:bg-transparent sm:hover:bg-accent sm:border"
                    onClick={handleCancel}
                    leftIcon={
                      <HugeiconsIcon
                        icon={Cancel01StrokeRounded}
                        className="size-4 sm:hidden"
                      />
                    }
                  >
                    <p className="hidden sm:block">Cancel</p>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      handleSave();
                    }}
                    className="rounded-lg sm:rounded-xl border-0 h-7 sm:h-9 sm:border"
                    leftIcon={<HugeiconsIcon icon={Tick02StrokeRounded} />}
                  >
                    <p className="hidden sm:block">Save</p>
                  </Button>
                </>
              ) : (
                <CustomizeButton onClick={handleStartEditing} />
              )}
            </div>
          }
        />

        <WidgetContext.Provider
          value={{
            isEditing,
            handleRemoveWidget,
            handleCustomizeWidget,
            handleResizeStart,

            gridColumns,
            dragState,
          }}
        >
          {/* Widget Palette */}
          {isEditing && (
            <>
              <Card>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-medium">Widgets</h3>
                    <p className="text-sm text-muted-foreground">
                      Click or start dragging to add new widgets.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(Widgets).map((widgetType) => (
                      <AddWidgetButton
                        key={`${widgetType}-${configuration.length}`}
                        type={widgetType}
                        onClick={() => handleAddWidget(widgetType)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
              {createPortal(
                <DragOverlay
                  className={
                    activeWidget?.isPreview
                      ? "flex justify-center w-[calc(100vw-1rem*2)]! sm:max-w-[clamp(300px,100%,600px)]"
                      : undefined
                  }
                >
                  {activeWidget
                    ? renderWidget({
                        entry: activeWidget,
                        index: 0,
                        isEditing,
                        isOverlay: true,
                      })
                    : null}
                </DragOverlay>,
                document.body
              )}
            </>
          )}
          {/* Responsive Widget Grid */}
          {configuration.length > 0 ? (
            <SortableContext
              disabled={!isEditing}
              items={responsiveWidgets}
              strategy={rectSortingStrategy}
            >
              <WidgetsGrid gridColumns={gridColumns}>
                {changelog.data && !isEditing && (
                  <ChangelogCard {...changelog.data} />
                )}
                {responsiveWidgets.map((entry, index) =>
                  renderWidget({ entry, index, isEditing })
                )}

                {/* Drop zone for adding at the end */}
                {isEditing && <DropZone />}

                <CustomizationModal
                  widget={customizingWidget}
                  onSaveCustomization={handleSaveCustomization}
                  onClose={handleCancelCustomization}
                />
              </WidgetsGrid>
            </SortableContext>
          ) : (
            <ErrorCard emoji="📊">No widgets added yet</ErrorCard>
          )}
        </WidgetContext.Provider>
      </div>
    </DndContext>
  );
}
function renderWidget({
  entry,
  index,
  isEditing,

  isOverlay,
}: {
  entry: ResponsiveWidget;
  index: number;
  isEditing: boolean;

  isOverlay?: boolean;
}) {
  const widgetExport = WIDGET_COMPONENTS[entry.type];

  const WidgetComponent = widgetExport.component;

  return (
    <WidgetComponent
      key={entry.id}
      {...entry}
      isEditing={isEditing}
      index={index}
      isOverlay={isOverlay}
    />
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
            <HugeiconsIcon
              icon={SlidersHorizontalStrokeRounded}
              className="size-4"
            />
            Customize
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="flex flex-col gap-4">
          {isCustomizable &&
            widgetExport.getCustomizationContent(
              {
                ...WIDGET_CUSTOM_DEFAULTS[widget!.type],
                ...widget!.custom,
              },
              (values) => onSaveCustomization(widget!.id, values)
            )}
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
function WidgetsGrid({
  className,
  gridColumns,
  ...props
}: React.ComponentProps<"div"> & { gridColumns?: number }) {
  return (
    <div
      className={cn(
        "grid gap-4 auto-rows-min grid-flow-dense grid-cols-[repeat(var(--grid-columns),1fr)]",
        className
      )}
      style={
        {
          "--grid-columns": gridColumns,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

function CustomizeButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "rounded-lg sm:rounded-xl px-0 size-7 sm:h-9 sm:w-fit sm:px-3",
        className
      )}
      leftIcon={<HugeiconsIcon icon={DashboardSquareEditStrokeRounded} />}
      {...props}
    >
      <p className="hidden sm:block">Customize</p>
    </Button>
  );
}
function useGridColumns() {
  const [gridColumns, setGridColumns] = useState(4);
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
  return gridColumns;
}
type DraggableElement = ResponsiveWidget & {
  elementType: "add-widget" | "widget";
};
function AddWidgetButton({
  type,
  onClick,
}: {
  type: Widgets;
  onClick: () => void;
}) {
  const newWidget = useMemo(() => getNewWidgetConfiguration(type), [type]);

  const { setNodeRef, attributes, listeners } = useDraggable({
    id: newWidget.id,
    data: {
      elementType: "add-widget",
      ...newWidget,
    },
  });
  return (
    <Button
      key={type}
      ref={setNodeRef}
      variant="outline"
      size="sm"
      onClick={onClick}
      className="flex items-center pr-0 h-fit gap-0"
    >
      <HugeiconsIcon
        icon={PlusSignStrokeRounded}
        className="mr-2 text-muted-foreground"
      />
      {WIDGET_NAMES[type]}{" "}
      <div
        className="pr-3 pl-2 py-2 cursor-grab"
        {...attributes}
        {...listeners}
      >
        <GripIcon className="size-4 text-muted-foreground" />
      </div>
    </Button>
  );
}
function DropZone() {
  const { setNodeRef, isOver } = useDroppable({
    id: "drop-zone",
    data: {
      elementType: "drop-zone",
    },
  });
  return (
    <div ref={setNodeRef} className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "text-muted-foreground min-h-[120px] sm:min-h-[200px] w-full flex-1 border border-dashed border-muted-foreground/25 rounded-xl flex flex-col gap-3 items-center justify-center text-sm transition-all",
          {
            "border-brand text-brand": isOver,
          }
        )}
      >
        <HugeiconsIcon icon={PlusSignStrokeRounded} className="size-6" />
        <p className="text-sm">Drop new widgets here</p>
      </div>
      <p className="text-xs invisible">Dummy title for the drop zone</p>
    </div>
  );
}
