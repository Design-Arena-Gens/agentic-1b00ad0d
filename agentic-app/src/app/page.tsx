"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

const defaultConfig: OverlayConfig = {
  message: "Live DJ Session",
  caption: "Virtual DJ 7 // Tonight 10 PM",
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

const fonts = [
  "Barlow Condensed",
  "Bebas Neue",
  "Montserrat",
  "Orbitron",
  "Poppins",
  "Raleway",
  "Roboto",
  "Titillium Web",
  "Work Sans",
] as const;

const animationModes: { value: AnimationMode; label: string }[] = [
  { value: "static", label: "Static" },
  { value: "marquee", label: "Marquee" },
  { value: "bounce", label: "Bounce" },
];

const channelName = "vdj-floating-text";
const justifyClass: Record<Align, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export default function Home() {
  const [config, setConfig] = useState<OverlayConfig>(defaultConfig);
  const [copied, setCopied] = useState(false);
  const [origin] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : ""
  );
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || channelRef.current) return;
    try {
      channelRef.current = new BroadcastChannel(channelName);
    } catch {
      channelRef.current = null;
    }
    return () => {
      channelRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!channelRef.current) return;
    channelRef.current.postMessage({ type: "overlay:update", payload: config });
  }, [config]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const overlayUrl = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(config).forEach(([key, value]) => {
      params.set(key, String(value));
    });
    const path = `/overlay?${params.toString()}`;
    return origin ? `${origin}${path}` : path;
  }, [config, origin]);

  const handleChange = useCallback(
    <K extends keyof OverlayConfig>(key: K, value: OverlayConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const openOverlayWindow = useCallback(() => {
    window.open(
      overlayUrl,
      "_blank",
      "noopener,noreferrer,width=1280,height=720,menubar=no,toolbar=no"
    );
  }, [overlayUrl]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
    } catch (error) {
      console.error("Unable to copy overlay link", error);
    }
  }, [overlayUrl]);

  const marqueeStyles = useMemo(() => {
    if (config.animation !== "marquee") return {};
    return {
      animationDuration: `${Math.max(4, 180 - config.speed)}s`,
    };
  }, [config.animation, config.speed]);

  const bounceStyles = useMemo(() => {
    if (config.animation !== "bounce") return {};
    return {
      animationDuration: `${Math.max(3, 32 - config.speed / 3)}s`,
    };
  }, [config.animation, config.speed]);

  const textBlockStyles = useMemo(() => {
    return {
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
    };
  }, [config]);

  const backgroundColor = useMemo(() => {
    if (config.gradient) {
      return `linear-gradient(120deg, ${config.gradientFrom}, ${config.gradientTo})`;
    }
    return config.backgroundColor;
  }, [config.backgroundColor, config.gradient, config.gradientFrom, config.gradientTo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-black text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:gap-12">
        <section className="w-full space-y-8 lg:w-[500px]">
          <header className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Virtual DJ Floating Text Controller
            </h1>
            <p className="text-sm text-zinc-300">
              Customize a broadcast-ready banner for Virtual DJ 7. Open the overlay window and place it
              on your video output—every change updates instantly.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={openOverlayWindow}
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Open Overlay Window
              </button>
              <button
                onClick={copyLink}
                className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold transition hover:bg-white/10"
              >
                {copied ? "Copied!" : "Copy Overlay Link"}
              </button>
            </div>
          </header>

          <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <fieldset className="space-y-4">
              <legend className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                Text Content
              </legend>
              <label className="flex flex-col gap-2 text-sm text-zinc-300">
                Main Title
                <input
                  className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-base outline-none transition focus:border-white/60"
                  placeholder="Live on the decks..."
                  value={config.message}
                  onChange={(event) => handleChange("message", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-zinc-300">
                Sub Text
                <input
                  className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-base outline-none transition focus:border-white/60"
                  placeholder="Special guest // Tonight 10PM"
                  value={config.caption}
                  onChange={(event) => handleChange("caption", event.target.value)}
                />
              </label>
              <label className="flex items-center gap-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  className="size-4 rounded border border-white/20 bg-black/40"
                  checked={config.uppercase}
                  onChange={(event) => handleChange("uppercase", event.target.checked)}
                />
                Force uppercase
              </label>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                Typography
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-zinc-300">
                  Font
                  <select
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-base outline-none transition focus:border-white/60"
                    value={config.fontFamily}
                    onChange={(event) => handleChange("fontFamily", event.target.value)}
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-zinc-300">
                  Alignment
                  <select
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-base outline-none transition focus:border-white/60"
                    value={config.textAlign}
                    onChange={(event) => handleChange("textAlign", event.target.value as Align)}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </label>
              </div>
              <label className="flex flex-col gap-2 text-sm text-zinc-300">
                Font size ({config.fontSize}px)
                <input
                  type="range"
                  min={28}
                  max={110}
                  value={config.fontSize}
                  onChange={(event) => handleChange("fontSize", Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-zinc-300">
                Weight ({config.fontWeight})
                <input
                  type="range"
                  min={300}
                  max={900}
                  step={100}
                  value={config.fontWeight}
                  onChange={(event) => handleChange("fontWeight", Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-zinc-300">
                Letter spacing ({(config.letterSpacing / 10).toFixed(1)}em)
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={config.letterSpacing}
                  onChange={(event) => handleChange("letterSpacing", Number(event.target.value))}
                />
              </label>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                Colors & Effects
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-zinc-300">
                  Text color
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(event) => handleChange("textColor", event.target.value)}
                    className="h-11 w-full cursor-pointer rounded border border-white/20 bg-black/40"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-zinc-300">
                  Outline color
                  <input
                    type="color"
                    value={config.outlineColor}
                    onChange={(event) => handleChange("outlineColor", event.target.value)}
                    className="h-11 w-full cursor-pointer rounded border border-white/20 bg-black/40"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-2 text-sm text-zinc-300">
                Outline width ({config.outlineWidth}px)
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={config.outlineWidth}
                  onChange={(event) => handleChange("outlineWidth", Number(event.target.value))}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-zinc-300">
                Banner padding ({config.paddingY}px)
                <input
                  type="range"
                  min={12}
                  max={140}
                  value={config.paddingY}
                  onChange={(event) => handleChange("paddingY", Number(event.target.value))}
                />
              </label>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-black/35 p-4">
                <label className="flex items-center justify-between text-sm text-zinc-300">
                  Use gradient background
                  <input
                    type="checkbox"
                    className="size-4 rounded border border-white/20 bg-black/40"
                    checked={config.gradient}
                    onChange={(event) => handleChange("gradient", event.target.checked)}
                  />
                </label>
                {config.gradient ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm text-zinc-300">
                      Gradient start
                      <input
                        type="color"
                        value={config.gradientFrom}
                        onChange={(event) => handleChange("gradientFrom", event.target.value)}
                        className="h-11 w-full cursor-pointer rounded border border-white/20 bg-black/40"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-300">
                      Gradient end
                      <input
                        type="color"
                        value={config.gradientTo}
                        onChange={(event) => handleChange("gradientTo", event.target.value)}
                        className="h-11 w-full cursor-pointer rounded border border-white/20 bg-black/40"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col gap-2 text-sm text-zinc-300">
                    Solid color
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(event) => handleChange("backgroundColor", event.target.value)}
                      className="h-11 w-full cursor-pointer rounded border border-white/20 bg-black/40"
                    />
                  </label>
                )}
                <label className="flex flex-col gap-2 text-sm text-zinc-300">
                  Background opacity ({Math.round(config.backgroundOpacity * 100)}%)
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(config.backgroundOpacity * 100)}
                    onChange={(event) =>
                      handleChange("backgroundOpacity", Number(event.target.value) / 100)
                    }
                  />
                </label>
              </div>

              <div className="space-y-2 rounded-2xl border border-white/10 bg-black/35 p-4">
                <label className="flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    className="size-4 rounded border border-white/20 bg-black/40"
                    checked={config.dropShadow}
                    onChange={(event) => handleChange("dropShadow", event.target.checked)}
                  />
                  Depth shadow
                </label>
                <label className="flex flex-col gap-2 text-sm text-zinc-300">
                  Shadow color
                  <input
                    type="color"
                    disabled={!config.dropShadow}
                    value={config.shadowColor}
                    onChange={(event) => handleChange("shadowColor", event.target.value)}
                    className="h-11 w-full cursor-pointer rounded border border-white/20 bg-black/40 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                Motion
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-zinc-300">
                  Animation mode
                  <select
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-base outline-none transition focus:border-white/60"
                    value={config.animation}
                    onChange={(event) => handleChange("animation", event.target.value as AnimationMode)}
                  >
                    {animationModes.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-zinc-300">
                  Speed ({config.speed})
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={config.speed}
                    onChange={(event) => handleChange("speed", Number(event.target.value))}
                  />
                </label>
              </div>
            </fieldset>
          </div>
        </section>

        <section className="flex-1">
          <div className="relative h-full rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur">
            <div className="flex h-[620px] flex-col overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top,_#1a1a1a,_#050505)]">
              <div className="flex-1 bg-[linear-gradient(130deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_40%),linear-gradient(45deg,rgba(255,255,255,0.03)_25%,rgba(255,255,255,0)_25%)] bg-[length:120px_120px] opacity-40" />
              <div className="relative flex items-center justify-center overflow-visible px-6 pb-10">
                <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.55)]">
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: backgroundColor,
                      opacity: config.backgroundOpacity,
                    }}
                  />
                  <div
                    className={`relative flex w-full items-center ${justifyClass[config.textAlign]}`}
                    style={{
                      paddingTop: config.paddingY,
                      paddingBottom: config.paddingY,
                      paddingLeft: 40,
                      paddingRight: 40,
                    }}
                  >
                    <div
                      className={`relative ${
                        config.animation === "marquee"
                          ? "animate-marquee whitespace-nowrap"
                          : config.animation === "bounce"
                          ? "animate-bounce-x"
                          : ""
                      } w-full`}
                      style={{
                        ...textBlockStyles,
                        ...marqueeStyles,
                        ...bounceStyles,
                      }}
                    >
                      <div className="flex flex-col gap-3">
                        <span className="block leading-tight">{config.message || "\u00a0"}</span>
                        {config.caption && (
                          <span className="block text-base font-normal uppercase tracking-[0.35em] text-white/80">
                            {config.caption}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="mt-6 flex flex-col gap-3 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Tip: Load the overlay window as a browser source or drag it onto an external monitor for
                use in Virtual DJ.
              </span>
              <button
                onClick={() => setConfig(defaultConfig)}
                className="self-start rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:self-auto"
              >
                Reset settings
              </button>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
}
