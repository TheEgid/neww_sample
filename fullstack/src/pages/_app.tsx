import React from "react";
import { createTheme, MantineProvider } from "@mantine/core";
import type { AppProps } from "next/app";

import "../styles/globals.scss";

const theme = createTheme({
    primaryColor: "blue",
    headings: {
        fontFamily: "Open Sans Condensed", // Шрифт для всех заголовков
    },
});

const App = ({ Component, pageProps }: AppProps): React.JSX.Element => {

    return (
        <MantineProvider theme={theme}>
            <Component {...pageProps} />
        </MantineProvider>
    );
};

export default App;
