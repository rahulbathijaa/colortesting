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
    const baseColor = lockedHSLColors.length === 1 
      ? lockedHSLColors[0] 
      : averageHSL(lockedHSLColors);
  
    const colors = [...lockedHSLColors];
    const variations = totalColors - lockedHSLColors.length;
  
    for (let i = 1; i <= variations; i++) {
      const factor = i / (variations + 1);
      const newColor = {
        H: baseColor.H,
        S: baseColor.S * (1 - factor * 0.5),
        L: baseColor.L * (1 + factor * 0.5),
      };
      colors.push(newColor);
    }
  
    return colors.map(color => hslToHex(color.H, color.S, color.L));
  }
  
  function generateAnalogousPalette(lockedColor, totalColors) {
    const colors = [lockedColor];
    const angleOffset = 30;
    const steps = Math.ceil((totalColors - 1) / 2);
  
    for (let i = 1; i <= steps; i++) {
      const offset = (angleOffset / steps) * i;
      const hues = [
        (lockedColor.H + offset) % 360,
        (lockedColor.H - offset + 360) % 360,
      ];
      hues.forEach(hue => {
        if (colors.length < totalColors) {
          colors.push({ H: hue, S: lockedColor.S, L: lockedColor.L });
        }
      });
    }
  
    return colors.map(color => hslToHex(color.H, color.S, color.L));
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
    if (colorsNeeded <= 0) return colors.map(color => hslToHex(color.H, color.S, color.L));
  
    // Calculate average H, S, L from locked colors
    const avgH = lockedColors.reduce((sum, c) => sum + c.H, 0) / lockedColors.length;
    const avgS = lockedColors.reduce((sum, c) => sum + c.S, 0) / lockedColors.length;
    const avgL = lockedColors.reduce((sum, c) => sum + c.L, 0) / lockedColors.length;
  
    // Randomize key parameters within controlled ranges
    const hStart = avgH;
    const hCycles = Math.random() * 2 + 0.5; // Allows between 0.5 to 2.5 hue cycles
    const hueVariation = 360 * hCycles; // Total hue change
  
    const sRange = [
      Math.max(0, avgS - Math.random() * 30), // Lower saturation limit
      Math.min(100, avgS + Math.random() * 30), // Upper saturation limit
    ].sort((a, b) => a - b);
  
    const lRange = [
      Math.max(0, avgL - Math.random() * 30), // Lower lightness limit
      Math.min(100, avgL + Math.random() * 30), // Upper lightness limit
    ].sort((a, b) => a - b);
  
    // Randomly select easing functions
    const easingFunctions = [
      x => x, // Linear
      x => x * x, // Quadratic ease-in
      x => x * (2 - x), // Quadratic ease-out
      x => x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x, // Quadratic ease-in-out
      x => Math.pow(x, 3), // Cubic ease-in
      x => 1 - Math.pow(1 - x, 3), // Cubic ease-out
      x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, // Cubic ease-in-out
    ];
    const hEasing = easingFunctions[Math.floor(Math.random() * easingFunctions.length)];
    const sEasing = easingFunctions[Math.floor(Math.random() * easingFunctions.length)];
    const lEasing = easingFunctions[Math.floor(Math.random() * easingFunctions.length)];
  
    // Generate colors
    for (let i = 0; i < colorsNeeded; i++) {
      const t = colorsNeeded > 1 ? i / (colorsNeeded - 1) : 0.5; // Normalize t between 0 and 1
      const easedH = hEasing(t);
      const easedS = sEasing(t);
      const easedL = lEasing(t);
  
      // Calculate hue with cycles
      const H = (hStart + hueVariation * easedH) % 360;
  
      // Interpolate saturation and lightness
      const S = sRange[0] + (sRange[1] - sRange[0]) * easedS;
      const L = lRange[0] + (lRange[1] - lRange[0]) * easedL;
  
      colors.push({ H, S, L });
    }
  
    // Convert HSL to HEX
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
  