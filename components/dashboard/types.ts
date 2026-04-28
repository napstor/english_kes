export type ProgressStateLike = {
  activeStep: number;
  completedSteps: number[];
  attempts: Record<string, number>;
  score: number;
};
