import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Youtube,
  Trash2,
  Image as ImageIcon,
  Calendar,
  Tag,
  MapPin,
  Play,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { ExperienceItem, UploadedFile } from '../types';
import {
  readFileAsDataUrl,
  detectFileCategory,
  extractYouTubeId,
  getYouTubeThumbnail,
  formatFileSize,
} from '../utils/storage';

interface GlobalExperienceModalProps {
  initialExperience?: ExperienceItem | null;
  defaultNextNumber?: string;
  onSave: (experience: ExperienceItem) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export const GlobalExperienceModal: React.FC<GlobalExperienceModalProps> = ({
  initialExperience,
  defaultNextNumber = '01',
  onSave,
  onDelete,
  onClose,
}) => {
  const [number, setNumber] = useState(
    initialExperience?.number || defaultNextNumber
  );
  const [title, setTitle] = useState(initialExperience?.title || '');
  const [subtitle, setSubtitle] = useState(initialExperience?.subtitle || '');
  const [date, setDate] = useState(initialExperience?.date || '');
  const [categoryTag, setCategoryTag] = useState(
    initialExperience?.categoryTag || ''
  );
  const [description, setDescription] = useState(
    initialExperience?.description || ''
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialExperience?.coverImageUrl || ''
  );
  const [youtubeUrl, setYoutubeUrl] = useState(
    initialExperience?.youtubeUrl || ''
  );
  const [attachments, setAttachments] = useState<UploadedFile[]>(
    initialExperience?.attachments || []
  );
  const [errorMsg, setErrorMsg] = useState('');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setCoverImageUrl(dataUrl);
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
        section: 'experiences',
        createdAt: new Date().toISOString(),
      });
    }
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('글로벌 경험 제목을 입력해 주세요.');
      return;
    }

    const saved: ExperienceItem = {
      id: initialExperience?.id || `exp-${Date.now()}`,
      number: number.trim() || defaultNextNumber,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      date: date.trim() || undefined,
      categoryTag: categoryTag.trim() || undefined,
      description: description.trim(),
      coverImageUrl: coverImageUrl.trim() || undefined,
      youtubeUrl: youtubeUrl.trim() || undefined,
      createdAt: initialExperience?.createdAt || new Date().toISOString(),
      attachments,
    };

    onSave(saved);
  };

  const ytId = extractYouTubeId(youtubeUrl);
  const ytThumb = getYouTubeThumbnail(youtubeUrl);
  const effectiveThumb = coverImageUrl || ytThumb;

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
              04 — GLOBAL EXPERIENCES · 자료 편집
            </p>
            <h3 className="font-serif-display text-2xl font-medium text-[#202421]">
              {initialExperience ? '글로벌 경험 게시물 수정' : '새 글로벌 경험 게시물 등록'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Number & Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] text-[#555c55] uppercase mb-1">
                번호 (Number)
              </label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="01"
                className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-sm focus:outline-none focus:border-[#202923]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] text-[#555c55] uppercase mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#788475]" />
                구분 / 태그
              </label>
              <input
                type="text"
                value={categoryTag}
                onChange={(e) => setCategoryTag(e.target.value)}
                placeholder="예: 다문화 적응 & 어학, 글로벌 견문"
                className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-sm focus:outline-none focus:border-[#202923]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] text-[#555c55] uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#788475]" />
                활동 시기 / 기간
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="예: 2018 — 2021, 2025 여름"
                className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-sm focus:outline-none focus:border-[#202923]"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.08em] text-[#555c55] uppercase mb-1">
              게시물 제목 (Title) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="예: Living in Canada, Travel & exploration"
              className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-sm font-medium focus:outline-none focus:border-[#202923]"
            />
          </div>

          {/* Subtitle / Location */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.08em] text-[#555c55] uppercase mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#788475]" />
              지역 / 부제 (Location & Subtitle)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="예: Vancouver & Toronto · Canada, Massachusetts · USA"
              className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-sm focus:outline-none focus:border-[#202923]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold tracking-[0.08em] text-[#555c55] uppercase mb-1">
              상세 설명 (Description)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="경험한 문화, 학습 내용, 활동 소감 등을 자유롭게 적어주세요."
              className="w-full px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-sm leading-relaxed focus:outline-none focus:border-[#202923]"
            />
          </div>

          {/* 썸네일 이미지 등록 & 미리보기 */}
          <div className="p-4 bg-[#eeede7] border border-[#dcded6] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold tracking-[0.08em] text-[#555c55] uppercase flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#536b56]" />
                대표 썸네일 이미지 (Cover / Thumbnail Image)
              </label>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-[#202923] text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                컴퓨터 사진 선택
              </button>
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="이미지 웹 주소(URL) 직접 입력 또는 위 버튼으로 파일 업로드"
                className="flex-1 px-3 py-2 bg-white border border-[#c8ccc3] text-xs focus:outline-none focus:border-[#202923]"
              />
              {coverImageUrl && (
                <button
                  type="button"
                  onClick={() => setCoverImageUrl('')}
                  className="px-2.5 py-2 text-xs border border-[#c8ccc3] bg-white text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  지우기
                </button>
              )}
            </div>

            {/* Thumbnail Preview Box */}
            {effectiveThumb ? (
              <div className="relative w-full h-44 bg-[#e8eae3] border border-[#c8ccc3] overflow-hidden group">
                <img
                  src={effectiveThumb}
                  alt="썸네일 미리보기"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/65 text-white text-[10px] font-semibold">
                  {coverImageUrl ? '등록된 대표 이미지' : 'YouTube 자동 추출 썸네일'}
                </div>
                {ytId && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-28 border border-dashed border-[#c8ccc3] bg-[#f8f7f3] flex flex-col items-center justify-center text-[#8a9287] text-xs">
                <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
                <span>등록된 썸네일 이미지가 없습니다.</span>
                <span className="text-[10px] text-[#9aa194]">
                  (동영상 링크 입력 시 YouTube 썸네일이 자동으로 사용됩니다)
                </span>
              </div>
            )}
          </div>

          {/* 동영상 링크 (YouTube 등) 연동 */}
          <div className="p-4 bg-[#eeede7] border border-[#dcded6] space-y-3">
            <label className="block text-[11px] font-bold tracking-[0.08em] text-[#555c55] uppercase flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-red-700" />
              동영상 링크 연결 (YouTube Video URL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="예: https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-[#c8ccc3] text-xs focus:outline-none focus:border-[#202923]"
              />
              {youtubeUrl && (
                <button
                  type="button"
                  onClick={() => setYoutubeUrl('')}
                  className="px-3 py-2.5 text-xs border border-[#c8ccc3] bg-white text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  연결 해제
                </button>
              )}
            </div>

            {ytId ? (
              <div className="flex items-center gap-2 text-xs text-[#536b56] bg-green-50 border border-green-200 p-2.5">
                <Play className="w-3.5 h-3.5 fill-current text-green-700" />
                <span>유효한 YouTube 영상이 연결되었습니다! (ID: {ytId})</span>
              </div>
            ) : youtubeUrl ? (
              <p className="text-[11px] text-[#93988f]">
                동영상 웹 주소가 입력되었습니다. 카드를 클릭하면 영상 뷰어가 열립니다.
              </p>
            ) : (
              <p className="text-[11px] text-[#8a9287]">
                YouTube 링크를 입력하면 기부 및 사회공헌 활동처럼 재생 버튼과 영상 뷰어가 자동으로 연결됩니다.
              </p>
            )}
          </div>

          {/* 첨부 파일 (수료증, 사진, 문서) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold tracking-[0.08em] text-[#555c55] uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#536b56]" />
                추가 첨부자료 ({attachments.length}개)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#c8ccc3] bg-white hover:bg-[#e8eae3] transition-colors cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                자료 파일 추가
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {attachments.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {attachments.map((file, idx) => (
                  <div
                    key={file.id || idx}
                    className="flex items-center justify-between p-2 bg-white border border-[#e5e3dc] text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-[#788475] shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-[10px] text-[#8a9287] shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="p-1 text-[#8a9287] hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#e4e2db]">
            <div>
              {initialExperience && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `"${initialExperience.title}" 글로벌 경험 항목을 삭제하시겠습니까?`
                      )
                    ) {
                      onDelete(initialExperience.id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  항목 삭제
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold border border-[#c8ccc3] bg-white text-[#202421] hover:bg-[#e8eae3] transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-xs font-bold bg-[#202923] text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                {initialExperience ? '수정 내용 저장' : '새 게시물 등록'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
