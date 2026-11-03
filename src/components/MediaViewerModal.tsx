import React, { useEffect } from 'react';
import { X, Download, ExternalLink, Play, FileText, Folder } from 'lucide-react';
import { UploadedFile } from '../types';
import { extractYouTubeId, formatFileSize } from '../utils/storage';

export interface ViewerTarget {
  title: string;
  subtitle?: string;
  date?: string;
  categoryTag?: string;
  description?: string;
  imageUrl?: string;
  youtubeUrl?: string;
  file?: UploadedFile;
}

interface MediaViewerModalProps {
  target: ViewerTarget | null;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  target,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (target) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [target, onClose]);

  if (!target) return null;

  const youtubeUrl = target.youtubeUrl || target.file?.youtubeUrl;
  const youtubeId = extractYouTubeId(youtubeUrl);
  const imageUrl =
    target.imageUrl || (target.file?.type === 'image' ? target.file.dataUrl : undefined);
  const isPdf = target.file?.type === 'pdf';
  const isVideo = target.file?.type === 'video';
  const isAudio = target.file?.type === 'audio';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#f5f4f0] text-[#202421] border border-[#dcded6] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#f5f4f0]/95 border-b border-[#e4e2db] backdrop-blur-md">
          <div className="min-w-0 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              {target.subtitle && (
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#788475] uppercase">
                  {target.subtitle}
                </p>
              )}
              {target.date && (
                <span className="text-[10px] text-[#8a9287]">· {target.date}</span>
              )}
              {target.categoryTag && (
                <span className="text-[10px] px-1.5 py-0.2 bg-[#e8eae3] text-[#536b56] font-semibold">
                  {target.categoryTag}
                </span>
              )}
            </div>
            <h3 className="font-serif-display text-xl md:text-2xl font-medium text-[#202421] truncate">
              {target.title}
            </h3>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#202923] text-white hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                YouTube에서 보기
              </a>
            )}
            {target.file && (
              <a
                href={target.file.dataUrl}
                download={target.file.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#c8ccc3] bg-white text-[#202421] hover:bg-[#e8eae3] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                다운로드
              </a>
            )}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 text-[#555c55] hover:text-[#111] hover:bg-[#e8eae3] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* If YouTube ID exists, show embedded YouTube video player */}
          {youtubeId && (
            <div className="space-y-2">
              <div className="relative w-full aspect-video bg-black overflow-hidden border border-[#dcded6]">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  title={target.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-between text-xs text-[#70766e] pt-1">
                <span>등록된 이미지와 연동된 유튜브 영상이 재생 중입니다.</span>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#202421]"
                >
                  원본 링크 열기 ↗
                </a>
              </div>
            </div>
          )}

          {/* Image display (shown primary if no YouTube, or below/alongside if YouTube is also present) */}
          {imageUrl && (
            <div className="space-y-2">
              {youtubeId && (
                <p className="text-[11px] font-bold tracking-[0.12em] text-[#788475] uppercase">
                  등록된 원본 이미지
                </p>
              )}
              <div className="bg-[#e8eae3] border border-[#dcded6] flex items-center justify-center p-2 max-h-[65vh] overflow-hidden">
                <img
                  src={imageUrl}
                  alt={target.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>
            </div>
          )}

          {/* PDF Viewer */}
          {isPdf && target.file && (
            <div className="w-full h-[65vh] bg-white border border-[#dcded6]">
              <iframe
                src={target.file.dataUrl}
                title={target.file.name}
                className="w-full h-full border-0"
              />
            </div>
          )}

          {/* Local Video Viewer */}
          {isVideo && target.file && (
            <div className="w-full bg-black border border-[#dcded6]">
              <video
                src={target.file.dataUrl}
                controls
                autoPlay
                className="w-full max-h-[65vh]"
              />
            </div>
          )}

          {/* Local Audio Viewer */}
          {isAudio && target.file && (
            <div className="p-6 bg-[#e8eae3] border border-[#dcded6] flex flex-col items-center gap-4">
              <audio src={target.file.dataUrl} controls className="w-full max-w-md" />
            </div>
          )}

          {/* Other Document Info */}
          {target.file &&
            !imageUrl &&
            !isPdf &&
            !isVideo &&
            !isAudio && (
              <div className="p-8 bg-[#eeede7] border border-[#dcded6] flex flex-col items-center text-center gap-3">
                <FileText className="w-10 h-10 text-[#788475]" />
                <div className="space-y-1">
                  <p className="font-medium text-base text-[#202421]">{target.file.name}</p>
                  <p className="text-xs text-[#70766e]">
                    {target.file.mimeType || '문서 파일'} · {formatFileSize(target.file.size)}
                  </p>
                </div>
                <a
                  href={target.file.dataUrl}
                  download={target.file.name}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#202923] text-white"
                >
                  <Download className="w-4 h-4" />
                  내 컴퓨터로 파일 다운로드
                </a>
              </div>
            )}

          {/* Description & File Metadata */}
          {(target.description || target.file) && (
            <div className="pt-2 border-t border-[#e4e2db] space-y-2">
              {target.description && (
                <p className="text-sm text-[#4e584d] leading-relaxed whitespace-pre-line">
                  {target.description}
                </p>
              )}
              {target.file && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#858d80]">
                  {target.file.folderPath && (
                    <span className="inline-flex items-center gap-1">
                      <Folder className="w-3.5 h-3.5" />
                      폴더 경로: {target.file.folderPath}
                    </span>
                  )}
                  <span>크기: {formatFileSize(target.file.size)}</span>
                  <span>등록일: {new Date(target.file.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
