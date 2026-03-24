import { useEffect, useMemo, useRef, useState } from 'react';
import {
  analyzeImageFile,
  generateCocktail,
  renderCocktailCardDataUrl,
} from '../lib/cocktailAI';

const defaultPrefs = {
  baseSpirit: '',
  abvTarget: 18,
  sweetness: 3,
  sourness: 3,
  bitterness: 2,
  sparkling: true,
  notes: '',
};

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatRecipeText(recipe) {
  const lines = [];
  lines.push(recipe.name);
  lines.push(`${recipe.style}`);
  lines.push('');
  if (recipe.description) lines.push(`한줄 소개: ${recipe.description}`);
  lines.push(`글라스: ${recipe.glass}`);
  lines.push(`가니시: ${recipe.garnish}`);
  if (recipe.moodTags?.length) lines.push(`무드: ${recipe.moodTags.map((t) => `#${t}`).join(' ')}`);
  lines.push('');
  lines.push('재료');
  for (const ing of recipe.ingredients ?? []) lines.push(`- ${ing.name}: ${ing.amount}`);
  lines.push('');
  lines.push('제조');
  (recipe.steps ?? []).forEach((s, idx) => lines.push(`${idx + 1}. ${s}`));
  return lines.join('\n');
}

const MainPage = () => {
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(0); // 0 입력, 1 결과, 2 수정, 3 전달
  const [busy, setBusy] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [generated, setGenerated] = useState(null);
  const [editedRecipe, setEditedRecipe] = useState(null);
  const [bartenderMemo, setBartenderMemo] = useState('');
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);

  const previewUrl = useMemo(() => {
    if (!imageFile) return '';
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const canGenerate = Boolean(imageFile) || prefs.notes.trim().length > 0 || prefs.baseSpirit;

  const payload = useMemo(() => {
    if (!generated || !editedRecipe) return null;
    return {
      createdAt: new Date().toISOString(),
      sourceImage: imageAnalysis?.dataUrl ?? null,
      generatedImage: generated.cardDataUrl ?? null,
      recipe: editedRecipe,
      bartenderMemo: bartenderMemo.trim(),
    };
  }, [generated, editedRecipe, imageAnalysis, bartenderMemo]);

  const showToast = (msg) => {
    setToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(''), 2200);
  };

  const onPickFile = async (file) => {
    setImageFile(file || null);
    setGenerated(null);
    setEditedRecipe(null);
    setImageAnalysis(null);
    if (!file) return;
    setBusy(true);
    try {
      const analysis = await analyzeImageFile(file);
      setImageAnalysis(analysis);
    } finally {
      setBusy(false);
    }
  };

  const onGenerate = async () => {
    setBusy(true);
    try {
      const { recipe, palette } = generateCocktail({ preferences: prefs, imageAnalysis });
      const cardDataUrl = renderCocktailCardDataUrl({
        title: recipe.name,
        subtitle: recipe.style,
        palette,
        moodTags: recipe.moodTags,
      });
      const next = { recipe, palette, cardDataUrl };
      setGenerated(next);
      setEditedRecipe(recipe);
      setStep(1);
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('클립보드에 복사했어요.');
    } catch {
      showToast('복사에 실패했어요. 다운로드를 사용해 주세요.');
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="brand">Mood on the Rocks</div>
          <div className="subtitle">AI 기반 칵테일 큐레이션 · 프로토타입</div>
        </div>
        <div className="stepper" aria-label="진행 단계">
          {['입력', '생성 결과', '수정', '전달'].map((label, idx) => (
            <button
              key={label}
              type="button"
              className={`step ${idx === step ? 'active' : ''} ${idx < step ? 'done' : ''}`}
              onClick={() => {
                if (idx === 0) setStep(0);
                if (idx === 1 && generated) setStep(1);
                if (idx === 2 && editedRecipe) setStep(2);
                if (idx === 3 && payload) setStep(3);
              }}
              disabled={
                (idx === 1 && !generated) || (idx === 2 && !editedRecipe) || (idx === 3 && !payload)
              }
            >
              <span className="dot" />
              <span className="label">{label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <div className="cardHeader">
            <h2>입력</h2>
            <p className="muted">이미지와 취향을 넣으면 추천 칵테일 이미지/레시피를 생성합니다.</p>
          </div>

          <div className="twoCol">
            <div>
              <div className="fieldLabel">이미지</div>
              <div className="imageBox">
                {previewUrl ? (
                  <img className="preview" src={previewUrl} alt="선택한 이미지 미리보기" />
                ) : (
                  <div className="emptyPreview">
                    <div className="emptyTitle">이미지를 추가해 주세요</div>
                    <div className="muted">촬영 또는 갤러리 선택</div>
                  </div>
                )}
              </div>

              <div className="row">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="file"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  className="btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                >
                  이미지 선택/촬영
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => onPickFile(null)}
                  disabled={busy || !imageFile}
                >
                  초기화
                </button>
              </div>

              {imageAnalysis && (
                <div className="pillBox" aria-label="이미지 분석(모의)">
                  <div className="pillTitle">이미지 분위기 분석</div>
                  <div className="pills">
                    {imageAnalysis.moodTags.map((t) => (
                      <span className="pill" key={t}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="fieldLabel">취향 입력</div>

              <div className="field">
                <label className="label">선호 베이스</label>
                <div className="seg">
                  {['', '진', '보드카', '럼', '테킬라', '위스키'].map((s) => (
                    <button
                      key={s || '무관'}
                      type="button"
                      className={`segBtn ${prefs.baseSpirit === s ? 'on' : ''}`}
                      onClick={() => setPrefs((p) => ({ ...p, baseSpirit: s }))}
                      disabled={busy}
                    >
                      {s || '무관'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="label">
                  목표 도수 <span className="muted">(ABV)</span>
                </label>
                <div className="rangeRow">
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={prefs.abvTarget}
                    onChange={(e) => setPrefs((p) => ({ ...p, abvTarget: Number(e.target.value) }))}
                    disabled={busy}
                  />
                  <div className="rangeValue">{prefs.abvTarget}%</div>
                </div>
              </div>

              <div className="field">
                <label className="label">단맛</label>
                <div className="rangeRow">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={prefs.sweetness}
                    onChange={(e) => setPrefs((p) => ({ ...p, sweetness: Number(e.target.value) }))}
                    disabled={busy}
                  />
                  <div className="rangeValue">{prefs.sweetness}/5</div>
                </div>
              </div>

              <div className="field">
                <label className="label">신맛</label>
                <div className="rangeRow">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={prefs.sourness}
                    onChange={(e) => setPrefs((p) => ({ ...p, sourness: Number(e.target.value) }))}
                    disabled={busy}
                  />
                  <div className="rangeValue">{prefs.sourness}/5</div>
                </div>
              </div>

              <div className="field">
                <label className="label">쓴맛</label>
                <div className="rangeRow">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={prefs.bitterness}
                    onChange={(e) => setPrefs((p) => ({ ...p, bitterness: Number(e.target.value) }))}
                    disabled={busy}
                  />
                  <div className="rangeValue">{prefs.bitterness}/5</div>
                </div>
              </div>

              <div className="field row space">
                <label className="label">탄산</label>
                <button
                  type="button"
                  className={`toggle ${prefs.sparkling ? 'on' : ''}`}
                  onClick={() => setPrefs((p) => ({ ...p, sparkling: !p.sparkling }))}
                  disabled={busy}
                  aria-pressed={prefs.sparkling}
                >
                  {prefs.sparkling ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="field">
                <label className="label">추가 요청</label>
                <textarea
                  className="textarea"
                  value={prefs.notes}
                  onChange={(e) => setPrefs((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="예) 달달한 과일향, 민트는 빼고, 카페인/우유는 제외 등"
                  rows={4}
                  disabled={busy}
                />
              </div>

              <div className="row">
                <button
                  type="button"
                  className="btn primary"
                  onClick={onGenerate}
                  disabled={!canGenerate || busy}
                >
                  {busy ? '생성 중…' : '추천 생성'}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setPrefs(defaultPrefs);
                    setBartenderMemo('');
                    showToast('취향 입력을 초기화했어요.');
                  }}
                  disabled={busy}
                >
                  취향 초기화
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="cardHeader">
            <h2>출력</h2>
            <p className="muted">추천 칵테일 이미지와 레시피를 확인하고 수정할 수 있어요.</p>
          </div>

          {!generated ? (
            <div className="emptyState">
              <div className="emptyTitle">아직 생성된 결과가 없어요</div>
              <div className="muted">이미지/취향을 입력한 뒤 “추천 생성”을 눌러주세요.</div>
            </div>
          ) : (
            <div className="resultGrid">
              <div className="resultImage">
                <img className="cardImage" src={generated.cardDataUrl} alt="추천 칵테일 이미지(생성)" />
                <div className="row">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => downloadText(`${editedRecipe.name}.txt`, formatRecipeText(editedRecipe))}
                  >
                    레시피 TXT 다운로드
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => {
                      if (!payload) return;
                      downloadText(
                        `${editedRecipe.name}.json`,
                        JSON.stringify(payload, null, 2),
                      );
                    }}
                    disabled={!payload}
                  >
                    바텐더 패킷 JSON 다운로드
                  </button>
                </div>
              </div>

              <div className="resultRecipe">
                <div className="recipeTop">
                  <div>
                    <div className="recipeName">{editedRecipe.name}</div>
                    <div className="muted">{editedRecipe.style}</div>
                  </div>
                  <div className="row">
                    <button type="button" className="btn" onClick={() => setStep(2)}>
                      수정하기
                    </button>
                    <button type="button" className="btn primary" onClick={() => setStep(3)} disabled={!payload}>
                      바텐더에게 전달
                    </button>
                  </div>
                </div>

                <div className="kv">
                  <div className="kvItem">
                    <div className="kvKey">한줄 소개</div>
                    <div className="kvVal">{editedRecipe.description || '-'}</div>
                  </div>
                  <div className="kvItem">
                    <div className="kvKey">글라스</div>
                    <div className="kvVal">{editedRecipe.glass}</div>
                  </div>
                  <div className="kvItem">
                    <div className="kvKey">가니시</div>
                    <div className="kvVal">{editedRecipe.garnish}</div>
                  </div>
                </div>

                <div className="subTitle">재료</div>
                <ul className="list">
                  {editedRecipe.ingredients.map((ing, idx) => (
                    <li key={`${ing.name}-${idx}`}>
                      <b>{ing.name}</b> <span className="muted">{ing.amount}</span>
                    </li>
                  ))}
                </ul>

                <div className="subTitle">제조</div>
                <ol className="list">
                  {editedRecipe.steps.map((s, idx) => (
                    <li key={`${idx}-${s}`}>{s}</li>
                  ))}
                </ol>

                {editedRecipe.moodTags?.length ? (
                  <>
                    <div className="subTitle">무드 태그</div>
                    <div className="pills">
                      {editedRecipe.moodTags.map((t) => (
                        <span className="pill" key={t}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </section>

        {editedRecipe && (
          <section className="card">
            <div className="cardHeader">
              <h2>수정</h2>
              <p className="muted">고객 피드백을 반영해 이름/재료/제조/메모를 조정할 수 있어요.</p>
            </div>

            <div className="editGrid">
              <div className="field">
                <label className="label">칵테일 이름</label>
                <input
                  className="input"
                  value={editedRecipe.name}
                  onChange={(e) =>
                    setEditedRecipe((r) => ({
                      ...r,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="field">
                <label className="label">스타일</label>
                <input
                  className="input"
                  value={editedRecipe.style}
                  onChange={(e) => setEditedRecipe((r) => ({ ...r, style: e.target.value }))}
                />
              </div>

              <div className="field">
                <label className="label">한줄 소개</label>
                <input
                  className="input"
                  value={editedRecipe.description ?? ''}
                  onChange={(e) => setEditedRecipe((r) => ({ ...r, description: e.target.value }))}
                />
              </div>

              <div className="field">
                <label className="label">글라스</label>
                <input
                  className="input"
                  value={editedRecipe.glass}
                  onChange={(e) => setEditedRecipe((r) => ({ ...r, glass: e.target.value }))}
                />
              </div>
              <div className="field">
                <label className="label">가니시</label>
                <input
                  className="input"
                  value={editedRecipe.garnish}
                  onChange={(e) => setEditedRecipe((r) => ({ ...r, garnish: e.target.value }))}
                />
              </div>

              <div className="field full">
                <label className="label">재료 (한 줄에 하나: 재료명 | 용량)</label>
                <textarea
                  className="textarea"
                  rows={6}
                  value={(editedRecipe.ingredients ?? [])
                    .map((i) => `${i.name} | ${i.amount}`)
                    .join('\n')}
                  onChange={(e) => {
                    const next = e.target.value
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => {
                        const [name, amount] = line.split('|').map((x) => x.trim());
                        return { name: name || line, amount: amount || '' };
                      });
                    setEditedRecipe((r) => ({ ...r, ingredients: next }));
                  }}
                />
              </div>

              <div className="field full">
                <label className="label">제조 (한 줄에 하나)</label>
                <textarea
                  className="textarea"
                  rows={6}
                  value={(editedRecipe.steps ?? []).join('\n')}
                  onChange={(e) => {
                    const next = e.target.value
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean);
                    setEditedRecipe((r) => ({ ...r, steps: next }));
                  }}
                />
              </div>

              <div className="field full">
                <label className="label">바텐더 메모 (전달 시 포함)</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={bartenderMemo}
                  onChange={(e) => setBartenderMemo(e.target.value)}
                  placeholder="예) 손님: 얼음 적게 / 더 새콤하게 / 토닉 대신 소다 등"
                />
              </div>

              <div className="row full">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    if (!generated) return;
                    const cardDataUrl = renderCocktailCardDataUrl({
                      title: editedRecipe.name,
                      subtitle: editedRecipe.style,
                      palette: generated.palette,
                      moodTags: editedRecipe.moodTags,
                    });
                    setGenerated((g) => ({ ...g, cardDataUrl }));
                    showToast('이미지 카드도 업데이트했어요.');
                  }}
                  disabled={!generated}
                >
                  수정 내용으로 이미지 카드 갱신
                </button>
                <button type="button" className="btn primary" onClick={() => setStep(1)} disabled={!generated}>
                  결과로 돌아가기
                </button>
              </div>
            </div>
          </section>
        )}

        {payload && (
          <section className="card">
            <div className="cardHeader">
              <h2>바텐더에게 전달</h2>
              <p className="muted">복사/다운로드로 전달할 수 있는 패킷을 생성합니다.</p>
            </div>

            <div className="deliverGrid">
              <div className="deliverBox">
                <div className="subTitle">전달용 요약</div>
                <pre className="pre">{formatRecipeText(payload.recipe)}</pre>
                <div className="row">
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => onCopy(formatRecipeText(payload.recipe))}
                  >
                    요약 텍스트 복사
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => downloadText(`${payload.recipe.name}-bartender.txt`, formatRecipeText(payload.recipe))}
                  >
                    요약 TXT 다운로드
                  </button>
                </div>
              </div>

              <div className="deliverBox">
                <div className="subTitle">전달용 JSON 패킷</div>
                <pre className="pre">{JSON.stringify(payload, null, 2)}</pre>
                <div className="row">
                  <button type="button" className="btn primary" onClick={() => onCopy(JSON.stringify(payload, null, 2))}>
                    JSON 복사
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => downloadText(`${payload.recipe.name}-packet.json`, JSON.stringify(payload, null, 2))}
                  >
                    JSON 다운로드
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
};

export default MainPage;
