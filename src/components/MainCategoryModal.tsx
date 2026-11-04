import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Youtube,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { InterestItem, SportItem } from '../types';
import {
  readFileAsDataUrl,
  extractYouTubeId,
  getYouTubeThumbnail,
} from '../utils/storage';

interface MainCategoryModalProps {
  categoryType: 'interests' | 'athletics';
  initialItem?: InterestItem | SportItem | null;
  onSaveInterest?: (item: InterestItem) => void;
  onSaveSport?: (item: SportItem) => void;
  onClose: () => void;
}

const ICON_PRESETS = [
  '🤝', '🎁', '🏒', '♪', '📷', '🎬', '🎨', '📚', '⛳', '🏊', '🚴', '♟️', '🌱', '💻'
];

export const MainCategoryModal: React.FC<MainCategoryModalProps> = ({
  categoryType,
  initialItem,
  onSaveInterest,
  onSaveSport,
  onClose,
}) => {
  const isInterest = categoryType === 'interests';
  const initialInt = isInterest ? (initialItem as InterestItem | null) : null;
  const initialSp = !isInterest ? (initialItem as SportItem | null) : null;

  const [title, setTitle] = useState(initialItem?.title || '');
  const [icon, setIcon] = useState(initialInt?.icon || '🤝');
  const [tag, setTag] = useState(
    initialInt?.caption || initialSp?.tag || (isInterest ? 'COMMUNITY · VOLUNTEER' : 'VARSITY TEAM')
  );
  const [indexLabel, setIndexLabel] = useState(
    initialSp?.indexLabel || 'C / NEW SPORT'
  );
  const [description, setDescription] = useState(initialItem?.description || '');
  const [featuredMode, setFeaturedMode] = useState<'latest' | 'selected' | 'default'>(
    initialItem?.featuredMode || 'latest'
  );
  const [selectedActivityId, setSelectedActivityId] = useState<string | undefined>(
    initialItem?.selectedActivityId
  );
  const [details, setDetails] = useState<Array<{ label: string; value: string }>>(
    initialSp?.details || [
      { label: 'Role', value: 'Team Member' },
      { label: 'Achievement', value: '' },
    ]
  );
  const [coverImageUrl, setCoverImageUrl] = useState(initialItem?.coverImageUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialItem?.youtubeUrl || '');
  const [errorMsg, setErrorMsg] = useState('');

  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    setCoverImageUrl(url);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('메인 항목 이름을 입력해 주세요.');
      return;
    }

    if (isInterest && onSaveInterest) {
      const saved: InterestItem = {
        id: initialInt?.id || `interest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        icon: icon.trim() || '🤝',
        title: title.trim(),
        caption: tag.trim() || 'COMMUNITY · ACTIVITY',
        description: description.trim(),
        featuredMode,
        coverImageUrl: coverImageUrl || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        selectedActivityId: featuredMode === 'selected' ? selectedActivityId : undefined,
        activities: initialInt?.activities || [],
        attachments: initialInt?.attachments || [],
      };
      onSaveInterest(saved);
    } else if (!isInterest && onSaveSport) {
      const saved: SportItem = {
        id: initialSp?.id || `sport-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        indexLabel: indexLabel.trim(),
        title: title.trim(),
        tag: tag.trim() || 'VARSITY TEAM',
        description: description.trim(),
        visualStyle: initialSp?.visualStyle || 'custom',
        featuredMode,
        coverImageUrl: coverImageUrl || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        selectedActivityId: featuredMode === 'selected' ? selectedActivityId : undefined,
        activities: initialSp?.activities || [],
        details: details.filter((d) => d.label.trim() || d.value.trim()),
        attachments: initialSp?.attachments || [],
      };
      onSaveSport(saved);
    }
  };

  const ytId = extractYouTubeId(youtubeUrl);
  const ytThumb = getYouTubeThumbnail(youtubeUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 md:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#f5f4f0] text-[#202421] border border-[#dcded6] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#f5f4f0]/95 border-b border-[#e4e2db] backdrop-blur-md">
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#788475] uppercase">
              {isInterest ? '05 — BEYOND THE CLASSROOM' : '02 — ATHLETICS'}
            </p>
            <h3 className="font-serif-display text-2xl font-medium text-[#202421]">
              {initialItem
                ? `메인 항목 수정 — ${initialItem.title}`
                : isInterest
                ? '새 메인 항목 추가 (예: 기부활동, 봉사활동 등)'
                : '새 스포츠 메인 종목 추가'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#555c55] hover:text-[#111] hover:bg-[#e8eae3] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800">
              {errorMsg}
            </div>
          )}

          {/* Title & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] text-[#555c55] uppercase mb-1.5">
                메인 항목 이름 (Title) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isInterest
                    ? '예: 기부 및 사회공헌 활동, Ice Hockey, 사진'
                    : '예: Golf, Swimming, Basketball'
                }
                className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-sm focus:outline-none focus:border-[#202923]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] text-[#555c55] uppercase mb-1.5">
                {isInterest ? '카테고리 캡션 (Caption)' : '태그 / 직책 (Tag)'}
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder={isInterest ? '예: COMMUNITY · VOLUNTEERING' : '예: VARSITY CAPTAIN'}
                className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-sm focus:outline-none focus:border-[#202923]"
              />
            </div>
          </div>

          {/* Icon Selector (for Interests) */}
          {isInterest && (
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] text-[#555c55] uppercase mb-1.5">
                대표 아이콘 선택
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {ICON_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setIcon(p)}
                    className={`w-9 h-9 flex items-center justify-center text-lg border cursor-pointer ${
                      icon === p
                        ? 'bg-[#202923] text-white border-[#202923]'
                        : 'bg-white text-[#202421] border-[#c8ccc3] hover:bg-[#e8eae3]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  maxLength={4}
                  className="w-16 px-2.5 py-1.5 bg-white border border-[#c8ccc3] text-center text-sm"
                  title="직접 이모지/기호 입력"
                />
              </div>
            </div>
          )}

          {!isInterest && (
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] text-[#555c55] uppercase mb-1.5">
                인덱스 라벨 (Index Label)
              </label>
              <input
                type="text"
                value={indexLabel}
                onChange={(e) => setIndexLabel(e.target.value)}
                placeholder="예: C / BASKETBALL"
                className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-sm focus:outline-none focus:border-[#202923]"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.1em] text-[#555c55] uppercase mb-1.5">
              소개 문구 (Description)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 항목에 대한 전반적인 소개, 목적, 또는 배우고 실천하는 가치를 입력하세요."
              className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-xs focus:outline-none focus:border-[#202923]"
            />
          </div>

          {/* Featured Display Preference */}
          <div className="p-4 bg-[#eeede7] border border-[#dcded6] space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#202421]">
                포트폴리오 첫 페이지 대표 표시 방식
              </label>
              <p className="text-[11px] text-[#788475] mt-0.5">
                메인 카드의 상단 비주얼 영역에 노출할 활동 사진 및 연결 방식을 지정합니다.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2.5 bg-white border border-[#c8ccc3] text-xs cursor-pointer">
                <input
                  type="radio"
                  name="featuredMode"
                  value="latest"
                  checked={featuredMode === 'latest'}
                  onChange={() => setFeaturedMode('latest')}
                  className="accent-[#202923]"
                />
                <span className="font-semibold">최신 활동 자동 반영</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 bg-white border border-[#c8ccc3] text-xs cursor-pointer">
                <input
                  type="radio"
                  name="featuredMode"
                  value="selected"
                  checked={featuredMode === 'selected'}
                  onChange={() => setFeaturedMode('selected')}
                  className="accent-[#202923]"
                />
                <span className="font-semibold">지정된 대표 활동</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 bg-white border border-[#c8ccc3] text-xs cursor-pointer">
                <input
                  type="radio"
                  name="featuredMode"
                  value="default"
                  checked={featuredMode === 'default'}
                  onChange={() => setFeaturedMode('default')}
                  className="accent-[#202923]"
                />
                <span className="font-semibold">기본 이미지/일러스트</span>
              </label>
            </div>

            {featuredMode === 'selected' && (
              <div className="mt-3 p-3 bg-white border border-[#c8ccc3] space-y-2">
                <span className="block text-[11px] font-bold text-[#202421]">
                  대표로 지정할 세부 활동 선택:
                </span>
                {initialItem?.activities && initialItem.activities.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {initialItem.activities.map((act) => (
                      <label
                        key={act.id}
                        className={`flex items-center gap-2 p-2 border text-xs cursor-pointer ${
                          selectedActivityId === act.id
                            ? 'bg-[#f0f4ee] border-[#536b56]'
                            : 'bg-[#f8f7f3] border-[#e5e3dc] hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedActivity"
                          value={act.id}
                          checked={selectedActivityId === act.id}
                          onChange={() => setSelectedActivityId(act.id)}
                          className="accent-[#536b56]"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {act.date && (
                              <span className="text-[10px] text-[#788475]">{act.date}</span>
                            )}
                            <span className="font-semibold text-[#202421] truncate">
                              {act.title}
                            </span>
                          </div>
                          {act.categoryTag && (
                            <span className="text-[10px] text-[#536b56]">
                              [{act.categoryTag}]
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#8a9287]">
                    등록된 세부 활동이 없습니다. [최신 활동 자동 반영] 모드를 선택하시거나 세부 활동을 먼저 추가해 주세요.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Optional Default Cover Image + YouTube */}
          <div className="p-4 bg-white border border-[#dcded6] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs font-bold text-[#202421]">
                  기본 대표 사진 (선택 사항)
                </p>
                <p className="text-[11px] text-[#70766e]">
                  활동 등록 전이거나 기본 모드일 때 메인 카드에 표시될 사진입니다.
                </p>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#202923] text-white cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                컴퓨터에서 사진 선택
              </button>
            </div>

            {coverImageUrl && (
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={coverImageUrl}
                  alt="Default cover"
                  className="w-20 h-14 object-cover border border-[#c8ccc3]"
                />
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="기본 연결 유튜브 링크 (https://...)"
                  className="flex-1 px-3 py-1.5 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImageUrl('');
                    setYoutubeUrl('');
                  }}
                  className="text-xs text-red-700 underline cursor-pointer"
                >
                  제거
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e4e2db]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold border border-[#c8ccc3] bg-white text-[#555c55] cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#202923] text-white hover:opacity-90 cursor-pointer"
            >
              {initialItem ? '메인 항목 수정 저장' : '메인 항목 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
