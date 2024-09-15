import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Routes } from "./routes";

const router = createBrowserRouter([...Routes]);

function Root() {
  return (
    <RouterProvider router={router} />
  );
};

export default Root;

