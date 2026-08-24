import { useEffect } from "react";
import { router } from "@inertiajs/react";

export function ScrollToTop() {
  useEffect(() => {
    const unsubscribe = router.on("navigate", () => {
      window.scrollTo(0, 0);
    });
    return () => unsubscribe();
  }, []);

  return null;
}
