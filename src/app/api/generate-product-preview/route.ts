import { NextRequest, NextResponse } from 'next/server';

// Allow up to 120 seconds for image generation on Vercel
export const maxDuration = 120;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Material descriptions for the prompt
 */
const MATERIAL_DESCRIPTIONS: Record<string, string> = {
  'canvas': 'durable woven cotton canvas with a slightly textured matte finish',
  'cordura': 'smooth, tightly-woven Cordura nylon with a slight sheen',
  'leather': 'premium full-grain leather with natural grain texture',
  'faux-leather': 'smooth PU vegan leather with a uniform finish',
  'neoprene': 'soft flexible neoprene with a smooth, slightly rubbery surface',
};

/**
 * Ear size descriptions for the prompt
 */
const EAR_SIZE_DESCRIPTIONS: Record<string, string> = {
  'small': 'very small and subtle, extending less than 0.5cm beyond the body edge',
  'medium': 'compact, extending about 0.5-1.5cm beyond the body edge',
  'large': 'moderately sized, extending about 1.5-2cm beyond the body edge',
};

/**
 * Generate an annotated SVG reference diagram showing the correct product layout.
 * This is sent to Gemini as a visual blueprint so it knows WHERE each element goes.
 * Returns base64-encoded SVG.
 */
function buildReferenceDiagram(data: {
  primaryColor: string;
  secondaryColor: string;
  muzzleColor?: string;
  noseColor?: string;
  accentColor?: string;
  earStyle: string;
}): string {
  const body = data.primaryColor || '#D4A574';
  const ears = data.secondaryColor || '#C4956A';
  const muzzle = data.muzzleColor || '#F5E6D3';
  const nose = data.noseColor || '#000000';
  const accent = data.accentColor || '#8B7355';

  // Ear paths based on style
  let leftEar = '';
  let rightEar = '';
  if (data.earStyle === 'pointy') {
    leftEar = `<polygon points="60,75 40,40 80,75" fill="${ears}" stroke="#666" stroke-width="1"/>`;
    rightEar = `<polygon points="180,75 200,40 160,75" fill="${ears}" stroke="#666" stroke-width="1"/>`;
  } else if (data.earStyle === 'button') {
    leftEar = `<ellipse cx="50" cy="80" rx="20" ry="15" fill="${ears}" stroke="#666" stroke-width="1" transform="rotate(-15 50 80)"/>`;
    rightEar = `<ellipse cx="190" cy="80" rx="20" ry="15" fill="${ears}" stroke="#666" stroke-width="1" transform="rotate(15 190 80)"/>`;
  } else if (data.earStyle === 'rose') {
    leftEar = `<path d="M60,75 Q30,65 40,85 Q50,95 65,85" fill="${ears}" stroke="#666" stroke-width="1"/>`;
    rightEar = `<path d="M180,75 Q210,65 200,85 Q190,95 175,85" fill="${ears}" stroke="#666" stroke-width="1"/>`;
  } else {
    // floppy
    leftEar = `<path d="M65,75 Q30,80 35,110 Q40,120 55,105" fill="${ears}" stroke="#666" stroke-width="1"/>`;
    rightEar = `<path d="M175,75 Q210,80 205,110 Q200,120 185,105" fill="${ears}" stroke="#666" stroke-width="1"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <style>
    text { font-family: Arial, sans-serif; }
    .label { font-size: 11px; fill: #333; font-weight: bold; }
    .arrow { stroke: #E8533F; stroke-width: 1.5; fill: none; marker-end: url(#arrowhead); }
    .region-label { font-size: 9px; fill: #E8533F; font-weight: bold; }
  </style>
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#E8533F"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="200" y="20" text-anchor="middle" class="label" style="font-size:14px;">LEASHBUDDY PRODUCT LAYOUT — REFERENCE DIAGRAM</text>
  <text x="200" y="35" text-anchor="middle" style="font-size:10px;fill:#666;">The face IS the flap. They are ONE piece.</text>

  <!-- Carabiner tab -->
  <rect x="108" y="45" width="24" height="25" rx="3" fill="#888" stroke="#666" stroke-width="1"/>
  <ellipse cx="120" cy="50" rx="10" ry="8" fill="none" stroke="#999" stroke-width="2"/>
  <text x="260" y="58" class="region-label">← CARABINER + TAB</text>
  <line x1="145" y1="57" x2="255" y2="57" class="arrow"/>

  <!-- Ears -->
  ${leftEar}
  ${rightEar}

  <!-- POUCH BODY - main rectangle -->
  <rect x="60" y="70" width="120" height="170" rx="5" fill="${body}" stroke="#666" stroke-width="2"/>

  <!-- ===== FACE-FLAP ZONE (top half) ===== -->
  <!-- Dashed line separating face-flap from body -->
  <line x1="60" y1="155" x2="180" y2="155" stroke="#666" stroke-width="1" stroke-dasharray="4,3"/>

  <!-- Big label: FACE = FLAP -->
  <rect x="62" y="72" width="116" height="81" rx="4" fill="none" stroke="#E8533F" stroke-width="2" stroke-dasharray="6,3"/>
  <text x="120" y="87" text-anchor="middle" class="region-label" style="font-size:10px;">★ FACE = FLAP (one piece) ★</text>

  <!-- Eyes -->
  <circle cx="98" cy="108" r="7" fill="black"/>
  <circle cx="100" cy="106" r="1.5" fill="white"/>
  <circle cx="142" cy="108" r="7" fill="black"/>
  <circle cx="144" cy="106" r="1.5" fill="white"/>

  <!-- Muzzle -->
  <ellipse cx="120" cy="133" rx="22" ry="16" fill="${muzzle}" stroke="#ccc" stroke-width="0.5"/>

  <!-- Nose -->
  <path d="M115,126 L120,120 L125,126 Q120,130 115,126Z" fill="${nose}"/>

  <!-- Mouth (smile) -->
  <path d="M112,133 Q120,141 128,133" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>

  <!-- Snap button at flap edge -->
  <circle cx="120" cy="153" r="3" fill="silver" stroke="#999" stroke-width="1"/>

  <!-- Label: snap button -->
  <text x="260" y="155" class="region-label">← SNAP BUTTON (flap closure)</text>
  <line x1="130" y1="153" x2="255" y2="153" class="arrow"/>

  <!-- ===== LOWER BODY (paw prints) ===== -->
  <!-- Paw prints -->
  <circle cx="100" cy="185" r="5" fill="${accent}" opacity="0.6"/>
  <circle cx="95" cy="178" r="2" fill="${accent}" opacity="0.6"/>
  <circle cx="100" cy="176" r="2" fill="${accent}" opacity="0.6"/>
  <circle cx="105" cy="178" r="2" fill="${accent}" opacity="0.6"/>
  <circle cx="140" cy="185" r="5" fill="${accent}" opacity="0.6"/>
  <circle cx="135" cy="178" r="2" fill="${accent}" opacity="0.6"/>
  <circle cx="140" cy="176" r="2" fill="${accent}" opacity="0.6"/>
  <circle cx="145" cy="178" r="2" fill="${accent}" opacity="0.6"/>
  <text x="260" y="185" class="region-label">← PAW PRINTS (embroidered)</text>
  <line x1="155" y1="183" x2="255" y2="183" class="arrow"/>

  <!-- Label: lower body -->
  <text x="120" y="215" text-anchor="middle" class="region-label">LOWER BODY (bag compartment)</text>

  <!-- Paw tabs at bottom -->
  <ellipse cx="90" cy="242" rx="8" ry="5" fill="#444"/>
  <ellipse cx="150" cy="242" rx="8" ry="5" fill="#444"/>
  <text x="260" y="243" class="region-label">← TINY PAW TABS</text>
  <line x1="165" y1="242" x2="255" y2="242" class="arrow"/>

  <!-- Grommet at bottom center -->
  <circle cx="120" cy="238" r="5" fill="#333" stroke="#555" stroke-width="2"/>
  <circle cx="120" cy="238" r="2.5" fill="#111"/>
  <text x="260" y="265" class="region-label">← RUBBER GROMMET (bag dispensing hole)</text>
  <line x1="130" y1="240" x2="255" y2="262" class="arrow"/>

  <!-- ===== BACK/SIDE VIEW ===== -->
  <text x="120" y="295" text-anchor="middle" class="label" style="font-size:13px;">BACK / SIDE VIEW</text>

  <!-- Back panel -->
  <rect x="60" y="305" width="120" height="170" rx="5" fill="${body}" stroke="#666" stroke-width="2"/>

  <!-- Horizontal zipper across lower half of back -->
  <line x1="62" y1="400" x2="178" y2="400" stroke="#333" stroke-width="3"/>
  <rect x="165" y="395" width="12" height="10" rx="2" fill="#555" stroke="#333" stroke-width="1"/>
  <text x="260" y="402" class="region-label">← HORIZONTAL ZIPPER (back only!)</text>
  <line x1="180" y1="400" x2="255" y2="400" class="arrow"/>
  <text x="120" y="418" text-anchor="middle" style="font-size:8px;fill:#666;">Zipper wraps slightly to sides — visible in 3/4 view</text>

  <!-- Belt loops on back -->
  <rect x="85" y="330" width="8" height="30" rx="2" fill="none" stroke="#999" stroke-width="1.5"/>
  <rect x="147" y="330" width="8" height="30" rx="2" fill="none" stroke="#999" stroke-width="1.5"/>
  <text x="260" y="345" class="region-label">← BELT LOOPS</text>
  <line x1="160" y1="345" x2="255" y2="345" class="arrow"/>

  <!-- Grommet on back bottom -->
  <circle cx="120" cy="473" r="5" fill="#333" stroke="#555" stroke-width="2"/>
  <circle cx="120" cy="473" r="2.5" fill="#111"/>
  <text x="260" y="475" class="region-label">← GROMMET (bottom center)</text>
  <line x1="130" y1="473" x2="255" y2="473" class="arrow"/>

  <!-- Key callouts box -->
  <rect x="5" y="300" width="48" height="90" rx="3" fill="#FFF3F0" stroke="#E8533F" stroke-width="1"/>
  <text x="29" y="315" text-anchor="middle" style="font-size:8px;fill:#E8533F;font-weight:bold;">KEY RULES:</text>
  <text x="29" y="328" text-anchor="middle" style="font-size:7px;fill:#333;">Face = Flap</text>
  <text x="29" y="340" text-anchor="middle" style="font-size:7px;fill:#333;">No plain flap</text>
  <text x="29" y="352" text-anchor="middle" style="font-size:7px;fill:#333;">Zipper: BACK</text>
  <text x="29" y="364" text-anchor="middle" style="font-size:7px;fill:#333;">Grommet: BTM</text>
  <text x="29" y="376" text-anchor="middle" style="font-size:7px;fill:#333;">Colors: exact</text>
</svg>`;

  // Convert SVG to base64
  return Buffer.from(svg).toString('base64');
}

interface PreviewRequestData {
  breedName: string;
  earStyle: string;
  earSize: string;
  primaryColor: string;
  secondaryColor: string;
  earInnerColor?: string;
  muzzleColor?: string;
  noseColor?: string;
  accentColor: string;
  flapColor?: string;
  liningColor?: string;
  material: string;
  productSize: string;
  dimensions: { heightCm: number; widthCm: number; depthCm: number };
  embroideryDescription?: string;
  dogName?: string;
  dogPhoto?: string;
  dogPhotoMimeType?: string;
  dogPhotos?: Array<{ data: string; mimeType: string }>;
  count?: number;
  regionColors?: Record<string, string[]>;
}

/**
 * Build the detailed product preview prompt — v4
 * Restores full v1 detail, adds targeted fixes for: face=flap, zipper+grommet visibility, strict color palette
 */
function buildProductPreviewPrompt(data: PreviewRequestData, photoCount: number): string {
  // Map ear style to description
  const earStyleDesc = data.earStyle === 'pointy'
    ? 'pointed fabric ears that stand upright, sewn to the top-left and top-right corners of the pouch'
    : data.earStyle === 'rose'
    ? 'folded rose-shaped fabric ears that curve outward at the sides near the top'
    : data.earStyle === 'button'
    ? 'folded button ears that sit neatly at the top corners, drooping slightly'
    : 'floppy fabric ears that drape outward and downward from the top corners of the pouch';

  const earSizeDesc = EAR_SIZE_DESCRIPTIONS[data.earSize] || EAR_SIZE_DESCRIPTIONS['medium'];
  const materialDesc = MATERIAL_DESCRIPTIONS[data.material] || MATERIAL_DESCRIPTIONS['canvas'];

  const hasPhotos = photoCount > 0;
  const photoContext = hasPhotos
    ? `\n\nREFERENCE PHOTO${photoCount > 1 ? 'S' : ''}: I've attached ${photoCount} photo${photoCount > 1 ? 's' : ''} of the actual ${data.breedName} dog. Use ${photoCount > 1 ? 'these photos' : 'this photo'} to understand the dog's FACIAL STRUCTURE, MARKING PATTERNS, and BREED FEATURES. The specific colors to use for each part of the product are listed below — these were chosen by the user and should be followed exactly.`
    : '';

  const colorInstructions = `\n\nCOLOR SPECIFICATION (USER-SELECTED — USE THESE EXACTLY):
The user has chosen the exact colors for each part of the product. Apply these colors faithfully:
- BODY FABRIC (main pouch): ${data.primaryColor} — this represents the dog's dominant coat color. The entire pouch body must be this color.
- BREED MARKINGS / EARS OUTER: ${data.secondaryColor} — use for any secondary markings, ear outer fabric, and breed-specific patches.
${data.earInnerColor ? `- EAR INNER LINING: ${data.earInnerColor}` : ''}
- MUZZLE APPLIQUE: ${data.muzzleColor || 'light beige or cream'} — the flat fabric piece for the snout area.
- NOSE: ${data.noseColor || 'black'} — the small embroidered nose shape.
- ACCENT (paw prints): ${data.accentColor || 'a slightly darker tone than the body'}
${data.regionColors && Object.keys(data.regionColors).length > 0 ? `\nMULTI-COLOR MARKINGS: Some regions have multiple colors to represent patterns, spots, or patches:\n${Object.entries(data.regionColors).map(([region, colors]) => `- ${region.toUpperCase()}: has additional colors: ${colors.join(', ')} — blend these as natural breed markings/patches alongside the primary color`).join('\n')}` : ''}
Do NOT override these colors based on photo analysis — they are intentional choices. Do NOT default the body to white or cream unless the user-selected body color IS white or cream.${hasPhotos ? `\nUse the reference photo${photoCount > 1 ? 's' : ''} ONLY for facial structure, marking PLACEMENT, and breed-specific features — NOT for color selection.` : ''}

STRICT COLOR PALETTE RULE: The ONLY colors that may appear ANYWHERE on this product are: the user-selected colors listed above, black (for eyes and hardware), dark grey/charcoal (small paw tabs, zipper), and brushed silver (hardware). Absolutely NO other colors. No red, blue, green, orange, pink, teal, purple, or any bright/saturated accent not listed. If you are tempted to add a decorative accent color — DON'T. Keep it strictly to the palette above.`;

  return `Generate a photorealistic product photograph of a small dog-themed POOP BAG DISPENSER POUCH called "LeashBuddy", designed to look like a cute ${data.breedName}.${photoContext}${colorInstructions}

CORE CONCEPT:
This is a compact rectangular fabric pouch — NOT a plush toy, NOT a stuffed animal. The pouch has a cute ${data.breedName} face on its front, created with FLAT machine embroidery thread and flat fabric applique pieces sewn flush to the surface. Nothing on the face is raised or 3D. The pouch also has double-layer fabric ears at the top corners and embroidered paw prints on the lower front body.

CRITICAL — FACE AND FLAP ARE THE SAME THING:
The upper front surface of this pouch serves double duty: it IS the face AND it IS the opening flap. The dog's eyes, nose, mouth, and muzzle are embroidered/appliqued DIRECTLY onto this flap panel. When you look at the front, you see the dog face — and that entire face panel IS the flap that hinges open. There is NO separate plain flap sitting on top of the face. There is NO face hidden underneath a flap. The face and the flap are ONE SINGLE PIECE of fabric. Think of it like a greeting card: the cover (flap) has the artwork (dog face) on it, and it opens to reveal the compartment inside.

EMBROIDERY STYLE — CRITICAL:
The face embroidery must look like a clean, flat, VECTOR-ILLUSTRATION style design — the kind produced by a modern computerized embroidery machine. Think: cute kawaii graphic design rendered in thread, NOT a 3D sculpture or stuffed animal face. Every element is FLAT and flush with the fabric surface. The style is bold, clean lines with solid filled areas of color — like a simplified cartoon/icon.

EXACT DIMENSIONS (per engineering drawing):
- Total height (body only, no tab/clip): ${data.dimensions.heightCm}cm
- Width: ${data.dimensions.widthCm}cm
- Depth: ${data.dimensions.depthCm}cm
- Face flap area: approximately 5cm tall (the upper section)
- Lower body section: approximately 4.5cm tall (below the flap)
- Fabric tab above body: 3.5cm (connects to spring hook/carabiner)
- For scale: roughly the size of a deck of playing cards or a small smartphone

FRONT VIEW — TOP TO BOTTOM:

1. SPRING HOOK + FABRIC TAB (top):
   A 3.5cm fabric loop tab sewn at the top center of the pouch. A silver/dark spring-gate carabiner clip hangs from this tab. The tab is the same ${materialDesc} as the body.

2. DOUBLE-LAYER EARS (top corners):
   ${earStyleDesc}. The ears are ${earSizeDesc}. Each ear is double-layered: outer fabric in the user-selected secondary/ear color, inner fabric in the user-selected ear inner color (see COLOR SPECIFICATION). They are sewn into the top-left and top-right seams of the pouch body and extend outward to the SIDES, breaking the rectangular silhouette. The ears must be small enough that they do NOT interfere with the face flap opening — they sit at the side corners, out of the way of the top hinge.

3. THE FACE (which IS the opening flap — upper ~5cm of front):
   This panel is BOTH the dog face AND the flap that opens downward, secured by a small silver snap button at its bottom center. When CLOSED (as shown in this photo), it sits flush with the lower body — the seam between face-flap and body is barely visible.

   The face-flap has a FLAT EMBROIDERED FACE covering its entire surface — a cute ${data.breedName} face in the following FLAT, GRAPHIC style:

   - EYES: Two solid BLACK FILLED CIRCLES (approximately 6-8mm) made of dense satin-stitch embroidery thread — completely FLAT against the fabric. Each eye has a TINY white highlight dot (1-2mm) in the upper-right area, also embroidered. The eyes look like two little black buttons drawn in a cute cartoon style. They are NOT 3D, NOT plastic, NOT raised, NOT glossy, NOT safety eyes — they are FLAT embroidered circles flush with the fabric surface.
   - MUZZLE/SNOUT: A flat fabric applique piece in the user-selected muzzle color (see COLOR SPECIFICATION), cut in a wide rounded U-shape or bean shape, sewn flat onto the lower portion of the face-flap. The muzzle is completely flush with the surface. It takes up roughly the bottom third of the face area.
   - NOSE: A small solid embroidered shape in the user-selected nose color (see COLOR SPECIFICATION), rounded triangle or inverted heart, centered at the top of the muzzle, between and slightly below the eyes. Flat satin-stitch fill.
   - MOUTH: A tiny cute embroidered SMILE below the nose — a clear UPWARD-FACING SEMICIRCLE (happy "U" shape) stitched in dark thread. The mouth MUST curve UPWARD to show a happy, smiling expression. NOT a "w", NOT a frown, NOT downturned, NOT a straight line. May include small whisker dots (3 tiny embroidered dots on each side of the muzzle).
   - BREED MARKINGS: For breeds with distinctive markings (eye patches, two-tone face, color splits), these are rendered as FLAT colored fabric applique pieces or dense flat embroidery fill in the user-selected secondary color (see COLOR SPECIFICATION). For example: beagle gets a brown patch over one eye area; husky gets a symmetrical face mask pattern; dalmatian gets flat black spots. These markings are clean-edged, graphic, and proportional to the flap size.

   IMPORTANT: The entire face design should look like a flat graphic illustration printed/stitched onto fabric. Imagine a cute dog face emoji or app icon rendered as machine embroidery — clean, bold, minimal, flat.

4. SNAP BUTTON (at face-flap bottom edge):
   A small silver metal snap button at the bottom-center of the face-flap, securing it to the body below. This is the main closure for the upper compartment.

5. LOWER BODY (below face-flap, ~4.5cm):
   The lower front section has TWO SMALL EMBROIDERED PAW PRINTS side by side — cute paw pad designs stitched flat in the user-selected accent color (see COLOR SPECIFICATION). Each paw print is a rounded arch/dome shape with small toe pad circles inside, all flat embroidery. This section covers the MAIN COMPARTMENT which has space for treats and extra items.

6. SMALL FABRIC PAW TABS (bottom):
   At the very bottom of the pouch, two VERY SMALL, SUBTLE flat fabric tabs (each roughly 1-1.5cm) extend slightly below the body edge — shaped like tiny simplified paw silhouettes in dark charcoal grey felt. These are small and understated, just peeking out from the bottom edge. They should NOT be large, chunky, or dangling — they are minimal decorative accents only.

7. RUBBER GROMMET (bottom center — MUST BE VISIBLE):
   A round rubber grommet hole at the very bottom center of the pouch where dark poop bags can be pulled through from the lower compartment. This grommet MUST be clearly visible in the photograph — it is a key functional feature of the product. It is a small round hole with a rubber rim, centered at the bottom.

TWO SEPARATE COMPARTMENTS:
The pouch has TWO distinct internal compartments separated by a horizontal seam/binding:
- UPPER COMPARTMENT: Accessed via the face-flap with snap button. Holds treats, keys, or small items.
- LOWER COMPARTMENT: Holds a poop bag roll. This compartment's zipper access is on the BACK only. Bags feed out through the rubber grommet at the bottom.

ZIPPER — MUST BE VISIBLE IN THIS PHOTO:
- The zipper is on the BACK of the pouch, running horizontally across the lower compartment area, wrapping slightly around to the sides.
- There is NO zipper on the front at all.
- The zipper provides access to load/replace the poop bag roll in the lower compartment.
- Because the camera angle is a 3/4 view (see PHOTOGRAPHY STYLE below), the SIDE of the pouch is visible, and the zipper wrapping around to the side MUST be clearly shown. The dark zipper pull tab should be visible on the side edge.

BACK PANEL:
- Clean flat back in the user-selected body color, ${materialDesc}
- A small embroidered dog silhouette logo (subtle, tonal, flat)
- Two vertical fabric belt-loop slots for threading onto a belt or bag strap
- The horizontal zipper for the lower bag compartment (wraps from back to sides)

BINDING/EDGE DETAIL:
- All raw edges of the pouch are finished with SUBTLE TONAL binding/piping — a neat narrow trim that runs around the perimeter of the body, the flap edges, and compartment seams.
- The binding color should be a SLIGHTLY DARKER shade of the main body color, or a neutral grey/taupe. It should BLEND with the body, not contrast against it.
- NEVER use a bright or saturated color (red, blue, green, orange, pink, etc.) for the binding/piping. It should be nearly invisible — just a clean finished edge.

MATERIALS AND COLORS (refer to COLOR SPECIFICATION above for exact user-selected colors):
- Main body material: ${materialDesc} — color as specified above
${data.flapColor ? `- Face flap base: ${data.flapColor}` : '- Face flap base: Same as main body'}
- Muzzle/snout applique: flat fabric, color as specified above
- Breed marking appliques/embroidery: secondary color as specified above, flat
- Eyes: FLAT black embroidered circles with tiny white highlight dot — NOT plastic, NOT 3D, NOT safety eyes
- Nose: flat embroidered shape, color as specified above
- Ears outer: secondary color as specified above
${data.earInnerColor ? '- Ears inner: color as specified above' : ''}
- Edge binding/piping: a subtle tone-on-tone shade slightly darker than the body (NOT a contrasting color — should nearly blend in)
- Hardware: Dark/brushed silver carabiner (spring hook), silver snap button, dark zipper pull
- Zipper: Dark tone (#5 nylon coil) — on the BACK only, wrapping to sides
- Small paw tabs at bottom: dark charcoal grey felt, very small and subtle
${data.liningColor ? `- Interior lining: ${data.liningColor}` : ''}

PHOTOGRAPHY STYLE:
- Clean, professional product photography on a PURE WHITE background
- Studio lighting: soft diffused key light from upper-left, subtle fill light
- Camera angle: 3/4 view from the FRONT-SIDE — showing the full cute face prominently, PLUS the side edge of the pouch where the zipper wraps around. Tilt slightly to also reveal the bottom where the rubber grommet is. The face should still be the hero of the shot, but the zipper on the side and grommet on the bottom must both be visible.
- Sharp focus, slight background depth-of-field blur
- Style: premium e-commerce / Kickstarter product shot — the kind you'd see on a high-end pet accessories brand
- The product should look PREMIUM, COMPACT, WELL-CRAFTED, and GIFTABLE
${data.dogName ? `- Custom product made for a dog named "${data.dogName}"` : ''}

CRITICAL CONSTRAINTS:
- THE FACE IS THE FLAP — they are the same piece. No separate plain flap over the face. No face hidden under a flap.
- ALL face embroidery is FLAT — flush with the fabric. NO raised elements, NO 3D elements, NO plastic eyes, NO safety eyes, NO bulging anything
- Eyes are FLAT solid black embroidered circles with a tiny white highlight dot — like a cute cartoon/emoji eye style
- The muzzle is a FLAT lighter-colored fabric applique piece sewn onto the face-flap
- The nose is a FLAT black embroidered shape
- The mouth is a simple FLAT embroidered line curving UPWARD (smile)
- The entire face looks like a FLAT GRAPHIC ILLUSTRATION — clean vector-art style rendered in embroidery thread
- Do NOT render the face as screen printing, a sewn-on circular patch/badge, or a medallion
- The face should look like a CUTE CARTOON DOG FACE — bold, graphic, kawaii/vector-illustration style
- NO text, watermarks, or branding visible anywhere
- NO human hands in the image
- Ears extend from the top corners — they break the rectangular silhouette
- Bottom paw tabs are VERY SMALL and SUBTLE — not chunky, not dangling, not prominent
- TWO compartments: upper (face-flap) and lower (back zipper)
- The product must look manufacturable and real — not fantastical
- Do NOT make it look like a plush toy or stuffed animal — it is a FUNCTIONAL POUCH with cute dog character
- NO ZIPPER on the front — the zipper is ONLY on the BACK, wrapping to sides (and must be visible from the 3/4 angle)
- The RUBBER GROMMET at the bottom center must be visible
- Show the binding/piping trim around edges — but it must be TONAL (same family as body color), NEVER bright or contrasting
- BODY COLOR: Use the exact user-selected body color from the COLOR SPECIFICATION section above. Do NOT default to white or cream.
- Ears extend to the SIDES from the top corners — small and practical, not oversized
- COLOR PALETTE RULE: The ONLY colors on this product should be: the user-selected colors (body, ears, markings, muzzle, nose), black (eyes, hardware), dark grey/charcoal (small paw tabs, zipper), and silver (hardware). Do NOT introduce any other colors like red, blue, green, orange, pink, teal, purple, or any bright/saturated hue anywhere on the product. NO decorative accent colors.`;
}

/**
 * Generate one image using a single model (no fallback chain for speed).
 */
async function generateOneImage(
  contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>,
  apiKey: string,
): Promise<{ imageBase64: string; mimeType: string } | null> {
  // Use the fastest reliable model only — no fallback chain
  const model = 'gemini-2.0-flash-exp-image-generation';
  console.log(`[ProductPreview] Generating with ${model}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000); // 90s hard timeout

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: contentParts }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ProductPreview] ${model} error (${response.status}):`, errorText.slice(0, 300));

      // If primary model fails, try one fallback
      console.log('[ProductPreview] Trying gemini-2.5-flash-image fallback');
      return await tryGeminiImageGen(contentParts, 'gemini-2.5-flash-image', apiKey);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        console.log(`[ProductPreview] Image generated successfully`);
        return {
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        };
      }
    }

    console.warn(`[ProductPreview] ${model} responded but no image — trying fallback`);
    return await tryGeminiImageGen(contentParts, 'gemini-2.5-flash-image', apiKey);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[ProductPreview] Generation timed out after 90s');
    } else {
      console.error(`[ProductPreview] ${model} exception:`, error);
    }
    // One fallback attempt
    console.log('[ProductPreview] Trying gemini-2.5-flash-image fallback after error');
    return await tryGeminiImageGen(contentParts, 'gemini-2.5-flash-image', apiKey);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequestData = await request.json();
    const {
      breedName,
      dogPhoto,
      dogPhotoMimeType,
      dogPhotos,
    } = body;

    if (!breedName) {
      return NextResponse.json(
        { error: 'Missing breed name' },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Apply defaults
    body.earStyle = body.earStyle || 'floppy';
    body.earSize = body.earSize || 'medium';
    body.primaryColor = body.primaryColor || '#D4A574';
    body.secondaryColor = body.secondaryColor || '#C4956A';
    body.accentColor = body.accentColor || '#8B7355';
    body.material = body.material || 'canvas';
    body.productSize = body.productSize || 'medium';
    body.dimensions = body.dimensions || { heightCm: 9.5, widthCm: 6.5, depthCm: 5.5 };
    body.breedName = body.breedName.replace(/-/g, ' ');

    // Build content parts — photos first, then text prompt
    const contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
    let photoCount = 0;

    if (dogPhotos && dogPhotos.length > 0) {
      for (const photo of dogPhotos) {
        if (photo.data && photo.mimeType) {
          contentParts.push({
            inlineData: { mimeType: photo.mimeType, data: photo.data },
          });
          photoCount++;
        }
      }
    } else if (dogPhoto && dogPhotoMimeType) {
      contentParts.push({
        inlineData: { mimeType: dogPhotoMimeType, data: dogPhoto },
      });
      photoCount = 1;
    }

    // Add reference diagram showing correct layout (face ON flap, zipper on back, grommet at bottom)
    const diagramBase64 = buildReferenceDiagram({
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      muzzleColor: body.muzzleColor,
      noseColor: body.noseColor,
      accentColor: body.accentColor,
      earStyle: body.earStyle,
    });
    contentParts.push({
      inlineData: { mimeType: 'image/svg+xml', data: diagramBase64 },
    });

    const prompt = buildProductPreviewPrompt(body, photoCount);
    // Prepend diagram reference to the prompt
    const diagramNote = `\n\nREFERENCE DIAGRAM: I've also attached an annotated layout diagram showing the correct product structure. The diagram clearly shows:\n- The FACE (eyes, nose, mouth) is ON the top flap — they are the same panel\n- The zipper runs HORIZONTALLY across the BACK\n- The rubber grommet hole is at the BOTTOM CENTER\nFollow this layout exactly. The diagram uses the user's chosen colors.\n`;
    contentParts.push({ text: diagramNote + prompt });

    // Always generate 1 image for speed (user can regenerate if they want another)
    console.log(`[ProductPreview] Generating 1 preview (${photoCount} reference photos)`);
    const result = await generateOneImage(contentParts, GEMINI_API_KEY);

    if (result) {
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Image generation failed. Please try again.' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Product preview generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Product preview generation failed' },
      { status: 500 }
    );
  }
}

/**
 * Try generating an image using a specific Gemini model (used as fallback)
 */
async function tryGeminiImageGen(
  contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>,
  model: string,
  apiKey: string
): Promise<{ imageBase64: string; mimeType: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: contentParts }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ProductPreview] ${model} error (${response.status}):`, errorText.slice(0, 300));
      return null;
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        console.log(`[ProductPreview] ${model} generated image successfully`);
        return {
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        };
      }
    }

    console.warn(`[ProductPreview] ${model} responded but no image in output`);
    return null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`[ProductPreview] ${model} timed out`);
    } else {
      console.error(`[ProductPreview] ${model} exception:`, error);
    }
    return null;
  }
}
