import {
  Binoculars,
  Bird,
  Camera,
  Droplets,
  Footprints,
  Landmark,
  Leaf,
  Trees,
  Wind,
  type LucideIcon
} from "lucide-react";
import type { IconoMapa } from "@/lib/mapa";

export const ICONOS_MAPA: Record<IconoMapa, LucideIcon> = {
  droplets: Droplets,
  bird: Bird,
  trees: Trees,
  landmark: Landmark,
  leaf: Leaf,
  wind: Wind,
  footprints: Footprints,
  binoculars: Binoculars,
  camera: Camera
};
