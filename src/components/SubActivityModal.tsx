import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Youtube,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  Calendar,
  Tag,
  Star,
  FileText,
} from 'lucide-react';
import { SubActivityItem, UploadedFile, SectionCategory } from '../types';
import {
  readFileAsDataUrl,
  detectFileCategory,
  extractYouTubeId,
  getYouTubeThumbnail,
  formatFileSize,
} from '../utils/storage';

interface SubActivityModalProps {
  categoryTitle: string;
  categorySection: SectionCategory;
  initialActivity?: SubActivityItem | null;
  onSave: (activity: SubActivityItem) => void;
  onClose: () => void;
}

export const SubActivityModal: React.FC<SubActivityModalProps> = ({
  categoryTitle,
  categorySection,
  initialActivity,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(initialActivity?.title || '');
  const [date, setDate] = useState(
    initialActivity?.date ||
      `${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [categoryTag, setCategoryTag] = useState(
    initialActivity?.categoryTag || ''
  );
  const [description, setDescription] = useState(
    initialActivity?.description || ''
  );
  const [imageUrl, setImageUrl] = useState(initialActivity?.imageUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialActivity?.youtubeUrl || '');
  const [isFeatured, setIsFeatured] = useState(
    initialActivity?.isFeatured || false
  );
  const [attachments, setAttachments] = useState<UploadedFile[]>(
    initialActivity?.attachments || []
  );
  const [errorMsg, setErrorMsg] = useState('');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setImageUrl(dataUrl);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    e.target.value = '';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.startsWith('.')) continue;
      const dataUrl = await readFileAsDataUrl(file);
      const cat = detectFileCategory(file);
      newFiles.push({
        id: `att-${Date.now()}-${i}`,
        name: file.name,
        type: cat,
        mimeType: file.type,
        size: file.size,
        dataUrl,
        section: categorySection,
        createdAt: new Date().toISOString(),
      });
    }
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('활동 제목을 입력해 주세요.');
      return;
    }

    const saved: SubActivityItem = {
      id: initialActivity?.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      date: date.trim() || undefined,
      categoryTag: categoryTag.trim() || undefined,
      description: description.trim(),
      imageUrl: imageUrl || undefined,
      youtubeUrl: imageUrl && youtubeUrl.trim() ? youtubeUrl.trim() : (youtubeUrl.trim() || undefined),
      isFeatured,
      createdAt: initialActivity?.createdAt || new Date().toISOString(),
      attachments,
    };

    onSave(saved);
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
              {categoryTitle} — SUB-ACTIVITY
            </p>
            <h3 className="font-serif-display text-2xl font-medium text-[#202421]">
              {initialActivity ? '세부 활동 수정' : '새 세부 활동 등록'}
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
            <div className="p-3.5 bg-[#f9ecec] border border-[#df9a9a] text-xs font-medium text-red-800">
              {errorMsg}
            </div>
          )}

          {/* Activity Title */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.1em] text-[#555c55] uppercase mb-1.5">
              활동 제목 (Activity Title) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2026 청소년 골프대회 3위 입상, 사랑의 연탄 나눔 2차 봉사, 정기 훈련"
              className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-sm focus:outline-none focus:border-[#202923]"
            />
          </div>

          {/* Date & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] text-[#555c55] uppercase mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#788475]" />
                활동 일자 / 기간
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="예: 2026.04, 2025 가을, 2025.10.15"
                className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-xs focus:outline-none focus:border-[#202923]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] text-[#555c55] uppercase mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#788475]" />
                구분 태그 (선택)
              </label>
              <input
                type="text"
                value={categoryTag}
                onChange={(e) => setCategoryTag(e.target.value)}
                placeholder="예: 대회 참가, 봉사 활동, 정기 연주, 테크닉 훈련"
                className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-xs focus:outline-none focus:border-[#202923]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.1em] text-[#555c55] uppercase mb-1.5">
              활동 상세 내용 (Description)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="활동의 구체적인 내용, 배운 점, 달성한 성과 등을 자유롭게 기록하세요."
              className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-xs focus:outline-none focus:border-[#202923]"
            />
          </div>

          {/* Image Upload + YouTube Video Link */}
          <div className="p-5 bg-[#eeede7] border border-[#dcded6] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-xs font-bold tracking-[0.08em] text-[#202421] uppercase flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#536b56]" />
                  활동 사진 등록 및 유튜브 영상 링크 연동
                </h4>
                <p className="text-xs text-[#70766e] mt-0.5">
                  내 컴퓨터에서 활동 사진을 등록하면 해당 사진과 함께 유튜브 영상 링크를 추가할 수 있습니다.
                </p>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-[#202923] text-white hover:opacity-90 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {imageUrl ? '사진 변경하기' : '내 컴퓨터에서 사진 선택'}
              </button>
            </div>

            {imageUrl ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#dcded6] items-start">
                <div className="relative bg-white border border-[#c8ccc3] p-1.5">
                  <img
                    src={imageUrl}
                    alt="Activity preview"
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setYoutubeUrl('');
                    }}
                    className="absolute top-2.5 right-2.5 p-1 bg-black/70 text-white hover:bg-red-700 transition-colors cursor-pointer"
                    title="사진 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="sm:col-span-2 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#344137]">
                    <CheckCircle2 className="w-4 h-4 text-[#536b56]" />
                    사진이 등록되었습니다. 유튜브 영상 링크를 연결할 수 있습니다.
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                      유튜브 영상 링크 (YouTube URL)
                    </label>
                    <div className="relative flex items-center">
                      <Youtube className="w-4 h-4 text-red-700 absolute left-3" />
                      <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#c8ccc3] text-xs focus:outline-none focus:border-[#202923]"
                      />
                    </div>
                  </div>

                  {ytId && (
                    <div className="flex items-center gap-2.5 p-2 bg-white border border-[#c8ccc3]">
                      {ytThumb && (
                        <img
                          src={ytThumb}
                          alt="Thumbnail"
                          className="w-16 h-10 object-cover border border-[#dcded6]"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#202421]">
                          YouTube 영상 확인됨 (ID: {ytId})
                        </p>
                        <p className="text-[10px] text-[#788475] truncate">{youtubeUrl}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="p-5 border border-dashed border-[#aab1a6] bg-[#f8f7f3] text-center cursor-pointer hover:border-[#202923]"
              >
                <p className="text-xs font-medium text-[#555c55]">
                  클릭하여 컴퓨터에서 활동 사진을 등록해 보세요.
                </p>
                <p className="text-[10px] text-[#8a9287] mt-0.5">
                  (사진을 등록하면 유튜브 영상 링크 입력란이 활성화됩니다)
                </p>
              </div>
            )}
          </div>

          {/* Option: Set as Featured on Main Card */}
          <div className="p-3.5 bg-white border border-[#dcded6] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Star
                className={`w-4 h-4 ${
                  isFeatured ? 'text-amber-500 fill-amber-500' : 'text-[#8a9287]'
                }`}
              />
              <div>
                <p className="text-xs font-bold text-[#202421]">
                  메인 카드의 대표 내용으로 지정
                </p>
                <p className="text-[10px] text-[#70766e]">
                  포트폴리오 메인 화면에서 이 카드의 대표 이미지 및 주요 활동으로 우선 노출됩니다.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 accent-[#202923] cursor-pointer"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold tracking-[0.1em] text-[#555c55] uppercase">
                관련 파일 첨부 ({attachments.length}개)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-[#536b56] hover:underline cursor-pointer"
              >
                + 내 컴퓨터에서 파일 추가
              </button>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-1.5">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between px-3 py-1.5 bg-white border border-[#dcded6] text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-[#788475]" />
                      <span className="truncate">{att.name}</span>
                      <span className="text-[10px] text-[#8a9287]">
                        ({formatFileSize(att.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((a) => a.id !== att.id)
                        )
                      }
                      className="text-[#737a72] hover:text-red-700 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e4e2db]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold border border-[#c8ccc3] bg-white text-[#555c55] hover:text-[#111] cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#202923] text-white hover:opacity-90 cursor-pointer"
            >
              {initialActivity ? '활동 수정 완료' : '새 활동 추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
