import { type RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import Chat from "../pages/Chat";
import VoiceChat from "../pages/VoiceChat";

export const Routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/chat", element: <Chat /> },
  { path: "/voice-chat", element: <VoiceChat />},
];
