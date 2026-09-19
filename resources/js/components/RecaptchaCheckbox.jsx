import { useEffect, useRef, useState } from "react";

let scriptPromise;

const hasCheckboxApi = () => typeof window.grecaptcha?.render === "function";

const waitForCheckboxApi = (resolve, reject, attempts = 0) => {
  if (hasCheckboxApi()) {
    resolve(window.grecaptcha);
    return;
  }

  if (attempts >= 100) {
    reject(new Error("Google returned a non-v2 reCAPTCHA API. Create a v2 Checkbox key and use api.js, not enterprise.js."));
    return;
  }

  window.setTimeout(() => waitForCheckboxApi(resolve, reject, attempts + 1), 50);
};

const appendV2Script = (resolve, reject) => {
  if (!hasCheckboxApi()) {
    try {
      delete window.grecaptcha;
    } catch {
      window.grecaptcha = undefined;
    }
  }

  const script = document.createElement("script");
  script.src = "https://www.google.com/recaptcha/api.js?render=explicit&hl=en";
  script.async = true;
  script.defer = true;
  script.dataset.recaptcha = "v2";
  script.onload = () => waitForCheckboxApi(resolve, reject);
  script.onerror = reject;
  document.head.appendChild(script);
};

const loadRecaptcha = () => {
  if (hasCheckboxApi()) return Promise.resolve(window.grecaptcha);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-recaptcha="v2"]');
    if (existing) {
      const resolveExisting = () => {
        if (hasCheckboxApi()) {
          resolve(window.grecaptcha);
        } else {
          waitForCheckboxApi(resolve, () => {
            existing.remove();
            appendV2Script(resolve, reject);
          });
        }
      };

      existing.addEventListener("load", resolveExisting, { once: true });
      existing.addEventListener("error", reject, { once: true });
      if (existing.readyState === "complete" || hasCheckboxApi()) resolveExisting();
      return;
    }
    appendV2Script(resolve, reject);
  });

  return scriptPromise;
};

export function RecaptchaCheckbox({ enabled, siteKey, onChange, error, resetSignal = 0 }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!enabled || !siteKey || !containerRef.current) return undefined;
    let mounted = true;
    setLoadError("");
    loadRecaptcha()
      .then((grecaptcha) => {
        if (!mounted || !grecaptcha || !containerRef.current) return;
        try {
          widgetIdRef.current = grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token) => onChange(token),
            "expired-callback": () => onChange(""),
            "error-callback": () => onChange(""),
          });
        } catch (renderError) {
          console.error("Unable to render reCAPTCHA.", renderError);
          const details = renderError instanceof Error ? renderError.message : String(renderError);
          setLoadError(`reCAPTCHA rejected this key: ${details}`);
          onChange("");
        }
      })
      .catch((loadError) => {
        console.error("Unable to load reCAPTCHA.", loadError);
        if (mounted) {
          const details = loadError instanceof Error ? loadError.message : String(loadError);
          setLoadError(`reCAPTCHA script failed: ${details}`);
        }
        onChange("");
      });

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
      {loadError && <p className="text-[11px] text-destructive">{loadError}</p>}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

export default RecaptchaCheckbox;
