"use client";

import React from "react";
import { useEffect } from "react";

/**
 * Applies a subtle tilt/parallax effect to an element using DeviceOrientation/DeviceMotion.
 * Falls back to no-op if permissions are denied or not supported.
 */
export function useGyroTilt(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const maxTilt = 10; // degrees

    const updateTilt = (beta: number, gamma: number) => {
      const clampedX = Math.max(-maxTilt, Math.min(maxTilt, gamma || 0));
      const clampedY = Math.max(-maxTilt, Math.min(maxTilt, beta || 0));
      el.style.transform = `rotateX(${clampedY * -0.5}deg) rotateY(${clampedX * 0.5}deg)`;
    };

    const onOrientation = (event: DeviceOrientationEvent) => {
      updateTilt(event.beta ?? 0, event.gamma ?? 0);
    };

    const onMotion = (event: DeviceMotionEvent) => {
      const beta = event.rotationRate?.beta || 0;
      const gamma = event.rotationRate?.gamma || 0;
      updateTilt(beta, gamma);
    };

    const addListeners = () => {
      window.addEventListener("deviceorientation", onOrientation);
      window.addEventListener("devicemotion", onMotion);
    };

    // iOS permission gate
    // ts-expect-error webkit permission
    const permissionFn = typeof DeviceOrientationEvent !== "undefined" && (DeviceOrientationEvent as any).requestPermission;
    if (permissionFn && typeof permissionFn === "function") {
      permissionFn().then((res: string) => {
        if (res === "granted") addListeners();
      }).catch(() => {});
    } else {
      addListeners();
    }

    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("devicemotion", onMotion);
      if (el) el.style.transform = "";
    };
  }, [ref]);
}

