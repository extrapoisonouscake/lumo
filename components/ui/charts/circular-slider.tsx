//Author: https://github.com/mnkhouri/react-circular-slider
import * as React from "react";
type Renderer = ({
  position,
}: {
  position: { x: number; y: number };
}) => React.ReactNode;
type Props = {
  size: number;
  trackWidth: number;
  minValue: number;
  maxValue: number;
  startAngle: number; // 0 - 360 degrees
  endAngle: number; // 0 - 360 degrees
  angleType: AngleDescription;
  handleSize: number;
  handleRenderer?: Renderer;
  secondaryHandleRenderer?: Renderer;
  handle1: {
    value: number;
    onChange?: (value: number) => void;
    color?: string;
  };
  handle2?: {
    value: number;
    color?: string;
  };
  onControlFinished?: () => void;
  disabled?: boolean;
  arcColor: string;
  arcBackgroundColor: string;
  coerceToInt?: boolean;
  outerShadow?: boolean;
  arcBackgroundClassName?: string;
};

export class CircularSlider extends React.Component<
  React.PropsWithChildren<Props>
> {
  static defaultProps: Pick<
    Props,
    | "size"
    | "trackWidth"
    | "minValue"
    | "maxValue"
    | "startAngle"
    | "endAngle"
    | "angleType"
    | "arcBackgroundColor"
    | "handleSize"
  > = {
    size: 200,
    trackWidth: 4,
    minValue: 0,
    maxValue: 100,
    startAngle: 0,
    endAngle: 360,
    angleType: {
      direction: "cw",
      axis: "-y",
    },
    handleSize: 8,
    arcBackgroundColor: "#aaa",
  };
  svgRef = React.createRef<SVGSVGElement>();

  onMouseEnter = (ev: React.MouseEvent<SVGSVGElement>) => {
    if (ev.buttons === 1) {
      // The left mouse button is pressed, act as though user clicked us
      this.onMouseDown(ev);
    }
  };

  onMouseDown = (ev: React.MouseEvent<SVGSVGElement>) => {
    const svgRef = this.svgRef.current;
    if (svgRef) {
      svgRef.addEventListener("mousemove", this.handleMousePosition);
      svgRef.addEventListener("mouseleave", this.removeMouseListeners);
      svgRef.addEventListener("mouseup", this.removeMouseListeners);
    }
    this.handleMousePosition(ev);
  };

  removeMouseListeners = () => {
    const svgRef = this.svgRef.current;
    if (svgRef) {
      svgRef.removeEventListener("mousemove", this.handleMousePosition);
      svgRef.removeEventListener("mouseleave", this.removeMouseListeners);
      svgRef.removeEventListener("mouseup", this.removeMouseListeners);
    }
    if (this.props.onControlFinished) {
      this.props.onControlFinished();
    }
  };

  handleMousePosition = (ev: React.MouseEvent<SVGSVGElement> | MouseEvent) => {
    const x = ev.clientX;
    const y = ev.clientY;
    this.processSelection(x, y);
  };

  onTouch = (ev: React.TouchEvent<SVGSVGElement>) => {
    /* This is a very simplistic touch handler. Some optimzations might be:
        - Right now, the bounding box for a touch is the entire element. Having the bounding box
          for touched be circular at a fixed distance around the slider would be more intuitive.
        - Similarly, don't set `touchAction: 'none'` in CSS. Instead, call `ev.preventDefault()`
          only when the touch is within X distance from the slider
    */

    // This simple touch handler can't handle multiple touches. Therefore, bail if there are either:
    // - more than 1 touches currently active
    // - a touchEnd event, but there is still another touch active
    if (
      ev.touches.length > 1 ||
      (ev.type === "touchend" && ev.touches.length > 0)
    ) {
      return;
    }

    // Process the new position
    const touch = ev.changedTouches[0];
    if (!touch) {
      return;
    }
    const x = touch.clientX;
    const y = touch.clientY;
    this.processSelection(x, y);

    // If the touch is ending, fire onControlFinished
    if (ev.type === "touchend" || ev.type === "touchcancel") {
      if (this.props.onControlFinished) {
        this.props.onControlFinished();
      }
    }
  };

  processSelection = (x: number, y: number) => {
    const {
      size,
      maxValue,
      minValue,
      angleType,
      startAngle,
      endAngle,
      handle1,
      disabled,
      handle2,
      coerceToInt,
    } = this.props;
    if (!handle1.onChange) {
      // Read-only, don't bother doing calculations
      return;
    }
    const svgRef = this.svgRef.current;
    if (!svgRef) {
      return;
    }
    // Find the coordinates with respect to the SVG
    const svgPoint = svgRef.createSVGPoint();
    svgPoint.x = x;
    svgPoint.y = y;
    const coordsInSvg = svgPoint.matrixTransform(
      svgRef.getScreenCTM()?.inverse()
    );

    const angle = positionToAngle(coordsInSvg, size, angleType);
    let value = angleToValue({
      angle,
      minValue,
      maxValue,
      startAngle,
      endAngle,
    });
    if (coerceToInt) {
      value = Math.round(value);
    }

    if (!disabled) {
      handle1.onChange(value);
    }
  };

  render() {
    const {
      size,
      trackWidth,
      handle1,
      handle2,
      handleSize,
      handleRenderer,
      secondaryHandleRenderer,
      maxValue,
      minValue,
      startAngle,
      endAngle,
      angleType,
      disabled,
      arcColor,
      arcBackgroundColor,
      outerShadow,
      arcBackgroundClassName,
    } = this.props;
    const shadowWidth = 20;
    const trackInnerRadius = size / 2 - trackWidth - shadowWidth;
    const handle1Angle = valueToAngle({
      value: handle1.value,
      minValue,
      maxValue,
      startAngle,
      endAngle,
    });
    const handle2Angle =
      handle2 &&
      valueToAngle({
        value: handle2.value,
        minValue,
        maxValue,
        startAngle,
        endAngle,
      });
    const handle1Position = angleToPosition(
      { degree: handle1Angle, ...angleType },
      trackInnerRadius + trackWidth / 2,
      size
    );
    const handle2Position =
      handle2Angle &&
      angleToPosition(
        { degree: handle2Angle, ...angleType },
        trackInnerRadius + trackWidth / 2,
        size
      );

    const controllable = !disabled && Boolean(handle1.onChange);

    return (
      <svg
        width={size}
        height={size}
        ref={this.svgRef}
        onMouseDown={this.onMouseDown}
        onMouseEnter={this.onMouseEnter}
        onClick={
          /* TODO: be smarter about this -- for example, we could run this through our
          calculation and determine how close we are to the arc, and use that to decide
          if we propagate the click. */
          (ev) => controllable && ev.stopPropagation()
        }
        onTouchStart={this.onTouch}
        onTouchEnd={this.onTouch}
        onTouchMove={this.onTouch}
        onTouchCancel={this.onTouch}
        style={{ touchAction: "none" }}
      >
        {
          /* Shadow */
          outerShadow && (
            <React.Fragment>
              <radialGradient id="outerShadow">
                <stop offset="90%" stopColor={arcColor} />
                <stop offset="100%" stopColor="white" />
              </radialGradient>

              <circle
                fill="none"
                stroke="url(#outerShadow)"
                cx={size / 2}
                cy={size / 2}
                // Subtract an extra pixel to ensure there's never any gap between slider and shadow
                r={trackInnerRadius + trackWidth + shadowWidth / 2 - 1}
                strokeWidth={shadowWidth}
              />
            </React.Fragment>
          )
        }

        {/* Arc Background  */}
        <path
          d={arcPathWithRoundedEnds({
            startAngle: handle1Angle,
            endAngle,
            angleType,
            innerRadius: trackInnerRadius,
            thickness: trackWidth,
            svgSize: size,
            direction: angleType.direction,
          })}
          fill={arcBackgroundColor}
          className={arcBackgroundClassName}
        />
        {/* Arc (render after background so it overlays it) */}
        <path
          d={arcPathWithRoundedEnds({
            startAngle,
            endAngle: handle1Angle,
            angleType,
            innerRadius: trackInnerRadius,
            thickness: trackWidth,
            svgSize: size,
            direction: angleType.direction,
          })}
          fill={arcColor}
        />
        {
          /* Handle 2 */
          handle2Position && secondaryHandleRenderer && (
            <React.Fragment>
              {secondaryHandleRenderer({ position: handle2Position })}
            </React.Fragment>
          )
        }
        {
          /* Handle 1 */
          controllable && handleRenderer ? (
            handleRenderer({ position: handle1Position })
          ) : (
            <React.Fragment>
              <filter
                id="handleShadow"
                x="-50%"
                y="-50%"
                width="16"
                height="16"
              >
                <feOffset result="offOut" in="SourceGraphic" dx="0" dy="0" />
                <feColorMatrix
                  result="matrixOut"
                  in="offOut"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"
                />
                <feGaussianBlur
                  result="blurOut"
                  in="matrixOut"
                  stdDeviation="5"
                />
                <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
              </filter>
              <circle
                r={handleSize}
                cx={handle1Position.x}
                cy={handle1Position.y}
                fill={handle1.color ?? "#ffffff"}
                filter="url(#handleShadow)"
                className="cursor-move"
              />
            </React.Fragment>
          )
        }
      </svg>
    );
  }
}

