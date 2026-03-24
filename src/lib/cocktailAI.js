function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function pick(arr, seed) {
  const idx = Math.abs(seed) % arr.length;
  return arr[idx];
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h | 0;
}

export async function analyzeImageFile(file) {
  if (!file) return null;
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const target = 64;
  const scale = target / Math.max(img.width, img.height);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  const { data } = ctx.getImageData(0, 0, w, h);
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 16) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count += 1;
  }
  if (!count) count = 1;
  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const warm = (r - b) / 255;
  const saturation = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;

  const moodTags = [];
  if (brightness > 0.68) moodTags.push('상큼', '가벼움');
  else if (brightness < 0.38) moodTags.push('딥', '무게감');
  else moodTags.push('균형', '편안');

  if (warm > 0.12) moodTags.push('따뜻', '스파이스');
  else if (warm < -0.12) moodTags.push('쿨', '청량');

  if (saturation > 0.35) moodTags.push('과일', '생동');
  else moodTags.push('클린', '미니멀');

  return {
    dataUrl,
    avgRgb: { r, g, b },
    features: { brightness, warm, saturation },
    moodTags: Array.from(new Set(moodTags)).slice(0, 6),
  };
}

export function generateCocktail({ preferences, imageAnalysis }) {
  const pref = preferences ?? {};
  const mood = imageAnalysis?.moodTags ?? [];
  const rgb = imageAnalysis?.avgRgb ?? { r: 180, g: 150, b: 130 };
  const seed = hashString(
    JSON.stringify({
      base: pref.baseSpirit,
      abv: pref.abvTarget,
      sweet: pref.sweetness,
      sour: pref.sourness,
      bitter: pref.bitterness,
      sparkling: pref.sparkling,
      mood,
      rgb,
    }),
  );

  const baseSpirit = pref.baseSpirit || pick(['진', '보드카', '럼', '테킬라', '위스키'], seed);
  const style = pick(
    [
      '하이볼',
      '사워',
      '마티니',
      '콜린스',
      '스피릿 포워드',
      '스파클링',
      '크리미',
    ],
    seed + 11,
  );

  const nameLeft = pick(
    ['Mood', 'Velvet', 'Citrus', 'Midnight', 'Sunset', 'Breeze', 'Berry', 'Spice'],
    seed + 101,
  );
  const nameRight = pick(
    ['on the Rocks', 'Bloom', 'Tonic', 'Whisper', 'Highball', 'Sour', 'Martini', 'Fizz'],
    seed + 202,
  );
  const cocktailName = `${nameLeft} ${nameRight}`;

  const sweetness = clamp(Number(pref.sweetness ?? 3), 1, 5);
  const sourness = clamp(Number(pref.sourness ?? 3), 1, 5);
  const bitterness = clamp(Number(pref.bitterness ?? 2), 1, 5);
  const sparkling = Boolean(pref.sparkling);
  const abvTarget = clamp(Number(pref.abvTarget ?? 18), 0, 60);

  const citrus = pick(['레몬', '라임', '자몽'], seed + 33);
  const sweetener = pick(['심플 시럽', '꿀 시럽', '아가베 시럽', '바닐라 시럽'], seed + 44);
  const bitterAgent = pick(['앙고스투라 비터', '오렌지 비터', '아로마틱 비터'], seed + 55);
  const accent = pick(['생강', '로즈마리', '바질', '피치', '블랙베리', '유자'], seed + 66);
  const topper = sparkling ? pick(['토닉 워터', '소다', '진저에일'], seed + 77) : null;

  const spiritMl = clamp(Math.round(30 + abvTarget * 1.2), 30, 75);
  const citrusMl = clamp(Math.round(10 + sourness * 4), 10, 35);
  const syrupMl = clamp(Math.round(5 + sweetness * 4 - sourness * 1), 5, 25);
  const bitterDash = clamp(Math.round(1 + bitterness / 2), 1, 3);
  const topperMl = topper ? clamp(Math.round(60 + (5 - sweetness) * 10), 60, 150) : 0;

  const glass = pick(
    ['하이볼 글라스', '쿠페 글라스', '락 글라스', '마티니 글라스', '콜린스 글라스'],
    seed + 88,
  );
  const garnish = pick(
    [`${citrus} 필`, `${accent} 잎`, '드라이 과일', '시나몬 스틱', '라임 휠'],
    seed + 99,
  );

  const colorA = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const colorB = `rgb(${clamp(rgb.r + 35, 0, 255)}, ${clamp(rgb.g - 15, 0, 255)}, ${clamp(
    rgb.b + 45,
    0,
    255,
  )})`;

  const ingredients = [
    { name: baseSpirit, amount: `${spiritMl} ml` },
    { name: `${citrus} 주스`, amount: `${citrusMl} ml` },
    { name: sweetener, amount: `${syrupMl} ml` },
    { name: accent, amount: '약간' },
    { name: bitterAgent, amount: `${bitterDash} dash` },
  ];
  if (topper) ingredients.push({ name: topper, amount: `${topperMl} ml` });

  const steps = [];
  if (style === '스피릿 포워드' || style === '마티니') {
    steps.push('믹싱 글라스에 얼음을 채운 뒤 재료(토퍼 제외)를 넣는다.');
    steps.push('20초 정도 충분히 저어 차갑게 만든다.');
    steps.push(`${glass}에 스트레이닝한다.`);
  } else {
    steps.push('셰이커에 얼음을 채운 뒤 재료(토퍼 제외)를 넣는다.');
    steps.push('10–12초 셰이크한다.');
    steps.push(`${glass}에 얼음을 채우고 스트레이닝한다.`);
  }
  if (topper) steps.push(`${topper}로 탑업한 뒤 한 번 가볍게 젓는다.`);
  steps.push(`${garnish}로 가니시한다.`);

  const description = [
    ...mood.slice(0, 3),
    pick(['밸런스', '향', '여운'], seed + 303),
  ]
    .filter(Boolean)
    .join(' · ');

  const recipe = {
    name: cocktailName,
    style: `${baseSpirit} 베이스 ${style}`,
    description,
    glass,
    garnish,
    moodTags: mood,
    preferences: {
      baseSpirit,
      abvTarget,
      sweetness,
      sourness,
      bitterness,
      sparkling,
      notes: pref.notes || '',
    },
    ingredients,
    steps,
  };

  return {
    recipe,
    palette: { colorA, colorB },
  };
}

