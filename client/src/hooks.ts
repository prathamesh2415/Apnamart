import { useEffect } from "react";

export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = title;
    return () => {
      document.title = "ApnaMart — India’s B2B Marketplace";
    };
  }, [title]);
}
