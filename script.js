function hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
  
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
  
    if (max === min) {
      h = s = 0; // Achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h = Math.round(h * 60);
    }
  
    s = Math.round(s * 100);
    l = Math.round(l * 100);
  
    return { H: h, S: s, L: l };
  }
  
  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
  
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;
  
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
  
    r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    b = Math.round((b + m) * 255).toString(16).padStart(2, '0');
  
    return `#${r}${g}${b}`;
  }
  
  function averageHSL(lockedColors) {
    const avgH = lockedColors.reduce((sum, c) => sum + c.H, 0) / lockedColors.length;
    const avgS = lockedColors.reduce((sum, c) => sum + c.S, 0) / lockedColors.length;
    const avgL = lockedColors.reduce((sum, c) => sum + c.L, 0) / lockedColors.length;
    return { H: avgH, S: avgS, L: avgL };
  }
  
  function generateMonochromaticPalette(lockedHexColors, totalColors) {
    const lockedHSLColors = lockedHexColors.map(hex => hexToHSL(hex));
    
    // Calculate base hue, saturation, and lightness
    const baseColor = lockedHSLColors.length === 1 
      ? lockedHSLColors[0] 
      : averageHSL(lockedHSLColors);
  
    const colors = [...lockedHSLColors];
    const colorsNeeded = totalColors - lockedHSLColors.length;
  
    if (colorsNeeded <= 0) {
      // Return early if no additional colors are needed
      return colors.map(color => hslToHex(color.H, color.S, color.L));
    }
  
    // Use easing functions to create smooth variations
    const easingFunctions = [
      x => x, // Linear
      x => x * x, // Ease-in
      x => x * (2 - x), // Ease-out
      x => x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x, // Ease-in-out
    ];
    const sEasing = easingFunctions[Math.floor(Math.random() * easingFunctions.length)];
    const lEasing = easingFunctions[Math.floor(Math.random() * easingFunctions.length)];
    const hEasing = easingFunctions[Math.floor(Math.random() * easingFunctions.length)];
  
    // Define variation ranges
    const sVariation = 30; // Up to ±30% saturation variation
    const lVariation = 30; // Up to ±30% lightness variation
    const hVariation = 10; // Up to ±10° hue variation for uniqueness
  
    for (let i = 1; i <= colorsNeeded; i++) {
      const t = colorsNeeded > 1 ? i / (colorsNeeded + 1) : 0.5; // Normalize t between 0 and 1
  
      // Apply easing functions
      const easedS = sEasing(t);
      const easedL = lEasing(t);
      const easedH = hEasing(t);
  
      // Adjust saturation and lightness with variation
      const S = clamp(
        baseColor.S * (1 - sVariation / 100 * (1 - easedS)),
        0,
        100
      );
      const L = clamp(
        baseColor.L * (1 + lVariation / 100 * (easedL - 0.5) * 2),
        0,
        100
      );
  
      // Introduce slight hue variation for uniqueness
      const H = (baseColor.H + hVariation * (easedH - 0.5) * 2 + 360) % 360;
  
      colors.push({ H, S, L });
    }
  
    // Ensure we have exactly totalColors by slicing if necessary
    return colors.slice(0, totalColors).map(color => hslToHex(color.H, color.S, color.L));
  }
  
  // Helper function to clamp values between min and max
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  
function generateAnalogousPalette(lockedHexColors, totalColors) {
  const lockedHSLColors = lockedHexColors.map(hex => hexToHSL(hex));
  
  // Calculate base hue, saturation, and lightness
  const baseColor = lockedHSLColors.length === 1 
    ? lockedHSLColors[0] 
    : averageHSL(lockedHSLColors);

  const colors = [...lockedHSLColors];
  const colorsNeeded = totalColors - lockedHSLColors.length;

  if (colorsNeeded <= 0) {
    // Return early if no additional colors are needed
    return colors.map(color => hslToHex(color.H, color.S, color.L));
  }

  const angleOffset = 30; // Total angle to cover for analogous colors
  const totalSteps = Math.max(colorsNeeded, 2); // Ensure at least 2 steps
  const halfSteps = Math.ceil(totalSteps / 2);

  // Use easing functions to vary saturation and lightness
  const easingFunctions = [
    x => x, // Linear
    x => x * x, // Ease-in
    x => x * (2 - x), // Ease-out
    x => x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x, // Ease-in-out
  ];
  const sEasing = easingFunctions[Math.floor(Math.random() * easingFunctions.length)];
  const lEasing = easingFunctions[Math.floor(Math.random() * easingFunctions.length)];

  // Define variation ranges
  const sVariation = 20; // Up to ±20% saturation variation
  const lVariation = 20; // Up to ±20% lightness variation

  for (let i = 1; i <= halfSteps; i++) {
    const t = halfSteps > 1 ? i / (halfSteps + 1) : 0.5; // Normalize t between 0 and 1

    // Calculate hue offsets
    const offset = (angleOffset / halfSteps) * i;
    const hues = [
      (baseColor.H + offset) % 360,
      (baseColor.H - offset + 360) % 360,
    ];

    // Apply easing functions
    const easedS = sEasing(t);
    const easedL = lEasing(t);

    hues.forEach(hue => {
      if (colors.length < totalColors) {
        // Adjust saturation and lightness with variation
        const S = clamp(
          baseColor.S * (1 - sVariation / 100 * (1 - easedS)),
          0,
          100
        );
        const L = clamp(
          baseColor.L * (1 + lVariation / 100 * (easedL - 0.5) * 2),
          0,
          100
        );

        colors.push({ H: hue, S, L });
      }
    });
  }

  // If still not enough colors, generate additional colors using random harmonious logic
  while (colors.length < totalColors) {
    // Generate a random hue within the analogous range
    const randomOffset = (Math.random() * angleOffset * 2 - angleOffset);
    const H = (baseColor.H + randomOffset + 360) % 360;

    // Randomly adjust saturation and lightness
    const S = clamp(baseColor.S + (Math.random() * sVariation * 2 - sVariation), 0, 100);
    const L = clamp(baseColor.L + (Math.random() * lVariation * 2 - lVariation), 0, 100);

    colors.push({ H, S, L });
  }

  // Ensure we have exactly totalColors by slicing if necessary
  return colors.slice(0, totalColors).map(color => hslToHex(color.H, color.S, color.L));
}

