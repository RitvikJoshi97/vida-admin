"use client";

import { Fit } from "@rive-app/react-canvas";
import RiveCharacter from "@/components/RiveCharacter";

type LoaderViewProps = {
  className?: string;
  textClassName?: string;
  state?: string;
  text?: string;
};

export default function LoaderView({
  className,
  textClassName,
  state = "deep_breath_page",
  text = "let's take a deep breath while we log you in",
}: LoaderViewProps) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-6 ${className ?? ""}`}
    >
      <div className="relative aspect-square w-[70vw] max-w-[360px] overflow-hidden md:w-[360px] lg:w-[400px]">
        <RiveCharacter
          state={state}
          fit={Fit.Cover}
          className="h-full w-full"
        />
      </div>
      <p
        className={`max-w-sm text-center text-base font-medium text-white ${textClassName ?? ""}`}
      >
        {text}
      </p>
    </div>
  );
}
