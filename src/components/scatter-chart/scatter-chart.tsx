import { Layout, PlotData, Shape } from "plotly.js";
import Plot from "react-plotly.js";
import { ScatterChartCategories } from "../../types/scatter-categories";
import { categorizeMeasureGrading } from "../../utils/measure-utils";

interface ScatterChartProps {
  title: string;
  height: number;
  width: number;
  xRange: number[];
  yRange: number[];
  xCoordinates: number[];
  yCoordinates: number[];
  scatterText: string[];
  categoriesInfo: {
    categoryName: string;
    categoryColor: string;
    categoryBorderColor: string;
  }[];
  yAxisLabel?: string;
  xAxisLabel?: string;
  shapes?: Partial<Shape>[];
}

type CategoryKey = keyof ScatterChartCategories;

const ScatterChart = ({
  title,
  height,
  width,
  xRange,
  yRange,
  xCoordinates,
  yCoordinates,
  scatterText,
  categoriesInfo,
  yAxisLabel,
  xAxisLabel,
  shapes,
}: ScatterChartProps) => {
  const categories: ScatterChartCategories = {
    Gesellschaft: {
      color:
        categoriesInfo.find(
          (category) => category.categoryName === "Gesellschaft"
        )?.categoryColor || "black",
      borderColor:
        categoriesInfo.find(
          (category) => category.categoryName === "Gesellschaft"
        )?.categoryBorderColor || "black",
      x: [],
      y: [],
      text: [],
      textPosition: [],
      hoverText: [],
    },
    Wirtschaft: {
      color:
        categoriesInfo.find(
          (category) => category.categoryName === "Wirtschaft"
        )?.categoryColor || "black",
      borderColor:
        categoriesInfo.find(
          (category) => category.categoryName === "Wirtschaft"
        )?.categoryBorderColor || "black",
      x: [],
      y: [],
      text: [],
      textPosition: [],
      hoverText: [],
    },
    Umwelt: {
      color:
        categoriesInfo.find((category) => category.categoryName === "Umwelt")
          ?.categoryColor || "black",
      borderColor:
        categoriesInfo.find((category) => category.categoryName === "Umwelt")
          ?.categoryBorderColor || "black",
      x: [],
      y: [],
      text: [],
      textPosition: [],
      hoverText: [],
    },
  };

  const createPlotData = (): Partial<PlotData>[] => {
    xCoordinates.forEach((x, index) => {
      const y = yCoordinates[index];
      const text = scatterText[index];

      let category: CategoryKey = categorizeMeasureGrading({ key: text }) as CategoryKey;

      const duplicateIndices = xCoordinates.reduce((acc, xCoord, i) => {
        if (xCoord === x && yCoordinates[i] === y) acc.push(i);
        return acc;
      }, [] as number[]);

      let textPosition = "top center";
      let xOffset = 0;
      let yOffset = 0;

      if (duplicateIndices.length > 1) {
        const offsetIndex = duplicateIndices.indexOf(index) % 16;
        switch (offsetIndex) {
          case 0:
            textPosition = "top center";
            break;
          case 1:
            textPosition = "bottom center";
            yOffset = -0.05;
            break;
          case 2:
            textPosition = "left center";
            xOffset = -0.05;
            break;
          case 3:
            textPosition = "right center";
            xOffset = 0.05;
            break;
          case 4:
            textPosition = "top left";
            xOffset = -0.05;
            yOffset = 0.05;
            break;
          case 5:
            textPosition = "top right";
            xOffset = 0.05;
            yOffset = 0.05;
            break;
          case 6:
            textPosition = "bottom left";
            xOffset = -0.05;
            yOffset = -0.05;
            break;
          case 7:
            textPosition = "bottom right";
            xOffset = 0.05;
            yOffset = -0.05;
            break;
          case 8:
            textPosition = "middle left";
            xOffset = -0.05;
            yOffset = -0.05;
            break;
          case 9:
            textPosition = "middle right";
            xOffset = 0.05;
            yOffset = -0.05;
            break;
          case 10:
            textPosition = "top center";
            yOffset = 0.1;
            break;
          case 11:
            textPosition = "bottom center";
            yOffset = -0.1;
            break;
          case 12:
            textPosition = "top left";
            xOffset = -0.1;
            yOffset = 0.1;
            break;
          case 13:
            textPosition = "top right";
            xOffset = 0.1;
            yOffset = 0.1;
            break;
          case 14:
            textPosition = "bottom left";
            xOffset = -0.1;
            yOffset = -0.1;
            break;
          case 15:
            textPosition = "bottom right";
            xOffset = 0.1;
            yOffset = -0.1;
            break;
        }
      }

      categories[category].x.push(x + xOffset);
      categories[category].y.push(y + yOffset);
      categories[category].text.push(text);
      categories[category].textPosition.push(textPosition);
      categories[category].hoverText.push(`(${x}, ${y}) - ${text}`);
    });

    return Object.keys(categories).map((key) => ({
      x: categories[key as CategoryKey].x,
      y: categories[key as CategoryKey].y,
      text: categories[key as CategoryKey].text,
      mode: "text+markers",
      type: "scatter",
      name: key,
      textposition: categories[key as CategoryKey]
        .textPosition as any, // Cast to any to avoid type error
      textfont: {
        family: "Lato, sans-serif",
        color: categories[key as CategoryKey].color,
        size: 12,
      },
      marker: {
        size: 6,
        color: categories[key as CategoryKey].color,
        line: {
          color: categories[key as CategoryKey].borderColor,
          width: 1,
        },
      },
      hoverinfo: "text",
      hovertext: categories[key as CategoryKey].hoverText,
    })) as Partial<PlotData>[];
  };

  const createLayout = (): Partial<Layout> => ({
    height: height,
    width: width,
    title: { text: title },
    legend: {
      y: 0.5,
      yref: "paper",
      font: {
        family: "Arial, sans-serif",
        size: 20,
        color: "grey",
      },
    },
    xaxis: {
      title: {
        text: xAxisLabel || "",
      },
      range: xRange,
    },
    yaxis: {
      title: {
        text: yAxisLabel || "",
      },
      range: yRange,
    },
    shapes: shapes || [],
  });

  return (
    <Plot
      data={createPlotData()}
      layout={createLayout()}
      config={{
        toImageButtonOptions: { format: "svg", height: 640, width: 1000 },
      }}
    />
  );
};

export default ScatterChart;
