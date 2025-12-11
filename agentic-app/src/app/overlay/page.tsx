"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";

type AnimationMode = "static" | "marquee" | "bounce";
type Align = "left" | "center" | "right";

type OverlayConfig = {
  message: string;
  caption: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  textColor: string;
  outlineColor: string;
  outlineWidth: number;
  backgroundColor: string;
  backgroundOpacity: number;
  dropShadow: boolean;
  shadowColor: string;
  paddingY: number;
  animation: AnimationMode;
  speed: number;
  uppercase: boolean;
  textAlign: Align;
  gradient: boolean;
  gradientFrom: string;
  gradientTo: string;
};

const channelName = "vdj-floating-text";

const defaultConfig: OverlayConfig = {
  message: "Live DJ Session",
  caption: "",
  fontFamily: "Barlow Condensed",
  fontSize: 56,
  fontWeight: 700,
  letterSpacing: 6,
  textColor: "#ffffff",
  outlineColor: "#000000",
  outlineWidth: 3,
  backgroundColor: "#101010",
  backgroundOpacity: 0.6,
  dropShadow: true,
  shadowColor: "rgba(0,0,0,0.6)",
  paddingY: 36,
  animation: "static",
  speed: 50,
  uppercase: true,
  textAlign: "center",
  gradient: true,
  gradientFrom: "#ff512f",
  gradientTo: "#dd2476",
};

function parseConfig(search: ReadonlyURLSearchParams): OverlayConfig {
  const config: OverlayConfig = { ...defaultConfig };
  search.forEach((value, key) => {
    if (!(key in config)) {
      return;
    }
    const typedKey = key as keyof OverlayConfig;
    switch (typedKey) {
      case "fontSize":
      case "fontWeight":
      case "letterSpacing":
      case "outlineWidth":
      case "paddingY":
      case "speed":
        config[typedKey] =
          (Number(value) || defaultConfig[typedKey]) as OverlayConfig[typeof typedKey];
        break;
      case "backgroundOpacity": {
        const numeric = Number(value);
        config.backgroundOpacity = Number.isFinite(numeric)
          ? Math.min(1, Math.max(0, numeric))
          : defaultConfig.backgroundOpacity;
        break;
      }
      case "dropShadow":
      case "uppercase":
      case "gradient":
        config[typedKey] = (value === "true" || value === "1") as OverlayConfig[typeof typedKey];
        break;
      case "textAlign":
        if (value === "left" || value === "center" || value === "right") {
          config.textAlign = value;
        }
        break;
      case "animation":
        if (value === "static" || value === "marquee" || value === "bounce") {
          config.animation = value;
        }
        break;
      default:
        config[typedKey] = value as OverlayConfig[typeof typedKey];
        break;
    }
  });
  return config;
}

function OverlayContent() {
  const searchParams = useSearchParams();
  const initialConfig = useMemo(
    () => parseConfig(searchParams),
    [searchParams]
  );
  const [config, setConfig] = useState<OverlayConfig>(initialConfig);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.margin = "0";
    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.margin = "";
      document.body.style.background = "";
      document.documentElement.style.background = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(channelName);
      channel.onmessage = (event) => {
        if (event?.data?.type === "overlay:update" && event.data.payload) {
          setConfig(event.data.payload as OverlayConfig);
        }
      };
    } catch {
      channel = null;
    }
    return () => channel?.close();
  }, []);

  const contentStyles = useMemo(() => ({
    fontFamily: config.fontFamily,
    fontSize: `${config.fontSize}px`,
    fontWeight: config.fontWeight,
    letterSpacing: `${config.letterSpacing / 10}em`,
    color: config.textColor,
    textTransform: config.uppercase ? "uppercase" : "none",
    textAlign: config.textAlign as Align,
    WebkitTextStroke: `${config.outlineWidth}px ${config.outlineColor}`,
    textShadow: config.dropShadow
      ? `0 12px 40px ${config.shadowColor}, 0 4px 20px ${config.shadowColor}`
      : "none",
  }), [config]);

  const backgroundStyle = useMemo(() => ({
    background: config.gradient
      ? `linear-gradient(120deg, ${config.gradientFrom}, ${config.gradientTo})`
      : config.backgroundColor,
    opacity: config.backgroundOpacity,
  }), [config]);

  const marqueeStyles = useMemo(() => {
    if (config.animation !== "marquee") return undefined;
    return { animationDuration: `${Math.max(4, 180 - config.speed)}s` };
  }, [config.animation, config.speed]);

  const bounceStyles = useMemo(() => {
    if (config.animation !== "bounce") return undefined;
    return { animationDuration: `${Math.max(3, 32 - config.speed / 3)}s` };
  }, [config.animation, config.speed]);

  const alignSelf: Record<Align, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: alignSelf[config.textAlign],
        padding: "24px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          position: "relative",
          minWidth: "320px",
          maxWidth: "90vw",
          overflow: "hidden",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...backgroundStyle,
          }}
        />
        <div
          className={`overlay-banner ${
            config.animation === "marquee"
              ? "animate-marquee whitespace-nowrap"
              : config.animation === "bounce"
              ? "animate-bounce-x"
              : ""
          }`}
          style={{
            ...contentStyles,
            paddingTop: config.paddingY,
            paddingBottom: config.paddingY,
            paddingLeft: 48,
            paddingRight: 48,
            position: "relative",
            ...marqueeStyles,
            ...bounceStyles,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              justifyContent:
                config.textAlign === "left"
                  ? "flex-start"
                  : config.textAlign === "right"
                  ? "flex-end"
                  : "center",
              alignItems:
                config.textAlign === "left"
                  ? "flex-start"
                  : config.textAlign === "right"
                  ? "flex-end"
                  : "center",
            }}
          >
            <span style={{ lineHeight: 1, display: "block" }}>
              {config.message || "\u00a0"}
            </span>
            {config.caption ? (
              <span
                style={{
                  fontSize: "1rem",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  WebkitTextStroke: "0",
                  textShadow: "none",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                {config.caption}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OverlayPage() {
  return (
    <Suspense fallback={null}>
      <OverlayContent />
    </Suspense>
  );
}
