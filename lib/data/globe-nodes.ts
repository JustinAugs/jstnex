/** Display configuration: selected illustrative nodes, not geographic/coverage data. */
export const GLOBE_CENTER = 200;
export const GLOBE_RADIUS = 150;
export type GlobeNode = { code: string; x: number; y: number };
export const GLOBE_NODES = [
  { code: "CN", x: 150, y: 118 },
  { code: "US", x: 262, y: 158 },
  { code: "SG", x: 188, y: 272 },
  { code: "DE", x: 108, y: 196 },
  { code: "JP", x: 276, y: 232 },
] as const satisfies readonly GlobeNode[];

export function globeNodeErrors(nodes: readonly GlobeNode[], countryCodes: ReadonlySet<string>): string[] {
  const seen = new Set<string>();
  return nodes.flatMap((node, index) => {
    const errors: string[] = [];
    if (!countryCodes.has(node.code)) errors.push(`${index}: unknown country ${node.code}`);
    if (seen.has(node.code)) errors.push(`${index}: duplicate country ${node.code}`);
    seen.add(node.code);
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y) ||
        Math.hypot(node.x - GLOBE_CENTER, node.y - GLOBE_CENTER) >= GLOBE_RADIUS) {
      errors.push(`${index}: coordinates must be finite and inside the globe`);
    }
    return errors;
  });
}
