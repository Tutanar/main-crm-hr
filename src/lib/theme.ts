import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: "#ecf1ff",
      100: "#d9e4ff",
      200: "#b2c8ff",
      300: "#8cacf9",
      400: "#668ff2",
      500: "#3f73eb",
      600: "#315ac0",
      700: "#234295",
      800: "#162b6a",
      900: "#0b163d",
    },
  },
  semanticTokens: {
    colors: {
      appBg: { default: "gray.50", _dark: "gray.900" },
      appText: { default: "gray.800", _dark: "gray.100" },
      bg: {
        default: "white",
        _dark: "gray.800",
        subtle: { default: "gray.50", _dark: "gray.900" },
      },
      border: { default: "gray.200", _dark: "gray.700" },
      fg: {
        default: "gray.800",
        _dark: "gray.100",
        muted: { default: "gray.600", _dark: "gray.300" },
      },
    },
  },
  fonts: {
    heading:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
    body:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
  },
  components: {
    Tr: {
      baseStyle: (props: any) => ({
        _hover: {
          bg: mode("gray.100", "gray.700")(props),
        },
      }),
    },
    Table: {
      baseStyle: (props: any) => ({
        table: {
          bg: "transparent",
          borderColor: mode("gray.200", "gray.700")(props),
          // zebra rows
          "& tbody tr:nth-of-type(odd)": {
            bg: mode("white", "gray.900")(props),
          },
          "& tbody tr:nth-of-type(even)": {
            bg: mode("gray.50", "gray.800")(props),
          },
        },
        thead: {
          bg: mode("gray.100", "gray.700")(props),
        },
        th: {
          color: mode("gray.700", "gray.200")(props),
          borderColor: mode("gray.200", "gray.700")(props),
        },
        td: {
          color: mode("gray.800", "gray.100")(props),
          borderColor: mode("gray.200", "gray.700")(props),
        },
      }),
      variants: {
        outline: (props: any) => ({
          th: { borderBottomWidth: "1px" },
          td: { borderBottomWidth: "1px" },
        }),
      },
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: mode("gray.50", "gray.900")(props),
        color: mode("gray.800", "gray.100")(props),
      },
    }),
  },
});

export default theme;

