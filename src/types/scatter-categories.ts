export type ScatterChartCategoryNames = "Gesellschaft" | "Wirtschaft" | "Umwelt";

export type ScatterChartCategories = {
    [key in ScatterChartCategoryNames]: { 
        x: number[], 
        y: number[], 
        text: string[], 
        color: string, 
        borderColor: string, 
        textPosition: string[], 
        hoverText: string[]
    }
};
