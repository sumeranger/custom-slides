#!/usr/bin/env python3
"""重生 mountain-ink 的三張「佔位底圖」（1920x1080 WebP）。

用法（在 themes/mountain-ink/ 下）：  python3 gen-placeholder-art.py assets

這些是**佔位圖**，不是最終資產：純程序化（多層 Catmull-Rom 山稜 + 高斯模糊
做遠近層次 + 霧帶 + 端點淡出），無版權問題，讓 scaffold / build / export 產線
能跑、版面能目測。要正式的水墨畫，用 AI 生圖工具產真圖覆蓋同名檔即可（構圖
規格見 tokens.css 的 SIGNATURE 一節：16:9、留白與墨的重心烘進圖裡）。

**改了主題的紙色（--surface / --paper-rgb）就要跑這支重生圖**，否則佔位圖的
底色會跟舞台差一階、露出色差。下面的 PAPER 常數要跟 tokens.css 的 --surface
一致。
"""
import math, random
from PIL import Image, ImageDraw, ImageFilter

W, H = 1920, 1080
PAPER = (251, 250, 246)   # 白宣紙 #FBFAF6


def ridge_points(x0, x1, base_y, amp, seed, n=9):
    """用幾個控制點做一條起伏山稜，回傳密集取樣點。"""
    rnd = random.Random(seed)
    ctrl = []
    for i in range(n + 1):
        t = i / n
        x = x0 + (x1 - x0) * t
        # 中間高、兩側低，加隨機起伏
        envelope = math.sin(math.pi * t) ** 0.7
        y = base_y - amp * envelope * (0.55 + 0.45 * rnd.random())
        ctrl.append((x, y))
    # Catmull-Rom 取樣成平滑曲線
    pts = []
    for i in range(len(ctrl) - 1):
        p0 = ctrl[max(i - 1, 0)]
        p1, p2 = ctrl[i], ctrl[i + 1]
        p3 = ctrl[min(i + 2, len(ctrl) - 1)]
        for s in range(24):
            t = s / 24
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t +
                       (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
                       (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t +
                       (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
                       (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            pts.append((x, y))
    pts.append(ctrl[-1])
    return pts


def hfade(size, x0, x1, fade=260):
    """水平淡出遮罩：讓山層在 x0/x1 端點溶進紙裡，不留垂直硬邊。
    端點若已在畫布外就不需要淡出（圖本來就會被 cover 裁掉）。"""
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    d.rectangle([x0, 0, x1, size[1]], fill=255)
    # 只對「落在畫布內」的端點做淡出
    if x0 > 0:
        for i in range(int(fade)):
            v = int(255 * (i / fade))
            d.line([(x0 + i, 0), (x0 + i, size[1])], fill=v)
    if x1 < size[0]:
        for i in range(int(fade)):
            v = int(255 * (i / fade))
            d.line([(x1 - i, 0), (x1 - i, size[1])], fill=v)
    return m


def draw_layer(size, x0, x1, base_y, amp, seed, ink, alpha, blur, fade=260):
    """畫一層山（回傳 RGBA layer）。"""
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    pts = ridge_points(x0, x1, base_y, amp, seed)
    poly = pts + [(x1, H + 50), (x0, H + 50)]
    d.polygon(poly, fill=ink + (alpha,))
    # 端點淡出：把 hfade 乘進 alpha 通道
    a = layer.getchannel("A")
    a = Image.composite(a, Image.new("L", size, 0), hfade(size, x0, x1, fade))
    layer.putalpha(a)
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    return layer


def mist_band(size, y, h, alpha, seed=0):
    band = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(band)
    d.rectangle([0, y, size[0], y + h], fill=PAPER + (alpha,))
    return band.filter(ImageFilter.GaussianBlur(h * 0.42))


def compose(layers):
    img = Image.new("RGBA", (W, H), PAPER + (255,))
    for l in layers:
        img = Image.alpha_composite(img, l)
    return img.convert("RGB")


# 墨色由遠到近：淡冷綠 → 濃墨綠
INKS = [
    (150, 168, 152),   # 最遠
    (118, 140, 120),
    (86, 110, 90),
    (58, 80, 62),
    (34, 50, 38),      # 最近
]

# ── 1. mi-full：滿版山水（封面/結尾）──────────────────────────────────
# 左上留白給標題 → 山稜重心壓在中下與右側
full = compose([
    draw_layer((W, H), -100, W + 100, 700, 300, 11, INKS[0], 95, 14),
    mist_band((W, H), 620, 130, 175),
    draw_layer((W, H), 200, W + 150, 790, 265, 23, INKS[1], 120, 9),
    mist_band((W, H), 730, 120, 160),
    draw_layer((W, H), -150, W * 0.75, 880, 185, 37, INKS[2], 130, 6),
    mist_band((W, H), 840, 110, 150),
    draw_layer((W, H), W * 0.42, W + 200, 985, 165, 51, INKS[3], 150, 4),
    draw_layer((W, H), -200, W * 0.55, 1065, 95, 67, INKS[4], 120, 3),
])

# ── 2. mi-ridge：中景山形靠右（扉頁）─────────────────────────────────
# 左三分之二必須幾乎全空
ridge = compose([
    draw_layer((W, H), W * 0.52, W + 140, 760, 285, 101, INKS[1], 105, 11),
    mist_band((W, H), 700, 120, 170),
    draw_layer((W, H), W * 0.60, W + 180, 880, 215, 113, INKS[2], 125, 7),
    mist_band((W, H), 830, 105, 155),
    draw_layer((W, H), W * 0.68, W + 220, 1000, 150, 127, INKS[3], 140, 4),
])

# ── 3. mi-far：極淡遠山右下（內容頁）──────────────────────────────────
# 左上三分之二完全乾淨；整體極淡、無深色重音
far = compose([
    draw_layer((W, H), W * 0.55, W + 160, 890, 175, 211, INKS[0], 90, 13),
    mist_band((W, H), 860, 110, 165),
    draw_layer((W, H), W * 0.64, W + 200, 985, 130, 223, INKS[1], 80, 9),
    mist_band((W, H), 960, 95, 150),
    draw_layer((W, H), W * 0.72, W + 240, 1055, 85, 233, INKS[2], 70, 6),
])

import sys
out = sys.argv[1] if len(sys.argv) > 1 else "assets"
for name, im, q in [("mi-full", full, 78), ("mi-ridge", ridge, 76), ("mi-far", far, 70)]:
    p = f"{out}/{name}.webp"
    im.save(p, "WEBP", quality=q, method=6)
    import os
    print(f"{p}: {os.path.getsize(p)/1024:.0f} KB")