export default CircularSlider;

export function angleToValue(params: {
  angle: number;
  minValue: number;
  maxValue: number;
  startAngle: number;
  endAngle: number;
}) {
  const { angle, minValue, maxValue, startAngle, endAngle } = params;
  if (endAngle <= startAngle) {
    // math assumes endAngle > startAngle
    throw new Error("endAngle must be greater than startAngle");
  }

  if (angle < startAngle) {
    return minValue;
  } else if (angle > endAngle) {
    return maxValue;
  } else {
    const ratio = (angle - startAngle) / (endAngle - startAngle);
    const value = ratio * (maxValue - minValue) + minValue;
    return value;
  }
}

export function valueToAngle(params: {
  value: number;
  minValue: number;
  maxValue: number;
  startAngle: number;
  endAngle: number;
}) {
  const { value, minValue, maxValue, startAngle, endAngle } = params;
  if (endAngle <= startAngle) {
    // math assumes endAngle > startAngle
    throw new Error("endAngle must be greater than startAngle");
  }
  const ratio = (value - minValue) / (maxValue - minValue);
  const angle = ratio * (endAngle - startAngle) + startAngle;
  return angle;
}

export type AngleDescription = {
  direction: "cw" | "ccw";
  axis: "+x" | "-x" | "+y" | "-y";
};

