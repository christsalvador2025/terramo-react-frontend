import { createTheme, Palette, PaletteOptions } from "@mui/material/styles";
import { TypographyOptions } from "@mui/material/styles/createTypography";
declare module "@mui/material/styles" {
  interface Theme {
    palette: {
      mode: "light" | "dark";
      primary: {
        main: string;
        light: string;
      };
      secondary: {
        main: string;
        light: string;
      };
      error: {
        main: string;
      };
      info: {
        main: string;
      };
      success: {
        main: string;
      };
    };
    typography: {
      fontFamily: string;
      fontSize: number;
      h1: {
        fontSize: string;
      };
      h2: {
        fontSize: string;
      };
      h3: {
        fontSize: string;
      };
      h4: {
        fontSize: string;
      };
      h5: {
        fontSize: string;
      };
      h6: {
        fontSize: string;
      };
      subtitle1: {
        fontSize: string;
      };
      body1: {
        fontSize: string;
      };
    };
  }
  interface ThemeOptions {
    palette?: PaletteOptions;
    typography?:
      | TypographyOptions
      | ((palette: Palette) => TypographyOptions)
      | undefined;
  }
}

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#026770",
      light: "#97D8C4",
    },
    secondary: {
      main: "#afafaf",
      light: "#f0f0f0",
    },
    error: {
      main: "#A30000",
    },
    info: {
      main: "#023070",
    },
    success: {
      main: "#027042",
    },
  },
  typography: {
    fontFamily: 'lato',
    fontSize: 16,
    h1: {
      fontSize: "3rem",
    },
    h2: {
      fontSize: "2.6rem",
    },
    h3: {
      fontSize: "2.4rem",
    },
    h4: {
      fontSize: "2.2rem",
    },
    h5: {
      fontSize: "2rem",
    },
    h6: {
      fontSize: "1.4rem",
    },
    subtitle1: {
      fontSize: "1.2rem",
    },
    body1: {
      fontSize: "1rem",
    },
    body2: {
      fontSize: "0.8rem",
    },
    caption: {
      fontSize: "0.6rem",
    },
  },
});
