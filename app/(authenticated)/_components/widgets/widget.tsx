import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/helpers/cn";
import { GripVerticalIcon, Settings2Icon, TrashIcon } from "lucide-react";
import { useContext } from "react";
import {
  isCustomizableWidget,
  WIDGET_COMPONENTS,
  WIDGET_NAMES,
  WidgetComponentProps,
} from ".";
import { WidgetContext } from "./widget-editor";

export function Widget({
  isEditing,
  index,
  children,
  ...data
}: WidgetComponentProps & {
  children: React.ReactNode;
}) {
  const {
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleRemoveWidget,
    handleDrop,
    handleResizeStart,
    handleCustomizeWidget,
    handleDragEnd,
    gridColumns,
    dragState,
  } = useContext(WidgetContext);
  const widgetExport = WIDGET_COMPONENTS[data.type];

  const isCustomizable = isCustomizableWidget(widgetExport);

  const isBeingResized =
    dragState.isDragging &&
    dragState.widgetId === data.id &&
    dragState.dragType === "resize";
  console.log({ gridColumns });
  return (
    <Card
      draggable={isEditing}
      onDragStart={(e) => handleDragStart(e, index)}
      onDragOver={(e) => handleDragOver(e, index)}
      onDrop={(e) => handleDrop(e, index)}
      onDragEnd={handleDragEnd}
      className={cn(
        "relative group h-full transition-transform ",
        { "!shadow-sm": isBeingResized },
        { "cursor-move": isEditing },
        { "-translate-y-1": dragOverIndex === index }
      )}
      style={{
        gridColumn: `span ${Math.min(data.width, gridColumns)}`,
        gridRow: `span ${data.height}`,
        minHeight: gridColumns === 1 ? "auto" : `${data.height * 200}px`,
        transition: isBeingResized ? "none" : "all 0.2s ease",
      }}
    >
      {/* Widget Header */}
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-medium">
          {WIDGET_NAMES[data.type]}
        </CardTitle>
      </CardHeader>

      {/* Control Buttons */}
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
            onClick={() => handleRemoveWidget(data.id)}
            className="size-6 rounded bg-background backdrop-blur-sm text-red-600 hover:text-red-700"
          >
            <TrashIcon className="!size-[14px]" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="cursor-move size-6 rounded bg-background backdrop-blur-sm"
          >
            <GripVerticalIcon className="size-3 text-muted-foreground" />
          </Button>
        </div>
      )}

      {/* Resize Handle */}
      {isEditing && (
        <div
          className="absolute -bottom-1.5 -right-1.5 z-10 pl-2 pt-2 flex justify-end items-end cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
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
        className={cn("pt-0 relative flex-1", {
          "pointer-events-none": isEditing,
        })}
      >
        {children}
      </CardContent>
    </Card>
  );
}
