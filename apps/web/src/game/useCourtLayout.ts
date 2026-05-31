import { useEffect, useState } from "react";

export interface CourtLayout {
  aspectRatio: string;
  orientation: "portrait" | "landscape";
}

export const useCourtLayout = (): CourtLayout => {
  const [orientation, setOrientation] = useState<CourtLayout["orientation"]>(() =>
    window.innerHeight > window.innerWidth ? "portrait" : "landscape"
  );

  useEffect(() => {
    const update = () =>
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape");
    window.addEventListener("resize", update);
    window.screen.orientation?.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      window.screen.orientation?.removeEventListener("change", update);
    };
  }, []);

  return {
    orientation,
    aspectRatio: orientation === "portrait" ? "4 / 3" : "16 / 9"
  };
};
