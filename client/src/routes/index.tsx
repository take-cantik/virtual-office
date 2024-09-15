import { type RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import Chat from "../pages/Chat";

export const Routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/chat", element: <Chat /> },
];
