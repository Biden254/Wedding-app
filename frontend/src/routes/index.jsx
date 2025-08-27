import React, { lazy, Suspense } from "react";

const Home = lazy(() => import("./routes/home"));

const routes = [
  {
    path: "/",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Home />
      </Suspense>
    ),
  },
];

export default routes;
