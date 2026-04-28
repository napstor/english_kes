import type { StepType } from "@/lib/course";
import type { TypeChipCode } from "@/components/ui";

export type NavigationStep = {
  id: string;
  index: number;
  type: StepType;
  title: string;
  typeLabel: string;
  completed?: boolean;
};

export function stepTypeCode(type: StepType): TypeChipCode {
  switch (type) {
    case "theory":
      return "THR";
    case "vocabulary":
      return "RCG";
    case "composition":
      return "CTX";
    case "translate":
      return "TRN";
    case "drill":
      return "DRL";
    case "speaking":
      return "SPK";
  }
}
