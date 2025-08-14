export const categorizeMeasureGrading = (measureGrading: any) => {
  switch (measureGrading.key.charAt(0)) {
    case "E":
      return "Umwelt";
    case "S":
      return "Gesellschaft";
    case "G":
      return "Wirtschaft";
    default:
      return "Unknown";
  }
};