export type AngleWithDescription = {
  degree: number;
} & AngleDescription;

function convertAngle(
  degree: number,
  from: AngleDescription,
  to?: AngleDescription
) {
  to = to || { direction: "ccw", axis: "+x" };

  if (from.direction !== to.direction) {
    degree = degree === 0 ? 0 : 360 - degree;
  }

  if (from.axis === to.axis) {
    // e.g. +x to +x
    return degree;
  }

  if (from.axis[1] === to.axis[1]) {
    // e.g. +x to -x
    return (180 + degree) % 360;
  }

  switch (to.direction + from.axis + to.axis) {
    case "ccw+x-y":
    case "ccw-x+y":
    case "ccw+y+x":
    case "ccw-y-x":
    case "cw+y-x":
    case "cw-y+x":
    case "cw-x-y":
    case "cw+x+y":
      return (90 + degree) % 360;
    case "ccw+y-x":
    case "ccw-y+x":
    case "ccw+x+y":
    case "ccw-x-y":
    case "cw+x-y":
    case "cw-x+y":
    case "cw+y+x":
    case "cw-y-x":
      return (270 + degree) % 360;
    default:
      // This is impossible, just for TS
      throw new Error("Unhandled conversion");
  }
}

export function angleToPosition(
  angle: AngleWithDescription,
  radius: number,
  svgSize: number
) {
  // js functions need radians, counterclockwise from positive x axis
  const angleConverted = convertAngle(angle.degree, angle, {
    direction: "ccw",
    axis: "+x",
  });
  const angleInRad = (angleConverted / 180) * Math.PI;
  let dX: number;
  let dY: number;

  if (angleInRad <= Math.PI) {
    // we are in the upper two quadrants
    if (angleInRad <= Math.PI / 2) {
      dY = Math.sin(angleInRad) * radius;
      dX = Math.cos(angleInRad) * radius;
    } else {
      dY = Math.sin(Math.PI - angleInRad) * radius;
      dX = Math.cos(Math.PI - angleInRad) * radius * -1;
    }
  } else {
    // we are in the lower two quadrants
    if (angleInRad <= Math.PI * 1.5) {
      dY = Math.sin(angleInRad - Math.PI) * radius * -1;
      dX = Math.cos(angleInRad - Math.PI) * radius * -1;
    } else {
      dY = Math.sin(2 * Math.PI - angleInRad) * radius * -1;
      dX = Math.cos(2 * Math.PI - angleInRad) * radius;
    }
  }

  // dX and dY are calculated based on having (0, 0) at the center
  // Now, translate dX and dY to svg coordinates, where (0, 0) is at the top left
  const x = dX + svgSize / 2;
  const y = svgSize / 2 - dY;

  return { x, y };
}

