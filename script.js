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
    
  function generateRandomHarmoniousPalette(lockedColors, totalColors) {
    let colors = [];
  
    // If there are locked colors, add them to the colors array
    if (lockedColors && lockedColors.length > 0) {
      colors = [...lockedColors];
    }
  
    const colorsNeeded = totalColors - colors.length;
  
    // Return early if no additional colors are needed
    if (colorsNeeded <= 0) {
      return colors.map(color => hslToHex(color.H, color.S, color.L));
    }
  
    // Random starting hue between 0 and 360
    const hStart = Math.random() * 360;
  
    // hStartCenter is set to 0.5 to center the hue changes
    const hStartCenter = 0.5;
  
    // Random number of hue cycles between 0 and 1
    const hCycles = Math.random();
  
    // Hue variation based on hCycles
    const hueVariation = 360 * hCycles;
  
    // Saturation range is narrow to ensure vivid colors
    const sMin = 90 + Math.random() * 5; // Between 90% and 95%
    const sMax = 95 + Math.random() * 5; // Between 95% and 100%
    const sRange = [sMin, sMax].map(s => clamp(s, 0, 100));
  
    // Lightness range adjusted to prevent multiple whites
    const lMin = 20 + Math.random() * 10;  // Between 20% and 30%
    const lMax = 90; // Set maximum lightness to 90% to avoid multiple whites
    const lRange = [lMin, lMax];
  
    // Easing functions
    const hEasing = x => x; // Linear for hue
    const sEasing = x => x < 0.5 ? 4 * x ** 3 : 1 - ((-2 * x + 2) ** 3) / 2; // Cubic ease-in-out
    const lEasing = x => -(Math.cos(Math.PI * x) - 1) / 2; // Cosine easing
  
    // Generate new colors
    for (let i = 0; i < colorsNeeded; i++) {
      // Calculate normalized position t in the sequence (0 to 1)
      const t = colorsNeeded > 1 ? i / (colorsNeeded - 1) : 0.5;
  
      // Apply easing functions to t
      const easedH = hEasing(t);
      const easedS = sEasing(t);
      const easedL = lEasing(t);
  
      // Calculate hue
      const H = (hStart + hueVariation * (easedH - hStartCenter) + 360) % 360;
  
      // Interpolate saturation and lightness within their ranges
      const S = sRange[0] + (sRange[1] - sRange[0]) * easedS;
      let L = lRange[0] + (lRange[1] - lRange[0]) * easedL;
  
      // Clamp lightness to prevent it from exceeding lMax
      L = clamp(L, lMin, lMax);
  
      colors.push({ H, S, L });
    }
  
    // Post-process to ensure only one color is very light (L >= 90%)
    const whiteThreshold = 90; // Lightness threshold for "white" colors
    const whiteColors = colors.filter(color => color.L >= whiteThreshold);
  
    if (whiteColors.length > 1) {
      // Sort colors by lightness in descending order
      colors.sort((a, b) => b.L - a.L);
  
      // Keep the lightest color as is and adjust others
      for (let i = 1; i < colors.length; i++) {
        if (colors[i].L >= whiteThreshold) {
          colors[i].L = whiteThreshold - 5; // Reduce lightness to avoid being "white"
        } else {
          break; // No more white colors
        }
      }
    }
  
    // Convert HSL to HEX and return the final palette
    return colors.slice(0, totalColors).map(color => hslToHex(color.H, color.S, color.L));
  }
  
  // Helper function to clamp values between min and max
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  

  
  function generatePalette(lockedHexColors, totalColors, harmony) {
    const lockedHSLColors = lockedHexColors.map(hex => hexToHSL(hex));
    const baseColor = lockedHSLColors.length === 1 
      ? lockedHSLColors[0] 
      : averageHSL(lockedHSLColors);
  
    switch (harmony) {
      case 'random':
        return generateRandomHarmoniousPalette(lockedHSLColors, totalColors);
      default:
        return [];
    }
  }
  
  document.getElementById('generateBtn').addEventListener('click', () => {
    const hexInput = document.getElementById('hexInput').value;
    const hexColors = hexInput
      .split(',')
      .map(hex => hex.trim())
      .filter(hex => hex !== ''); // Filter out empty strings
  
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
  
  