// Helper function to clamp values between min and max
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

  
  function generateComplementaryPalette(lockedColor, totalColors) {
    const colors = [lockedColor];
    const complementaryHue = (lockedColor.H + 180) % 360;
    const variations = Math.floor((totalColors - 1) / 2);
  
    for (let i = 1; i <= variations; i++) {
      const factor = i / (variations + 1);
      colors.push({
        H: lockedColor.H,
        S: lockedColor.S * (1 - factor * 0.5),
        L: lockedColor.L * (1 + factor * 0.5),
      });
      colors.push({
        H: complementaryHue,
        S: lockedColor.S * (1 - factor * 0.5),
        L: lockedColor.L * (1 + factor * 0.5),
      });
    }
  
    return colors.slice(0, totalColors).map(color => hslToHex(color.H, color.S, color.L));
  }
  
  function generateSplitComplementaryPalette(lockedColor, totalColors) {
    const colors = [lockedColor];
    const hues = [
      (lockedColor.H + 150) % 360,
      (lockedColor.H + 210) % 360,
    ];
    const variations = Math.ceil((totalColors - 1) / hues.length);
    hues.forEach(hue => {
      for (let i = 1; i <= variations; i++) {
        const factor = i / (variations + 1);
        colors.push({
          H: hue,
          S: lockedColor.S * (1 - factor * 0.3),
          L: lockedColor.L * (1 + factor * 0.3),
        });
        if (colors.length >= totalColors) break;
      }
    });
    return colors.slice(0, totalColors).map(color => hslToHex(color.H, color.S, color.L));
  }
  
  function generateTriadicPalette(lockedColor, totalColors) {
    const colors = [lockedColor];
    const hues = [
      (lockedColor.H + 120) % 360,
      (lockedColor.H + 240) % 360,
    ];
    const variations = Math.ceil((totalColors - 1) / hues.length);
    hues.forEach(hue => {
      for (let i = 1; i <= variations; i++) {
        const factor = i / (variations + 1);
        colors.push({
          H: hue,
          S: lockedColor.S * (1 - factor * 0.3),
          L: lockedColor.L * (1 + factor * 0.3),
        });
        if (colors.length >= totalColors) break;
      }
    });
    return colors.slice(0, totalColors).map(color => hslToHex(color.H, color.S, color.L));
  }
  
  function generateSquarePalette(lockedColor, totalColors) {
    const colors = [lockedColor];
    const hues = [
      lockedColor.H,
      (lockedColor.H + 90) % 360,
      (lockedColor.H + 180) % 360,
      (lockedColor.H + 270) % 360,
    ];
    const variations = Math.ceil((totalColors - 1) / hues.length);
    hues.forEach(hue => {
      for (let i = 1; i <= variations; i++) {
        const factor = i / (variations + 1);
        colors.push({
          H: hue,
          S: lockedColor.S * (1 - factor * 0.2),
          L: lockedColor.L * (1 + factor * 0.2),
        });
        if (colors.length >= totalColors) break;
      }
    });
    return colors.slice(0, totalColors).map(color => hslToHex(color.H, color.S, color.L));
  }
  
  function generateTetradicPalette(lockedColor, totalColors) {
    const colors = [lockedColor];
    const hues = [
      (lockedColor.H + 60) % 360,
      (lockedColor.H + 180) % 360,
      (lockedColor.H + 240) % 360,
    ];
    const variations = Math.ceil((totalColors - 1) / hues.length);
    hues.forEach(hue => {
      for (let i = 1; i <= variations; i++) {
        const factor = i / (variations + 1);
        colors.push({
          H: hue,
          S: lockedColor.S * (1 - factor * 0.2),
          L: lockedColor.L * (1 + factor * 0.2),
        });
        if (colors.length >= totalColors) break;
      }
    });
    return colors.slice(0, totalColors).map(color => hslToHex(color.H, color.S, color.L));
  }
  
  function generateRandomHarmoniousPalette(lockedColors, totalColors) {
    const colors = [...lockedColors];
    const colorsNeeded = totalColors - lockedColors.length;
  
    // Return early if no additional colors are needed
    if (colorsNeeded <= 0) return colors.map(color => hslToHex(color.H, color.S, color.L));
  
    // Calculate average H, S, L from locked colors
    const avgH = lockedColors.reduce((sum, c) => sum + c.H, 0) / lockedColors.length;
    const avgS = lockedColors.reduce((sum, c) => sum + c.S, 0) / lockedColors.length;
    const avgL = lockedColors.reduce((sum, c) => sum + c.L, 0) / lockedColors.length;
  
    let hStart, hueVariation, sRange, lRange;
  
    // Adjust parameters based on average lightness
    if (avgL > 80 || avgL < 20) {
      // For very light or very dark colors, generate vivid and contrasting colors
      hStart = Math.random() * 360; // Start at a random hue
      hueVariation = 360; // Full hue range for diversity
  
      sRange = [70, 100]; // High saturation for vivid colors
      lRange = [40, 60];  // Medium lightness for contrast
    } else {
      // Regular behavior for average lightness
      hStart = avgH;
      const hCycles = Math.random() * 2 + 0.5; // Between 0.5 to 2.5 hue cycles
      hueVariation = 360 * hCycles; // Total hue change
  
      // Controlled random variations around the average saturation and lightness
      sRange = [
        Math.max(0, avgS - Math.random() * 30),
        Math.min(100, avgS + Math.random() * 30),
      ].sort((a, b) => a - b);
  
      lRange = [
        Math.max(0, avgL - Math.random() * 30),
        Math.min(100, avgL + Math.random() * 30),
      ].sort((a, b) => a - b);
  
      // Occasionally vary saturation significantly for unexpected combinations
      if (Math.random() < 0.3) { // 30% chance
        sRange = [0, 100]; // Full saturation range
      }
    }
  
    // Randomly select easing functions for H, S, and L
    const easingFunctions = [
      x => x, // Linear
      x => x * x, // Quadratic ease-in
      x => x * (2 - x), // Quadratic ease-out
      x => x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x, // Quadratic ease-in-out
      x => x ** 3, // Cubic ease-in
      x => 1 - (1 - x) ** 3, // Cubic ease-out
      x => x < 0.5 ? 4 * x ** 3 : 1 - ((-2 * x + 2) ** 3) / 2, // Cubic ease-in-out
    ];
    const hEasing = easingFunctions[Math.floor(Math.random() * easingFunctions.length)];
    const sEasing = easingFunctions[Math.floor(Math.random() * easingFunctions.length)];
    const lEasing = easingFunctions[Math.floor(Math.random() * easingFunctions.length)];
  
    // Generate new colors
    for (let i = 0; i < colorsNeeded; i++) {
      // Calculate normalized position t in the sequence (0 to 1)
      const t = colorsNeeded > 1 ? i / (colorsNeeded - 1) : 0.5;
  
      // Apply easing functions to t
      const easedH = hEasing(t);
      const easedS = sEasing(t);
      const easedL = lEasing(t);
  
      // Calculate hue with cycles and ensure it stays within 0-360°
      const H = (hStart + hueVariation * easedH) % 360;
  
      // Interpolate saturation and lightness within their ranges
      const S = sRange[0] + (sRange[1] - sRange[0]) * easedS;
      const L = lRange[0] + (lRange[1] - lRange[0]) * easedL;
  
      // Add the generated color to the palette
      colors.push({ H, S, L });
    }
  
    // Convert HSL to HEX and return the final palette
    return colors.slice(0, totalColors).map(color => hslToHex(color.H, color.S, color.L));
  }
  
  
  
  
  function generatePalette(lockedHexColors, totalColors, harmony) {
    const lockedHSLColors = lockedHexColors.map(hex => hexToHSL(hex));
    const baseColor = lockedHSLColors.length === 1 
      ? lockedHSLColors[0] 
      : averageHSL(lockedHSLColors);
  
    switch (harmony) {
      case 'monochromatic':
        return generateMonochromaticPalette(lockedHexColors, totalColors);
      case 'analogous':
        return generateAnalogousPalette(baseColor, totalColors);
      case 'complementary':
        return generateComplementaryPalette(baseColor, totalColors);
      case 'splitComplementary':
        return generateSplitComplementaryPalette(baseColor, totalColors);
      case 'triadic':
        return generateTriadicPalette(baseColor, totalColors);
      case 'square':
        return generateSquarePalette(baseColor, totalColors);
      case 'tetradic':
        return generateTetradicPalette(baseColor, totalColors);
      case 'random':
        return generateRandomHarmoniousPalette(lockedHSLColors, totalColors);
      default:
        return [];
    }
  }
  
  document.getElementById('generateBtn').addEventListener('click', () => {
    const hexInput = document.getElementById('hexInput').value;
    const hexColors = hexInput.split(',').map(hex => hex.trim());
    const totalColors = parseInt(document.getElementById('totalColors').value, 10);
    const harmony = document.getElementById('harmonySelect').value;
  
    const palette = generatePalette(hexColors, totalColors, harmony);
  
    const paletteContainer = document.getElementById('palette');
    paletteContainer.innerHTML = '';
  
    palette.forEach(hex => {
      const colorDiv = document.createElement('div');
      colorDiv.style.backgroundColor = hex;
      paletteContainer.appendChild(colorDiv);
    });
  });
  