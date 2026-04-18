import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/header';
import Button from '../components/button';
import Option from '../components/option';
import Plus from '../assets/images/plus-icon.svg';

const COLOR_OPTIONS = [
  { id: 'blue', value: '#9CF9F9' },
  { id: 'pink', value: '#FFA7E9' },
  { id: 'yellow', value: '#FCF686' },
  { id: 'green', value: '#ADF27F' },
  { id: 'purple', value: '#DF9AFF' },
];

const MOOD_OPTIONS = [
  { id: 'calm', emoji: '🌊', label: '잔잔한' },
  { id: 'light', emoji: '✨', label: '가벼운' },
  { id: 'fresh', emoji: '🌿', label: '청량한' },
  { id: 'soft', emoji: '🫧', label: '부드러운' },
  { id: 'deep', emoji: '🌙', label: '깊은' },
  { id: 'dreamy', emoji: '🌀', label: '몽환적인' },
  { id: 'intense', emoji: '🔥', label: '강렬한' },
];

const MAX_COLORS = 2;
const MAX_MOODS = 2;

const Step1Mood = () => {
  const navigate = useNavigate();
  const fileInputId = useId();
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedColorIds, setSelectedColorIds] = useState(() => new Set());
  const [customColors, setCustomColors] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState(() => new Set());
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [draftColor, setDraftColor] = useState(() => COLOR_OPTIONS[0].value);

  const allColors = [...COLOR_OPTIONS, ...customColors];

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!colorPickerOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setColorPickerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [colorPickerOpen]);

  const onFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }, []);

  const onUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const confirmCustomColor = useCallback(() => {
    const value = draftColor;
    if (!value) return;

    let targetId;
    const preset = COLOR_OPTIONS.find((c) => c.value.toLowerCase() === value.toLowerCase());

    if (preset) {
      targetId = preset.id;
    } else {
      const existing = customColors.find((c) => c.value.toLowerCase() === value.toLowerCase());
      if (existing) {
        targetId = existing.id;
      } else {
        targetId = `custom-${Date.now()}`;
        setCustomColors((prev) => [...prev, { id: targetId, value }]);
      }
    }

    setSelectedColorIds((prev) => {
      if (prev.has(targetId)) return prev;
      if (prev.size >= MAX_COLORS) return prev;
      const next = new Set(prev);
      next.add(targetId);
      return next;
    });

    setColorPickerOpen(false);
  }, [draftColor, customColors]);

  const toggleColor = useCallback((id) => {
    setSelectedColorIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_COLORS) next.add(id);
      return next;
    });
  }, []);

  const toggleMood = useCallback((id) => {
    setSelectedMoods((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_MOODS) next.add(id);
      return next;
    });
  }, []);

  return (
    <Wrapper>
      <Header step={1} />
      <Main>
        <Section>
          <FieldLabel>이미지</FieldLabel>
          <FileInput
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
          />
          <FileUpload type="button" onClick={onUploadClick}>
            {imagePreview ? (
              <PreviewImage src={imagePreview} />
            ) : (
              <PlusIcon src={Plus} aria-hidden />
            )}
          </FileUpload>
        </Section>

        <Section>
          <SectionTitle>
            <FieldLabel>색상</FieldLabel>
            <Hint>최대 {MAX_COLORS}개까지 선택</Hint>
          </SectionTitle>
          <ColorRow role="list">
            {allColors.map((c) => (
              <ColorOption
                key={c.id}
                type="button"
                role="listitem"
                $color={c.value}
                $selected={selectedColorIds.has(c.id)}
                onClick={() => toggleColor(c.id)}
                aria-pressed={selectedColorIds.has(c.id)}
                aria-label={`색상 ${c.value}`}
              />
            ))}
            <ColorAdd
              type="button"
              disabled={selectedColorIds.size >= MAX_COLORS}
              onClick={() => {
                setDraftColor(COLOR_OPTIONS[0].value);
                setColorPickerOpen(true);
              }}
            >
              <SmallPlusIcon src={Plus} aria-hidden />
            </ColorAdd>
          </ColorRow>
        </Section>

        <Section>
          <SectionTitle>
            <FieldLabel>분위기</FieldLabel>
            <Hint>최대 {MAX_MOODS}개까지 선택</Hint>
          </SectionTitle>
          <MoodRow>
            {MOOD_OPTIONS.map((m) => (
              <Option
                key={m.id}
                emoji={m.emoji}
                label={m.label}
                selected={selectedMoods.has(m.id)}
                onClick={() => toggleMood(m.id)}
              />
            ))}
          </MoodRow>
        </Section>
      </Main>

      <Footer>
        <Button onClick={() => navigate('/step2-taste')}>
          다음
        </Button>
      </Footer>

      {colorPickerOpen && (
        <ModalBackdrop
          role="presentation"
          onClick={() => setColorPickerOpen(false)}
        >
          <ModalPanel
            role="dialog"
            aria-modal="true"
            aria-labelledby="color-picker-title"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalTitle id="color-picker-title">색상 추가</ModalTitle>
            <ModalColorField>
              <ModalColorInput
                type="color"
                value={draftColor}
                onChange={(e) => setDraftColor(e.target.value)}
              />
              <ModalColorCode>{draftColor.toUpperCase()}</ModalColorCode>
            </ModalColorField>
            <ModalButton>
              <ModalCancelButton type="button" onClick={() => setColorPickerOpen(false)}>
                취소
              </ModalCancelButton>
              <ModalConfirmButton type="button" onClick={confirmCustomColor}>
                선택
              </ModalConfirmButton>
            </ModalButton>
          </ModalPanel>
        </ModalBackdrop>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  min-height: 100dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: var(--black);
`;

const Main = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FieldLabel = styled.label`
  font-size: 16px;
  font-weight: 700;
  line-height: normal;
  color: var(--white);
`;

const FileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const FileUpload = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 200px;
  padding: 12px;
  border-radius: 12px;
  border: 1.5px dotted #A0A0A0;
  background: transparent;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(0.995);
  }
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
`;

const PlusIcon = styled.img`
  width: 24px;
  height: 24px;
  display: block;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: baseline;  
  gap: 12px;
`;

const Hint = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: #A0A0A0;
  cursor: default;
`;

const ColorRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
`;

const ColorOption = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  background-color: ${({ $color }) => $color};
  box-shadow: ${({ $selected }) =>
    $selected
      ? '0 0 0 1.5px var(--black), 0 0 0 3px var(--white), 2px 2px 10px rgba(255, 255, 255, 0.4)'
      : 'none'};
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    transform: scale(1.03);
  }
`;

const ColorAdd = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px dashed #A0A0A0;
  background-color: var(--black);
  color: var(--white);
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
  transition: opacity 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const SmallPlusIcon = styled.img`
  width: 14px;
  height: 14px;
  display: block;
`;

const MoodRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px 10px;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.7);
`;

const ModalPanel = styled.div`
  width: 100%;
  max-width: 320px;
  padding: 20px;
  border-radius: 12px;
  box-sizing: border-box;
  background-color: #202020;
  border: 1px solid #404040;
`;

const ModalTitle = styled.h2`
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--white);
  cursor: default;
`;

const ModalColorField = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ModalColorInput = styled.input`
  width: 60px;
  height: 60px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }
`;

const ModalColorCode = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #F0F0F0;
  cursor: default;
`;

const ModalButton = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 36px;
`;

const ModalCancelButton = styled.button`
  flex: 1;
  padding: 8px;
  border-radius: 100px;
  border: 1px solid #E0E0E0;
  background: transparent;
  color: #E0E0E0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s ease, transform 0.2s ease;

  &:hover {
    filter: brightness(0.9);
    transform: scale(0.99);
  }
`;

const ModalConfirmButton = styled.button`
  flex: 1;
  padding: 8px;
  border-radius: 100px;
  border: none;
  background-color: #E0E0E0;
  color: #202020;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s ease, transform 0.2s ease;

  &:hover {
    filter: brightness(0.9);
    transform: scale(0.99);
  }
`;

const Footer = styled.div`
  padding: 12px 20px calc(20px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;

  @media (min-width: 500px) {
    padding: 12px 20px 40px;
  }
`;

export default Step1Mood;
