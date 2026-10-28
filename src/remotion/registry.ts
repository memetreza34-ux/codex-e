import { HybridAssets } from "./scenes/HybridAssets";
import { PopcornLab } from "./scenes/PopcornLab";
import { AfricaJourney } from "./scenes/AfricaJourney";
import { AfricaStudy } from "./scenes/AfricaStudy";
import type { ComponentType } from "react";
import { WebsiteFilm } from "./scenes/WebsiteFilm";
import { DataFilm } from "./scenes/DataFilm";
export const sceneComponents: Record<string, ComponentType> = {
  HybridAssets: HybridAssets,
  PopcornLabor: PopcornLab,
  AfrikaReise: AfricaJourney,
  AfrikaStudie: AfricaStudy,
  WebsiteSzene: WebsiteFilm,
  DatenErklaert: DataFilm,
};
