import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "./app/routes";
import { QueryProvider } from "./app/providers/QueryProvider";
import { ThemeProvider } from "./app/providers/ThemeProvider";
import { CursorProvider } from "./cursor/CursorProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <CursorProvider>
          <RouterProvider router={router} />
        </CursorProvider>
      </QueryProvider>
    </ThemeProvider>
  </React.StrictMode>,
);