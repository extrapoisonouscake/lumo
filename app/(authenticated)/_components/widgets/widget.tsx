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
import { GripVerticalIcon, Settings2Icon, TrashIcon } from "lucide-react";
import { useContext } from "react";
import {
  isCustomizableWidget,
  WIDGET_COMPONENTS,
  WIDGET_NAMES,
  WidgetComponentProps,
} from ".";
import { WidgetContext } from "./widget-editor";
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
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          {isCustomizable && (
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleCustomizeWidget(data)}
              className="size-6 rounded bg-background backdrop-blur-sm"
            >
              <Settings2Icon className="!size-[14px]" />
            </Button>
          )}
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              handleRemoveWidget(data.id);
            }}
            className="size-6 rounded bg-background backdrop-blur-sm text-red-600 hover:text-red-700"
          >
            <TrashIcon className="!size-[14px]" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="cursor-move size-6 rounded bg-background backdrop-blur-sm"
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="size-3 text-muted-foreground" />
          </Button>
        </div>
      )}
      <Card
        data-widget-index={index}
        {...attributes}
        {...listeners}
        className={cn(
          "flex-1 w-full sm:min-h-[200px] cursor-auto relative",
          { "!shadow-sm": isBeingResized },

          {
            "cursor-move": isEditing,
          },
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
      {...props}
      className={cn("flex-1 p-0", className)}
    />
  );
}
