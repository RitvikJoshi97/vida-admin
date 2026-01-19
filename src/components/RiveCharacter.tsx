"use client";

import { useCallback, useEffect, useState } from "react";
import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";

type RiveCharacterProps = {
  state: string;
  className?: string;
  artboard?: string;
  fit?: Fit;
  alignment?: Alignment;
};

const STATE_MACHINE_NAME = "charStateMachine";
const VIEW_MODEL_NAME = "ViewModel1";
const VIEW_MODEL_ENUM_INPUTS = ["enumProperty", "PageEnum"];
const DEFAULT_ARTBOARD = "vitrueCharacter";
const STATE_TO_ANIMATION: Record<string, string> = {
  hello_page: "Hello",
  deep_breath_page: "DeepBreath",
  chilling_page: "Chiling",
};

type RiveViewModelInput = {
  name?: string;
  value?: unknown;
  values?: string[];
  enumValues?: string[];
};

export default function RiveCharacter({
  state,
  className,
  artboard = DEFAULT_ARTBOARD,
  fit = Fit.Contain,
  alignment = Alignment.Center,
}: RiveCharacterProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const applyViewModelValue = useCallback(
    (riveInstance: unknown, nextState: string) => {
      const viewModel = (
        riveInstance as {
          viewModelByName?: (name: string) => {
            instance?: () => {
              input?: (name: string) => RiveViewModelInput | undefined;
              enum?: (name: string) => RiveViewModelInput | undefined;
              inputs?: RiveViewModelInput[];
            };
            input?: (name: string) => RiveViewModelInput | undefined;
            enum?: (name: string) => RiveViewModelInput | undefined;
            inputs?: RiveViewModelInput[];
          };
        }
      )?.viewModelByName?.(VIEW_MODEL_NAME);

      if (!viewModel) {
        return false;
      }

      const viewModelInstance = viewModel.instance?.();
      let viewModelInput: RiveViewModelInput | undefined;
      for (const name of VIEW_MODEL_ENUM_INPUTS) {
        viewModelInput =
          viewModelInstance?.input?.(name) ??
          viewModelInstance?.enum?.(name) ??
          viewModelInstance?.inputs?.find((input) => input.name === name) ??
          viewModel.input?.(name) ??
          viewModel.enum?.(name) ??
          viewModel.inputs?.find((input) => input.name === name);
        if (viewModelInput) {
          break;
        }
      }

      if (!viewModelInput) {
        return false;
      }

      viewModelInput.value = nextState;

      return true;
    },
    [],
  );

  const riveConfig = {
    src: "/vitrue_character.riv",
    stateMachines: [STATE_MACHINE_NAME],
    autoplay: true,
    layout: new Layout({
      fit,
      alignment,
    }),
    onLoad: () => {
      setIsLoaded(true);
    },
    ...(artboard ? { artboard } : {}),
  };

  const { rive, RiveComponent } = useRive(riveConfig);

  useEffect(() => {
    if (rive && isLoaded) {
      try {
        rive.play(STATE_MACHINE_NAME);
      } catch (error) {
        console.warn("[Rive] unable to play state machine", error);
      }
      const riveAny = rive as unknown as {
        contents?: {
          artboardNames?: string[];
          stateMachineNames?: string[];
          animationNames?: string[];
        };
        stateMachineNames?: string[];
        animationNames?: string[];
      };
      let viewModelInputs: unknown = [];
      try {
        const viewModel = (
          rive as unknown as {
            viewModelByName?: (name: string) => {
              instance?: () => { inputs?: Array<{ name?: string }> };
              inputs?: Array<{ name?: string }>;
            };
          }
        ).viewModelByName?.(VIEW_MODEL_NAME);

        const viewModelInstance = viewModel?.instance?.();
        if (viewModelInstance?.inputs) {
          viewModelInputs = viewModelInstance.inputs.map((input) => input.name);
        } else if (viewModel?.inputs) {
          viewModelInputs = viewModel.inputs.map((input) => input.name);
        }
      } catch (error) {
        console.warn("[Rive] view model unavailable", error);
      }

      void riveAny;
      void viewModelInputs;
    }
  }, [rive, artboard, isLoaded]);

  useEffect(() => {
    if (!rive || !isLoaded) {
      return;
    }

    const applyWithRetry = (attempt: number) => {
      const viewModelApplied = applyViewModelValue(rive, state);
      if (viewModelApplied) {
        try {
          rive.play(STATE_MACHINE_NAME);
        } catch (error) {
          console.warn("[Rive] unable to play state machine", error);
        }
        return;
      }

      if (attempt < 2) {
        setTimeout(() => applyWithRetry(attempt + 1), 120);
      }
    };

    applyWithRetry(0);

    const fallbackAnimation = STATE_TO_ANIMATION[state];
    if (fallbackAnimation) {
      rive.stop();
      rive.play(fallbackAnimation);
    }
  }, [state, rive, isLoaded, applyViewModelValue]);

  return <RiveComponent className={className} />;
}
