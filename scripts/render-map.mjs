import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/land-110m.json' with { type: 'json' };
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

export function worldSvg() {
  // D3 clips polygons at the antimeridian instead of drawing bands across the map.
  const projection = geoEquirectangular().scale(720 / (2 * Math.PI)).translate([360, 180]);
  const d = geoPath(projection)(feature(world, world.objects.land));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 360"><path fill="#b8c5a8" stroke="#e6eadd" stroke-width=".3" d="${d}"/></svg>\n`;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await writeFile('public/images/world-land.svg', worldSvg());
  console.log('Rendered local world map with antimeridian clipping.');
}
