import { ErrorCard, ErrorCardProps } from "@/components/misc/error-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WIDGET_MAX_DIMENSIONS } from "@/constants/core";
import { cn } from "@/helpers/cn";
import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Delete02StrokeRounded,
  DragDropVerticalStrokeRounded,
  SlidersHorizontalStrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";

import { useContext } from "react";
import {
  isCustomizableWidget,
  WIDGET_COMPONENTS,
  WIDGET_NAMES,
  WidgetComponentProps,
} from "./helpers";
import { WidgetContext } from "./page";
const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });
export function Widget({
  isEditing,
  isOverlay,
  className,
  contentClassName,
  containerClassName,
  index,
  children,
  richError,
  ...data
}: WidgetComponentProps & {
  children: React.ReactNode;
  contentClassName?: string;
}) {
  const {
    dragState,
    gridColumns,
    handleCustomizeWidget,
    handleRemoveWidget,
    handleResizeStart,
  } = useContext(WidgetContext);
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver,
    over,
  } = useSortable({
    id: data.id,
    data: { ...data, elementType: "widget" },
    animateLayoutChanges,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  const widgetExport = WIDGET_COMPONENTS[data.type];

  const isCustomizable = isCustomizableWidget(widgetExport);

  const isBeingResized =
    dragState.isDragging &&
    dragState.widgetId === data.id &&
    dragState.dragType === "resize";
  const maxDimension = WIDGET_MAX_DIMENSIONS[data.type];

  return (
    <div
      className={cn(
        "group size-full flex flex-col gap-2 items-center relative transition-all",
        {
          "z-10 opacity-30": isDragging,
          "scale-[0.98]": isOver,
        },
        containerClassName
      )}
      ref={setNodeRef}
      style={{
        gridColumn: `span ${Math.min(data.width, gridColumns)}`,
        gridRow: `span ${data.height}`,
        minHeight: gridColumns === 1 ? "auto" : `${data.height * 200}px`,
        minWidth: 0, // Prevents grid item from growing beyond its column}}
        ...style,
      }}
    >
      {isEditing && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 justify-between">
          <div className="flex items-center gap-1">
            {isCustomizable && (
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleCustomizeWidget(data)}
                className="size-7 rounded-lg bg-background backdrop-blur-xs"
              >
                <HugeiconsIcon
                  icon={SlidersHorizontalStrokeRounded}
                  className="size-[14px]!"
                />
              </Button>
            )}
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                handleRemoveWidget(data.id);
              }}
              className="size-7 rounded-lg bg-background backdrop-blur-xs text-red-600 hover:text-red-700"
            >
              <HugeiconsIcon
                icon={Delete02StrokeRounded}
                className="size-[14px]!"
              />
            </Button>
          </div>
          <Button
            size="icon"
            variant="outline"
            className="cursor-move size-7 rounded-lg bg-background backdrop-blur-xs"
            {...attributes}
            {...listeners}
          >
            <HugeiconsIcon
              icon={DragDropVerticalStrokeRounded}
              className="text-muted-foreground"
            />
          </Button>
        </div>
      )}
      <Card
        data-widget-index={index}
        className={cn(
          "flex-1 w-full sm:min-h-[200px] cursor-auto relative",
          { "shadow-sm!": isBeingResized },
          className
        )}
        style={{
          transition: isBeingResized ? "none" : "all 0.2s ease",
        }}
      >
        {isEditing &&
          !isOverlay &&
          (maxDimension.height > 1 || maxDimension.width > 1) && (
            <div
              className="absolute -bottom-1.5 -right-1.5 z-10 pl-2 pt-2 hidden sm:flex justify-end items-end cursor-se-resize"
              style={{
                borderTopLeftRadius: "100%",
              }}
              onMouseDown={(e) => handleResizeStart(e, data.id)}
              onTouchStart={(e) => handleResizeStart(e, data.id)}
            >
              <div className="size-3 rounded-br-full border-r-2 border-b-2 border-primary" />
            </div>
          )}

        {/* Widget Content */}
        <CardContent
          className={cn(
            "relative flex-1 flex flex-col pt-4",
            {
              "pointer-events-none": isEditing,
            },
            contentClassName
          )}
        >
          {richError ? <WidgetErrorCard {...richError} /> : children}
        </CardContent>
      </Card>

      <p
        className={cn("text-xs font-medium transition-opacity opacity-100", {
          "opacity-0": isOverlay || isDragging,
        })}
      >
        {WIDGET_NAMES[data.type]}
      </p>
    </div>
  );
}
export function WidgetErrorCard({ className, ...props }: ErrorCardProps) {
  return (
    <ErrorCard
      variant="ghost"
      size="sm"
      isTightText
      {...props}
      className={cn("flex-1 p-0", className)}
    />
  );
}