export function positionToAngle(
  position: { x: number; y: number },
  svgSize: number,
  angleType: AngleDescription
) {
  const dX = position.x - svgSize / 2;
  const dY = svgSize / 2 - position.y; // position.y increases downwards in svg
  let theta = Math.atan2(dY, dX); // radians, counterclockwise from positive x axis
  if (theta < 0) {
    theta = theta + 2 * Math.PI;
  }
  const degree = (theta / Math.PI) * 180; // degrees, counterclockwise from positive x axis
  return convertAngle(
    degree,
    {
      direction: "ccw",
      axis: "+x",
    },
    angleType
  );
}

export function semiCircle(opts: {
  startAngle: number;
  endAngle: number;
  angleType: AngleDescription;
  radius: number;
  svgSize: number;
  direction: "cw" | "ccw";
}) {
  const { startAngle, endAngle, radius, svgSize, direction, angleType } = opts;
  const startPosition = angleToPosition(
    { degree: startAngle, ...angleType },
    radius,
    svgSize
  );
  const endPosition = angleToPosition(
    { degree: endAngle, ...angleType },
    radius,
    svgSize
  );
  return `
	  M ${svgSize / 2},${svgSize / 2}
	  L ${startPosition.x},${startPosition.y}
	  A ${radius} ${radius} 0 ${direction === "cw" ? "1 1" : "0 0"}
		${endPosition.x} ${endPosition.y}
	  Z
	`;
}

function getStartAndEndPosition(opts: {
  startAngle: number;
  endAngle: number;
  angleType: AngleDescription;
  radius: number;
  svgSize: number;
}) {
  const { startAngle, endAngle, radius, svgSize, angleType } = opts;

  let isCircle = false;
  if (startAngle !== endAngle && startAngle % 360 === endAngle % 360) {
    // if it's a full circle, we can't naively draw an arc...
    // https://stackoverflow.com/questions/5737975/circle-drawing-with-svgs-arc-path
    isCircle = true;
  }

  const startPosition = angleToPosition(
    { degree: startAngle, ...angleType },
    radius,
    svgSize
  );
  const endPosition = angleToPosition(
    { degree: isCircle ? endAngle - 0.001 : endAngle, ...angleType },
    radius,
    svgSize
  );

  return { startPosition, endPosition, isCircle };
}

