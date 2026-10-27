import type { ComponentType } from "react";
import { WebsiteFilm } from "./scenes/WebsiteFilm";
import { DataFilm } from "./scenes/DataFilm";
export const sceneComponents: Record<string, ComponentType> = {
  WebsiteSzene: WebsiteFilm,
  DatenErklaert: DataFilm,
};