export function renderCocktailCardDataUrl({ title, subtitle, palette, moodTags }) {
  const canvas = document.createElement('canvas');
  const w = 900;
  const h = 600;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const roundRect = (x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, r);
      return;
    }
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  };

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, palette.colorA);
  grad.addColorStop(1, palette.colorB);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  roundRect(48, 48, w - 96, h - 96, 28);
  ctx.fill();

  // Glass silhouette
  ctx.save();
  ctx.translate(w * 0.72, h * 0.56);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-90, -150);
  ctx.lineTo(-60, 140);
  ctx.quadraticCurveTo(0, 170, 60, 140);
  ctx.lineTo(90, -150);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = '700 54px Pretendard, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText(String(title).slice(0, 28), 92, 170);

  ctx.fillStyle = 'rgba(255,255,255,0.86)';
  ctx.font = '500 28px Pretendard, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText(String(subtitle).slice(0, 46), 92, 220);

  const tags = (moodTags ?? []).slice(0, 6);
  let x = 92;
  let y = 280;
  ctx.font = '600 22px Pretendard, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  for (const t of tags) {
    const text = `#${t}`;
    const metrics = ctx.measureText(text);
    const padX = 14;
    const bw = metrics.width + padX * 2;
    if (x + bw > w - 92) {
      x = 92;
      y += 54;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    roundRect(x, y - 26, bw, 40, 999);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(text, x + padX, y);
    x += bw + 12;
  }

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '500 18px Pretendard, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText('Mood on the Rocks · Prototype', 92, h - 88);

  return canvas.toDataURL('image/png');
}