export function pieShapedPath(opts: {
  startAngle: number;
  endAngle: number;
  angleType: AngleDescription;
  radius: number;
  svgSize: number;
  direction: "cw" | "ccw";
}) {
  const { radius, svgSize, direction } = opts;
  const { startPosition, endPosition } = getStartAndEndPosition(opts);
  return `
    M ${svgSize / 2},${svgSize / 2}
    L ${startPosition.x},${startPosition.y}
    A ${radius} ${radius} 0 ${direction === "cw" ? "1 1" : "0 0"}
      ${endPosition.x} ${endPosition.y}
    Z
  `;
}

export function arcShapedPath(opts: {
  startAngle: number;
  endAngle: number;
  angleType: AngleDescription;
  radius: number;
  svgSize: number;
  direction: "cw" | "ccw";
}) {
  const { startAngle, endAngle, radius, direction } = opts;
  const { startPosition, endPosition, isCircle } = getStartAndEndPosition(opts);

  const largeArc = endAngle - startAngle >= 180;

  return `
      M ${startPosition.x},${startPosition.y}
      A ${radius} ${radius} 0
        ${largeArc ? "1" : "0"}
        ${direction === "cw" ? "1" : "0"}
        ${endPosition.x} ${endPosition.y}
        ${isCircle ? "Z" : ""}
    `;
}

export function arcPathWithRoundedEnds(opts: {
  startAngle: number;
  endAngle: number;
  angleType: AngleDescription;
  innerRadius: number;
  thickness: number;
  svgSize: number;
  direction: "cw" | "ccw";
}) {
  const { startAngle, innerRadius, thickness, direction, angleType, svgSize } =
    opts;
  let { endAngle } = opts;

  if (startAngle % 360 === endAngle % 360 && startAngle !== endAngle) {
    // Drawing a full circle, slightly offset end angle
    // https://stackoverflow.com/questions/5737975/circle-drawing-with-svgs-arc-path
    endAngle = endAngle - 0.001;
  }
  const largeArc = endAngle - startAngle >= 180;
  const outerRadius = innerRadius + thickness;

  const innerArcStart = angleToPosition(
    { degree: startAngle, ...angleType },
    innerRadius,
    svgSize
  );
  const startPoint = `
    M ${innerArcStart.x},${innerArcStart.y}
  `;

  const innerArcEnd = angleToPosition(
    { degree: endAngle, ...angleType },
    innerRadius,
    svgSize
  );
  const innerArc = `
    A ${innerRadius} ${innerRadius} 0
      ${largeArc ? "1" : "0"}
      ${direction === "cw" ? "1" : "0"}
      ${innerArcEnd.x} ${innerArcEnd.y}
  `;

  const outerArcStart = angleToPosition(
    { degree: endAngle, ...angleType },
    outerRadius,
    svgSize
  );
  const firstButt = `
    A ${thickness / 2} ${thickness / 2} 0
      ${largeArc ? "1" : "0"}
      ${direction === "cw" ? "0" : "1"}
      ${outerArcStart.x} ${outerArcStart.y}
  `;

  const outerArcEnd = angleToPosition(
    { degree: startAngle, ...angleType },
    outerRadius,
    svgSize
  );
  const outerArc = `
    A ${outerRadius} ${outerRadius} 0
      ${largeArc ? "1" : "0"}
      ${direction === "cw" ? "0" : "1"}
      ${outerArcEnd.x} ${outerArcEnd.y}
  `;

  const secondButt = `
    A ${thickness / 2} ${thickness / 2} 0
      ${largeArc ? "1" : "0"}
      ${direction === "cw" ? "0" : "1"}
      ${innerArcStart.x} ${innerArcStart.y}
  `;

  return startPoint + innerArc + firstButt + outerArc + secondButt + " Z";
}
