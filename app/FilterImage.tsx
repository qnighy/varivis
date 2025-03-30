import { ReactElement, useEffect, useRef } from "react";
import { ColorDeficiencySimulation } from "./state";
import { FilterCanvas, FilterCanvasHandle } from "./FilterCanvas";

export type FilterImageProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  colorDeficiencySimulation: ColorDeficiencySimulation;
  unitLength: number;
};

export function FilterImage(props: FilterImageProps): ReactElement | null {
  const { src, alt, width, height, className, style, colorDeficiencySimulation, unitLength } = props;
  const img = useRef<HTMLImageElement | null>(null);
  const canvas = useRef<FilterCanvasHandle>(null);

  useEffect(() => {
    img.current ??= new Image();
    img.current.src = src;
    img.current.alt = alt ?? "";
    img.current.width = width ?? 0;
    img.current.height = height ?? 0;

    const onLoad = () => {
      if (canvas.current && img.current?.complete) {
        canvas.current.update(img.current);
      }
    };

    if (img.current.complete) {
      onLoad();
    }
    img.current.addEventListener("load", onLoad);
    return () => {
      img.current?.removeEventListener("load", onLoad);
    }
  }, [src, alt, width, height]);

  useEffect(() => {
    if (canvas.current && img.current?.complete) {
      canvas.current.update(img.current);
    }
  }, [canvas, img]);

  return (
    <FilterCanvas
      ref={canvas}
      className={className}
      style={style}
      colorDeficiencySimulation={colorDeficiencySimulation}
      unitLength={unitLength}
    />
  )
}
