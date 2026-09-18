import { useEffect, useRef } from "react";

let scriptPromise;

const loadRecaptcha = () => {
  if (window.grecaptcha) return Promise.resolve(window.grecaptcha);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-recaptcha="v2"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.grecaptcha));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = "v2";
    script.onload = () => resolve(window.grecaptcha);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return scriptPromise;
};

export function RecaptchaCheckbox({ enabled, siteKey, onChange, error, resetSignal = 0 }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!enabled || !siteKey || !containerRef.current) return undefined;
    let mounted = true;
    loadRecaptcha()
      .then((grecaptcha) => {
        if (!mounted || !grecaptcha || !containerRef.current) return;
        widgetIdRef.current = grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onChange(token),
          "expired-callback": () => onChange(""),
          "error-callback": () => onChange(""),
        });
      })
      .catch(() => onChange(""));

    return () => {
      mounted = false;
      if (containerRef.current) containerRef.current.innerHTML = "";
      widgetIdRef.current = null;
    };
  }, [enabled, siteKey]);

  useEffect(() => {
    if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
      window.grecaptcha.reset(widgetIdRef.current);
      onChange("");
    }
  }, [resetSignal]);

  if (!enabled) return null;

  return (
    <div className="space-y-1">
      <div ref={containerRef} className="min-h-[78px]" />
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

export default RecaptchaCheckbox;
