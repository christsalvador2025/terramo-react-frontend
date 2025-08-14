
export const calculateWeightedMeasureAverage = (
  values: number[],
  weights: number[]
) => {
  const totalWeight = weights.reduce(
    (sum: number, weight: number) => sum + weight,
    0
  );
  let sum = 0;

  values.forEach((value: number, index: number) => {
    sum += value * (weights[index] / totalWeight);
  });

  return Math.round(sum * 10) / 10;
};