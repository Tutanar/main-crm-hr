"use client";

import { ReactNode } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/lib/theme";

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};

export default Providers;
