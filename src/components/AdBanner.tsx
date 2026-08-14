import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils/theme';

interface AdBannerProps {
  // URL of the ad-network loader script (e.g. .../adsbygoogle.js). Mirrors
  // pasting a <script src="..."> tag on a website.
  scriptSrc?: string;
  // Optional ad-unit identifiers (AdSense-style data attributes).
  adClient?: string;
  adSlot?: string;
  // Or pass a raw HTML tag/unit to inject verbatim (script tags are
  // re-created so they actually execute, like a real browser would).
  html?: string;
  height?: number;
}

// A reusable advertisement slot. On web it injects the provided JS tag into a
// container div (same mechanism as website ads); on native — or before a tag
// is supplied — it simply reserves the space with a labelled placeholder.
export function AdBanner({ scriptSrc, adClient, adSlot, html, height = 90 }: AdBannerProps) {
  const ref = useRef<View>(null);
  const active = Platform.OS === 'web' && (!!scriptSrc || !!html);

  useEffect(() => {
    if (!active) return;
    const el = ref.current as unknown as HTMLElement | null;
    if (!el) return;

    if (html) {
      el.innerHTML = html;
      el.querySelectorAll('script').forEach((s) => {
        const ns = document.createElement('script');
        if (s.src) ns.src = s.src;
        ns.async = true;
        ns.textContent = s.textContent;
        document.body.appendChild(ns);
      });
      return;
    }

    if (scriptSrc) {
      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      if (adClient) ins.setAttribute('data-ad-client', adClient);
      if (adSlot) ins.setAttribute('data-ad-slot', adSlot);
      ins.setAttribute('data-ad-format', 'auto');
      el.appendChild(ins);

      const s = document.createElement('script');
      s.src = scriptSrc;
      s.async = true;
      el.appendChild(s);
    }
  }, [active, scriptSrc, adClient, adSlot, html]);

  if (!active) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Text style={styles.placeholderText}>Advertisement</Text>
      </View>
    );
  }

  return <View ref={ref} style={[styles.slot, { height }]} />;
}

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 10,
    overflow: 'hidden',
  },
  placeholder: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(148,163,184,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148,163,184,0.06)',
  },
  placeholderText: {
    color: COLORS.subtle,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
