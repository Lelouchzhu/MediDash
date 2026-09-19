#!/usr/bin/env python3
"""Turn pink/blue LIS table bands into white so Tesseract can read those rows."""
import sys
import numpy as np
from PIL import Image

src, dest = sys.argv[1], sys.argv[2]
image = Image.open(src).convert("RGB")
image.thumbnail((2000, 2200))
arr = np.asarray(image).astype(np.uint16)
r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
max_c = np.maximum(np.maximum(r, g), b)
min_c = np.minimum(np.minimum(r, g), b)
pink = (r > 180) & (b > 160) & (g > 120) & (r + b > g * 1.55) & (max_c - min_c < 100)
blue = (b > 180) & (b > r) & (g < 230)
y = 0.299 * r + 0.587 * g + 0.114 * b
out = np.where(y < 145, 0, 255).astype(np.uint8)
out = np.where(pink | blue, 255, out)
Image.fromarray(np.stack([out, out, out], axis=2)).save(dest)
