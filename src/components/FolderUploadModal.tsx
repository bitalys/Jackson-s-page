import React, { useState, useRef } from 'react';
import {
  X,
  FolderUp,
  Upload,
  FileText,
  Image as ImageIcon,
  Film,
  Trash2,
  Youtube,
  CheckCircle2,
} from 'lucide-react';
import {
  PortfolioData,
  SectionCategory,
  UploadedFile,
} from '../types';
import {
  readFileAsDataUrl,
  detectFileCategory,
  formatFileSize,
} from '../utils/storage';

interface FolderUploadModalProps {
  data: PortfolioData;
  defaultSection?: SectionCategory;
  defaultParentId?: string;
  onUploadComplete: (
    files: UploadedFile[],
    targetSection: SectionCategory,
    targetParentId?: string
  ) => void;
  onClose: () => void;
}

export const FolderUploadModal: React.FC<FolderUploadModalProps> = ({
  data,
  defaultSection = 'athletics',
  defaultParentId = '',
  onUploadComplete,
  onClose,
}) => {
  const [targetSection, setTargetSection] = useState<SectionCategory>(defaultSection);
  const [targetParentId, setTargetParentId] = useState<string>(defaultParentId);
  const [stagedFiles, setStagedFiles] = useState<UploadedFile[]>([]);
  const [isReading, setIsReading] = useState(false);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFileList = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsReading(true);
    const loaded: UploadedFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.name.startsWith('.')) continue;
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const category = detectFileCategory(file);
        const relPath =
          (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
          file.name;

        loaded.push({
          id: `upload-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          folderPath: relPath !== file.name ? relPath : undefined,
          type: category,
          mimeType: file.type,
          size: file.size,
          dataUrl,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          youtubeUrl: '',
          section: targetSection,
          parentItemId: targetParentId || undefined,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('File read error:', err);
      }
    }

    setStagedFiles((prev) => [...prev, ...loaded]);
    setIsReading(false);
  };

  const handleUpdateStagedFile = (
    id: string,
    patch: Partial<Pick<UploadedFile, 'caption' | 'youtubeUrl'>>
  ) => {
    setStagedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  };

  const handleRemoveStagedFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getParentOptions = () => {
    switch (targetSection) {
      case 'athletics':
        return data.athletics.map((s) => ({ id: s.id, label: `${s.indexLabel} — ${s.title}` }));
      case 'writing':
        return data.awards.map((a) => ({ id: a.id, label: `${a.year} — ${a.title}` }));
      case 'experiences':
        return data.experiences.map((e) => ({ id: e.id, label: `${e.number} — ${e.title}` }));
      case 'interests':
        return data.interests.map((i) => ({ id: i.id, label: `${i.icon} ${i.title}` }));
      default:
        return [];
    }
  };

  const parentOptions = getParentOptions();

  const handleConfirmUpload = () => {
    if (stagedFiles.length === 0) return;
    const finalized = stagedFiles.map((f) => ({
      ...f,
      section: targetSection,
      parentItemId: targetParentId || undefined,
    }));
    onUploadComplete(finalized, targetSection, targetParentId || undefined);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 md:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#f5f4f0] text-[#202421] border border-[#dcded6] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#f5f4f0]/95 border-b border-[#e4e2db] backdrop-blur-md">
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#788475] uppercase">
              LOCAL FOLDER & PORTFOLIO UPLOADER
            </p>
            <h3 className="font-serif-display text-2xl font-medium text-[#202421]">
              내 컴퓨터 폴더에서 포트폴리오 자료 업로드
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

        <div className="p-6 md:p-8 space-y-6">
          {/* Step 1: Select Destination Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#eeede7] border border-[#dcded6]">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] text-[#555c55] uppercase mb-1.5">
                1. 업로드할 섹션 선택
              </label>
              <select
                value={targetSection}
                onChange={(e) => {
                  const sec = e.target.value as SectionCategory;
                  setTargetSection(sec);
                  setTargetParentId('');
                }}
                className="w-full px-3 py-2.5 bg-white border border-[#c8ccc3] text-xs font-semibold text-[#202421]"
              >
                <option value="athletics">02 — Athletics (스포츠 활동 자료)</option>
                <option value="interests">05 — Interests (취미 및 기부·과외 활동)</option>
                <option value="writing">03 — Writing & Ideas (에세이 / 수상 증명서)</option>
                <option value="experiences">04 — Global Experiences (글로벌 경험 자료)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] text-[#555c55] uppercase mb-1.5">
                2. 세부 연결 항목 (선택 사항)
              </label>
              <select
                value={targetParentId}
                onChange={(e) => setTargetParentId(e.target.value)}
                disabled={parentOptions.length === 0}
                className="w-full px-3 py-2.5 bg-white border border-[#c8ccc3] text-xs font-semibold text-[#202421] disabled:opacity-50"
              >
                <option value="">
                  {parentOptions.length > 0
                    ? '특정 카드/항목에 직접 연결 (또는 섹션 공통)'
                    : '전체 포트폴리오 자료실에 보관'}
                </option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Folder / File Picker Buttons */}
          <div className="border-2 border-dashed border-[#aab1a6] bg-[#f8f7f3] p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-[#e8eae3] flex items-center justify-center text-[#344137]">
                <FolderUp className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-serif-display text-xl text-[#202421]">
                내 컴퓨터의 폴더 또는 파일을 선택해 주세요
              </h4>
              <p className="text-xs text-[#70766e] max-w-md mx-auto">
                폴더 전체를 선택하면 폴더 안의 사진(JPG/PNG), 문서(PDF), 상장, 에세이, 영상 자료들이 폴더 경로와 함께 한 번에 불러와집니다.
              </p>
            </div>

            <input
              ref={folderInputRef}
              type="file"
              {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
              multiple
              onChange={(e) => {
                processFileList(e.target.files);
                e.target.value = '';
              }}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => {
                processFileList(e.target.files);
                e.target.value = '';
              }}
              className="hidden"
            />

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold bg-[#202923] text-white hover:opacity-90 cursor-pointer"
              >
                <FolderUp className="w-4 h-4" />
                내 컴퓨터 폴더 선택 (폴더 통째로 업로드)
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold border border-[#202923] bg-white text-[#202421] hover:bg-[#e8eae3] cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                개별 파일 다중 선택
              </button>
            </div>

            {isReading && (
              <p className="text-xs font-semibold text-[#536b56] pt-2">
                폴더 내 자료를 읽어오는 중입니다...
              </p>
            )}
          </div>

          {/* Step 3: Staged Files Preview & YouTube URL Linker for Images */}
          {stagedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold tracking-[0.08em] text-[#344137] uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#536b56]" />
                  선택된 포트폴리오 자료 ({stagedFiles.length}개)
                </p>
                <button
                  type="button"
                  onClick={() => setStagedFiles([])}
                  className="text-xs text-[#737a72] hover:text-red-700 underline cursor-pointer"
                >
                  전체 비우기
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                {stagedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 bg-white border border-[#dcded6] grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                  >
                    <div className="md:col-span-5 flex items-center gap-3 min-w-0">
                      {file.type === 'image' ? (
                        <img
                          src={file.dataUrl}
                          alt={file.name}
                          className="w-14 h-12 object-cover border border-[#c8ccc3] shrink-0"
                        />
                      ) : file.type === 'video' ? (
                        <div className="w-14 h-12 bg-[#e8eae3] flex items-center justify-center text-[#536b56] shrink-0">
                          <Film className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-14 h-12 bg-[#e8eae3] flex items-center justify-center text-[#536b56] shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <input
                          type="text"
                          value={file.caption || file.name}
                          onChange={(e) =>
                            handleUpdateStagedFile(file.id, { caption: e.target.value })
                          }
                          className="w-full text-xs font-semibold text-[#202421] bg-[#f8f7f3] border border-[#dcded6] px-2 py-1"
                          placeholder="자료 제목"
                        />
                        <p className="text-[10px] text-[#8a9287] truncate mt-1">
                          {file.folderPath || file.name} · {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-6">
                      {file.type === 'image' ? (
                        <div className="relative flex items-center">
                          <Youtube className="w-3.5 h-3.5 text-red-700 absolute left-2.5" />
                          <input
                            type="url"
                            value={file.youtubeUrl || ''}
                            onChange={(e) =>
                              handleUpdateStagedFile(file.id, {
                                youtubeUrl: e.target.value,
                              })
                            }
                            placeholder="이미지 클릭 시 재생할 유튜브 링크 (선택)"
                            className="w-full pl-8 pr-2.5 py-1.5 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#788475] flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                          문서/미디어 파일 ({file.type.toUpperCase()})
                        </span>
                      )}
                    </div>

                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveStagedFile(file.id)}
                        className="p-1.5 text-[#737a72] hover:text-red-700 cursor-pointer"
                        title="제외"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e4e2db]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold border border-[#c8ccc3] bg-white text-[#555c55] hover:text-[#111] cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              disabled={stagedFiles.length === 0}
              onClick={handleConfirmUpload}
              className="px-5 py-2.5 text-xs font-bold bg-[#202923] text-white hover:opacity-90 disabled:opacity-40 cursor-pointer"
            >
              포트폴리오에 자료 {stagedFiles.length > 0 ? `(${stagedFiles.length}개)` : ''} 등록하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
