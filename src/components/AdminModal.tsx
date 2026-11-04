import React, { useState, useRef } from 'react';
import {
  X,
  Lock,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Save,
  RotateCcw,
  Youtube,
  KeyRound,
  Check,
  FileText,
  Image as ImageIcon,
  LogOut,
  Star,
  Calendar,
  Play,
} from 'lucide-react';
import {
  PortfolioData,
  SportItem,
  AwardItem,
  ExperienceItem,
  InterestItem,
  SubActivityItem,
  UploadedFile,
  ProfileSettings,
} from '../types';
import {
  getAdminPassword,
  setAdminPassword,
  readFileAsDataUrl,
  detectFileCategory,
  formatFileSize,
  INITIAL_PORTFOLIO_DATA,
  extractYouTubeId,
  getYouTubeThumbnail,
  sortActivities,
  sortExperiences,
  sortAwards,
  sortAttachments,
} from '../utils/storage';

interface AdminModalProps {
  isAuthenticated: boolean;
  onAuthenticate: () => void;
  onLogout: () => void;
  data: PortfolioData;
  onUpdateData: (newData: PortfolioData) => void;
  onOpenAddMainInterest: () => void;
  onOpenAddSport: () => void;
  onOpenManageCategory: (item: SportItem | InterestItem, type: 'athletics' | 'interests') => void;
  onOpenAddSubActivity: (categoryTitle: string, section: 'athletics' | 'interests', parentId: string) => void;
  onClose: () => void;
}

type AdminTab = 'athletics' | 'interests' | 'writing' | 'experiences' | 'profile';

export const AdminModal: React.FC<AdminModalProps> = ({
  isAuthenticated,
  onAuthenticate,
  onLogout,
  data,
  onUpdateData,
  onOpenAddMainInterest,
  onOpenAddSport,
  onOpenManageCategory,
  onOpenAddSubActivity,
  onClose,
}) => {
  // Login state
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<AdminTab>('profile');
  const [statusToast, setStatusToast] = useState('');

  // Editing items
  const [editingSport, setEditingSport] = useState<SportItem | null>(null);
  const [editingAward, setEditingAward] = useState<AwardItem | null>(null);
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);

  // Profile & Password editor state
  const [profileDraft, setProfileDraft] = useState<ProfileSettings>(data.profile);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const sportCoverInputRef = useRef<HTMLInputElement>(null);
  const sportFilesInputRef = useRef<HTMLInputElement>(null);
  const awardFilesInputRef = useRef<HTMLInputElement>(null);
  const expFilesInputRef = useRef<HTMLInputElement>(null);
  const expCoverInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(''), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = getAdminPassword();
    if (passwordInput === currentPass) {
      setLoginError('');
      setPasswordInput('');
      onAuthenticate();
    } else {
      setLoginError('비밀번호가 일치하지 않습니다. (초기 비밀번호: 1111)');
    }
  };

  // Helper for multi-file read
  const readMultipleFiles = async (
    fileList: FileList | null,
    section: UploadedFile['section']
  ): Promise<UploadedFile[]> => {
    if (!fileList) return [];
    const results: UploadedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (f.name.startsWith('.')) continue;
      const dataUrl = await readFileAsDataUrl(f);
      results.push({
        id: `att-${Date.now()}-${i}`,
        name: f.name,
        type: detectFileCategory(f),
        mimeType: f.type,
        size: f.size,
        dataUrl,
        section,
        createdAt: new Date().toISOString(),
      });
    }
    return results;
  };

  // Delete confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'sport' | 'interest' | 'award' | 'experience';
    id: string;
    title: string;
  } | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    const { type, id, title } = deleteConfirm;

    if (type === 'sport') {
      onUpdateData({
        ...data,
        athletics: data.athletics.filter((s) => s.id !== id),
      });
      showToast(`'${title}' 항목이 삭제되었습니다.`);
    } else if (type === 'interest') {
      onUpdateData({
        ...data,
        interests: data.interests.filter((i) => i.id !== id),
      });
      showToast(`'${title}' 항목이 삭제되었습니다.`);
    } else if (type === 'award') {
      onUpdateData({
        ...data,
        awards: data.awards.filter((a) => a.id !== id),
      });
      showToast(`'${title}' 항목이 삭제되었습니다.`);
    } else if (type === 'experience') {
      onUpdateData({
        ...data,
        experiences: data.experiences.filter((x) => x.id !== id),
      });
      showToast(`'${title}' 항목이 삭제되었습니다.`);
    }

    setDeleteConfirm(null);
  };

  // --- Athletics CRUD ---
  const handleSaveSport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSport || !editingSport.title.trim()) return;
    const exists = data.athletics.some((s) => s.id === editingSport.id);
    const updatedAthletics = exists
      ? data.athletics.map((s) => (s.id === editingSport.id ? editingSport : s))
      : [...data.athletics, editingSport];
    onUpdateData({ ...data, athletics: updatedAthletics });
    setEditingSport(null);
    showToast('스포츠 종목 정보가 저장되었습니다.');
  };

  // --- Awards CRUD ---
  const handleStartNewAward = () => {
    setEditingAward({
      id: `award-${Date.now()}`,
      year: String(new Date().getFullYear()),
      title: '',
      subtitle: 'John Locke Essay Competition',
      essayTitle: '',
      summary: '',
      attachments: [],
    });
  };

  const handleSaveAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAward || !editingAward.title.trim()) return;
    const exists = data.awards.some((a) => a.id === editingAward.id);
    const updatedAwards = exists
      ? data.awards.map((a) => (a.id === editingAward.id ? editingAward : a))
      : [editingAward, ...data.awards];
    onUpdateData({ ...data, awards: sortAwards(updatedAwards) });
    setEditingAward(null);
    showToast('Writing & Award 항목이 저장되었습니다.');
  };

  const handleDeleteAward = (id: string) => {
    onUpdateData({
      ...data,
      awards: data.awards.filter((a) => a.id !== id),
    });
    showToast('Writing & Award 항목이 삭제되었습니다.');
  };

  // --- Experiences CRUD ---
  const handleStartNewExp = () => {
    const nextNum = String(data.experiences.length + 1).padStart(2, '0');
    setEditingExp({
      id: `exp-${Date.now()}`,
      number: nextNum,
      title: '',
      subtitle: '',
      date: '',
      categoryTag: '',
      description: '',
      coverImageUrl: '',
      youtubeUrl: '',
      createdAt: new Date().toISOString(),
      attachments: [],
    });
  };

  const handleSaveExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp || !editingExp.title.trim()) return;
    const exists = data.experiences.some((x) => x.id === editingExp.id);
    const updatedExp = exists
      ? data.experiences.map((x) => (x.id === editingExp.id ? editingExp : x))
      : [editingExp, ...data.experiences];
    onUpdateData({ ...data, experiences: sortExperiences(updatedExp) });
    setEditingExp(null);
    showToast('Global Experience 항목이 저장되었습니다.');
  };

  const handleDeleteExp = (id: string) => {
    onUpdateData({
      ...data,
      experiences: data.experiences.filter((x) => x.id !== id),
    });
    showToast('Global Experience 항목이 삭제되었습니다.');
  };

  // --- Profile & Password Save ---
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateData({
      ...data,
      profile: profileDraft,
    });
    if (newPasswordInput.trim()) {
      setAdminPassword(newPasswordInput.trim());
      setNewPasswordInput('');
      showToast('프로필 및 관리자 비밀번호가 변경되었습니다.');
    } else {
      showToast('프로필 정보가 저장되었습니다.');
    }
  };

  const handleResetAll = () => {
    onUpdateData(INITIAL_PORTFOLIO_DATA);
    setProfileDraft(INITIAL_PORTFOLIO_DATA.profile);
    setAdminPassword('1111');
    showToast('초기 데이터 및 초기 비밀번호(1111)로 초기화되었습니다.');
  };

  if (!isAuthenticated) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md bg-[#f5f4f0] text-[#202421] border border-[#dcded6] p-7 md:p-9 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-[#555c55] hover:text-[#111] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 text-[#788475] text-[10px] font-bold tracking-[0.16em] uppercase mb-2">
            <Lock className="w-3.5 h-3.5" />
            PORTFOLIO ADMIN ACCESS
          </div>
          <h3 className="font-serif-display text-3xl font-medium text-[#202421] mb-2">
            관리자 로그인
          </h3>
          <p className="text-xs text-[#70766e] leading-relaxed mb-6">
            포트폴리오의 종목, 활동, 기부/취미 자료를 추가·수정·삭제하려면 비밀번호를 입력해 주세요.
            <br />
            <span className="font-semibold text-[#344137]">
              (초기 관리자 비밀번호: 1111)
            </span>
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.1em] text-[#555c55] uppercase mb-1.5">
                비밀번호 (Password)
              </label>
              <input
                type="password"
                autoFocus
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호 입력 (1111)"
                className="w-full px-4 py-3 bg-white border border-[#c8ccc3] text-sm focus:outline-none focus:border-[#202923]"
              />
            </div>

            {loginError && (
              <p className="text-xs font-medium text-red-700">{loginError}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold border border-[#c8ccc3] bg-white text-[#555c55] cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold bg-[#202923] text-white hover:opacity-90 cursor-pointer"
              >
                관리자 로그인
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 md:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#f5f4f0] text-[#202421] border border-[#dcded6] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#202923] text-[#f5f4f0] shrink-0">
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#a8b8a1] uppercase">
              JACKSON HONG PORTFOLIO — ADMIN DASHBOARD
            </p>
            <h3 className="font-serif-display text-xl md:text-2xl font-medium">
              포트폴리오 통합 관리자 페이지
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-[#536b56] text-[#d5e6df] hover:bg-[#344137] cursor-pointer"
              title="관리자 잠금"
            >
              <LogOut className="w-3.5 h-3.5" />
              잠금
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#c0c9be] hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 bg-[#e8eae3] border-b border-[#d1d6cc] overflow-x-auto shrink-0">
          {[
            { id: 'profile', label: '01. 대표이미지 수정 & 프로필' },
            { id: 'athletics', label: `02. Athletics (골프·수영 등 ${data.athletics.length})` },
            { id: 'writing', label: `03. Writing & Awards (${data.awards.length})` },
            { id: 'experiences', label: `04. Global Experiences (${data.experiences.length})` },
            { id: 'interests', label: `05. Interests & 사회공헌 (메인 ${data.interests.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#f5f4f0] text-[#202421] border-t border-l border-r border-[#d1d6cc]'
                  : 'text-[#555c55] hover:text-[#202421]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toast */}
        {statusToast && (
          <div className="px-6 py-2.5 bg-[#344137] text-white text-xs font-semibold flex items-center gap-2 shrink-0">
            <Check className="w-4 h-4 text-[#a8b8a1]" />
            {statusToast}
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {/* TAB: ATHLETICS */}
          {activeTab === 'athletics' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[#eeede7] border border-[#dcded6]">
                <div>
                  <h4 className="font-serif-display text-xl text-[#202421]">
                    02 — Athletics 메인 종목 및 하위 세부 활동 관리
                  </h4>
                  <p className="text-xs text-[#70766e] mt-1">
                    Golf, Swimming 등 각 종목 하위에 다양한 활동(대회, 훈련, 입상)을 계속 추가할 수 있으며, 최신 등록 활동 또는 대표 이미지를 첫 페이지에 지정할 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenAddSport}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#202923] text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + 새 스포츠 종목 추가
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.athletics.map((sport) => {
                  const acts = sortActivities(sport.activities || []);
                  const mode = sport.featuredMode || 'latest';
                  return (
                    <div
                      key={sport.id}
                      className="p-5 bg-white border border-[#dcded6] flex flex-col justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold tracking-[0.14em] text-[#8b9785]">
                            {sport.indexLabel}
                          </span>
                          <span className="text-[10px] font-bold text-[#536b56] bg-[#e8eae3] px-2 py-0.5">
                            {mode === 'latest' ? '최신 활동 자동 반영' : mode === 'selected' ? '지정 대표 반영' : '기본 커버/일러스트'}
                          </span>
                        </div>

                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-serif-display text-2xl text-[#202421]">
                              {sport.title}
                            </h5>
                            <p className="text-xs font-semibold text-[#788475]">{sport.tag}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenManageCategory(sport, 'athletics')}
                              className="p-1.5 text-[#555c55] hover:text-[#202421] hover:bg-[#e8eae3] transition-colors cursor-pointer"
                              title="세부 활동 관리 및 대표 선택"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'sport',
                                  id: sport.id,
                                  title: `${sport.indexLabel} — ${sport.title}`,
                                })
                              }
                              className="p-1.5 text-[#737a72] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-[#70766e] line-clamp-2">{sport.description}</p>

                        {/* Sub-activities Preview list */}
                        <div className="p-3 bg-[#f8f7f3] border border-[#e5e3dc] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#344137]">
                              등록된 세부 활동 목록 ({acts.length}개)
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onOpenAddSubActivity(sport.title, 'athletics', sport.id)
                              }
                              className="text-[11px] font-bold text-[#536b56] hover:underline cursor-pointer"
                            >
                              + 새 활동 추가
                            </button>
                          </div>
                          {acts.length === 0 ? (
                            <p className="text-[11px] text-[#8a9287]">등록된 세부 활동이 없습니다.</p>
                          ) : (
                            <div className="space-y-1">
                              {acts.slice(0, 3).map((act, i) => (
                                <div
                                  key={act.id}
                                  className="flex items-center justify-between text-xs text-[#202421] py-1 border-b border-[#eceae2] last:border-0"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="text-[10px] text-[#788475] shrink-0">
                                      {act.date || `${i + 1}.`}
                                    </span>
                                    <span className="truncate">{act.title}</span>
                                  </div>
                                  {act.imageUrl && (
                                    <span className="text-[10px] text-[#536b56] shrink-0 font-medium">
                                      [사진]
                                    </span>
                                  )}
                                </div>
                              ))}
                              {acts.length > 3 && (
                                <p className="text-[10px] text-[#788475] pt-0.5">
                                  외 {acts.length - 3}개 활동 더 있음...
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#e5e3dc] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => onOpenManageCategory(sport, 'athletics')}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#202923] text-white hover:opacity-90 cursor-pointer"
                        >
                          세부 활동 관리 및 대표 선택 ({acts.length}개) ↗
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: INTERESTS & DONATION */}
          {activeTab === 'interests' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[#eeede7] border border-[#dcded6]">
                <div>
                  <h4 className="font-serif-display text-xl text-[#202421]">
                    05 — Beyond the Classroom (취미 및 기부활동 계층 관리)
                  </h4>
                  <p className="text-xs text-[#70766e] mt-1">
                    기부활동, 아이스하키, 기타 등 메인 항목을 추가하고 각 항목 하위에 다양한 활동들을 계속 추가·수정할 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenAddMainInterest}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#202923] text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + 새 메인 항목 추가 (예: 기부활동, 봉사활동 등)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.interests.map((interest) => {
                  const acts = sortActivities(interest.activities || []);
                  const mode = interest.featuredMode || 'latest';
                  return (
                    <div
                      key={interest.id}
                      className="p-5 bg-white border border-[#dcded6] flex flex-col justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl text-[#8a9b83]">{interest.icon}</span>
                          <span className="text-[10px] font-bold text-[#536b56] bg-[#e8eae3] px-2 py-0.5">
                            {mode === 'latest' ? '최신 활동 자동 반영' : mode === 'selected' ? '지정 대표 반영' : '기본 커버'}
                          </span>
                        </div>

                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-serif-display text-2xl text-[#202421]">
                              {interest.title}
                            </h5>
                            <p className="text-xs font-semibold text-[#788475]">{interest.caption}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenManageCategory(interest, 'interests')}
                              className="p-1.5 text-[#555c55] hover:text-[#202421] cursor-pointer"
                              title="세부 활동 관리"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'interest',
                                  id: interest.id,
                                  title: `${interest.icon} ${interest.title}`,
                                })
                              }
                              className="p-1.5 text-[#737a72] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-[#70766e] line-clamp-2">{interest.description}</p>

                        {/* Activities list preview */}
                        <div className="p-3 bg-[#f8f7f3] border border-[#e5e3dc] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#344137]">
                              하위 세부 활동 ({acts.length}개)
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onOpenAddSubActivity(interest.title, 'interests', interest.id)
                              }
                              className="text-[11px] font-bold text-[#536b56] hover:underline cursor-pointer"
                            >
                              + 세부 활동 추가
                            </button>
                          </div>
                          {acts.length === 0 ? (
                            <p className="text-[11px] text-[#8a9287]">등록된 세부 활동이 없습니다.</p>
                          ) : (
                            <div className="space-y-1">
                              {acts.slice(0, 3).map((act, i) => (
                                <div
                                  key={act.id}
                                  className="flex items-center justify-between text-xs text-[#202421] py-1 border-b border-[#eceae2] last:border-0"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="text-[10px] text-[#788475] shrink-0">
                                      {act.date || `${i + 1}.`}
                                    </span>
                                    <span className="truncate">{act.title}</span>
                                  </div>
                                  {act.imageUrl && (
                                    <span className="text-[10px] text-[#536b56] shrink-0 font-medium">
                                      [사진]
                                    </span>
                                  )}
                                </div>
                              ))}
                              {acts.length > 3 && (
                                <p className="text-[10px] text-[#788475] pt-0.5">
                                  외 {acts.length - 3}개 활동 더 있음...
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#e5e3dc]">
                        <button
                          type="button"
                          onClick={() => onOpenManageCategory(interest, 'interests')}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#202923] text-white hover:opacity-90 cursor-pointer"
                        >
                          세부 활동 관리 및 대표 선택 ({acts.length}개) ↗
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: WRITING */}
          {activeTab === 'writing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 bg-[#eeede7] border border-[#dcded6]">
                <div>
                  <h4 className="font-serif-display text-xl text-[#202421]">
                    03 — Writing & John Locke Awards 관리
                  </h4>
                  <p className="text-xs text-[#70766e] mt-1">
                    연도별 수상 내역, 에세이 원고(PDF), 상장 이미지를 추가·수정·삭제할 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartNewAward}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-[#202923] text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + 새 수상 / 에세이 추가
                </button>
              </div>

              {editingAward && (
                <form
                  onSubmit={handleSaveAward}
                  className="p-6 bg-white border-2 border-[#202923] space-y-4"
                >
                  <h5 className="font-serif-display text-xl border-b border-[#e4e2db] pb-2">
                    수상 / 에세이 항목 편집
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                        연도 (Year) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingAward.year}
                        onChange={(e) =>
                          setEditingAward({ ...editingAward, year: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                        수상명 / 결과 (Title) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingAward.title}
                        onChange={(e) =>
                          setEditingAward({ ...editingAward, title: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                        대회 / 부제 (Subtitle)
                      </label>
                      <input
                        type="text"
                        value={editingAward.subtitle}
                        onChange={(e) =>
                          setEditingAward({ ...editingAward, subtitle: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                      에세이 제목 / 요약 설명 (선택)
                    </label>
                    <input
                      type="text"
                      value={editingAward.essayTitle || ''}
                      onChange={(e) =>
                        setEditingAward({ ...editingAward, essayTitle: e.target.value })
                      }
                      placeholder="출품 에세이 주제 또는 설명"
                      className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#e4e2db]">
                    <span className="text-xs text-[#70766e]">
                      첨부된 상장 / 에세이 파일: {editingAward.attachments.length}개
                    </span>
                    <div>
                      <input
                        ref={awardFilesInputRef}
                        type="file"
                        multiple
                        onChange={async (e) => {
                          const uploaded = await readMultipleFiles(
                            e.target.files,
                            'writing'
                          );
                          setEditingAward({
                            ...editingAward,
                            attachments: [...editingAward.attachments, ...uploaded],
                          });
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => awardFilesInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#c8ccc3] bg-[#f8f7f3] cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        상장/에세이 파일 첨부
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingAward(null)}
                      className="px-4 py-2 text-xs font-bold border border-[#c8ccc3] bg-white cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-[#202923] text-white cursor-pointer"
                    >
                      저장하기
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {sortAwards(data.awards).map((award) => (
                  <div
                    key={award.id}
                    className="p-4 bg-white border border-[#dcded6] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-5">
                      <span className="font-serif-display text-2xl text-[#536b56] font-medium">
                        {award.year}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#202421]">{award.title}</p>
                        <p className="text-xs text-[#788475]">
                          {award.subtitle} · 첨부자료 {award.attachments.length}개
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingAward(award)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-[#c8ccc3] bg-[#f8f7f3] cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'award',
                            id: award.id,
                            title: `${award.year} ${award.title}`,
                          })
                        }
                        className="p-1.5 text-[#737a72] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EXPERIENCES */}
          {activeTab === 'experiences' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 bg-[#eeede7] border border-[#dcded6]">
                <div>
                  <h4 className="font-serif-display text-xl text-[#202421]">
                    04 — Global Experiences 관리
                  </h4>
                  <p className="text-xs text-[#70766e] mt-1">
                    해외 거주, 여행, 보딩스쿨 썸머 프로그램 등 글로벌 경험과 사진/자료를 관리합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartNewExp}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-[#202923] text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + 새 글로벌 경험 추가
                </button>
              </div>

              {editingExp && (
                <form
                  onSubmit={handleSaveExp}
                  className="p-6 bg-white border-2 border-[#202923] space-y-4"
                >
                  <h5 className="font-serif-display text-xl border-b border-[#e4e2db] pb-2">
                    글로벌 경험 항목 편집
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                        번호 (Number)
                      </label>
                      <input
                        type="text"
                        value={editingExp.number}
                        onChange={(e) =>
                          setEditingExp({ ...editingExp, number: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                        제목 (Title) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingExp.title}
                        onChange={(e) =>
                          setEditingExp({ ...editingExp, title: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                        지역 / 부제 (Location)
                      </label>
                      <input
                        type="text"
                        value={editingExp.subtitle || ''}
                        onChange={(e) =>
                          setEditingExp({ ...editingExp, subtitle: e.target.value })
                        }
                        placeholder="예: Vancouver & Toronto · Canada"
                        className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                        활동 시기 / 기간 (Date)
                      </label>
                      <input
                        type="text"
                        value={editingExp.date || ''}
                        onChange={(e) =>
                          setEditingExp({ ...editingExp, date: e.target.value })
                        }
                        placeholder="예: 2018 — 2021"
                        className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                        구분 / 태그 (Category Tag)
                      </label>
                      <input
                        type="text"
                        value={editingExp.categoryTag || ''}
                        onChange={(e) =>
                          setEditingExp({ ...editingExp, categoryTag: e.target.value })
                        }
                        placeholder="예: 다문화 적응 & 어학"
                        className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                      />
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div className="p-3 bg-[#f8f7f3] border border-[#dcded6] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#555c55] uppercase flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#536b56]" />
                        대표 썸네일 이미지 (Cover Image)
                      </label>
                      <button
                        type="button"
                        onClick={() => expCoverInputRef.current?.click()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#202923] text-white cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        사진 파일 선택
                      </button>
                    </div>
                    <input
                      ref={expCoverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const dataUrl = await readFileAsDataUrl(file);
                          setEditingExp({ ...editingExp, coverImageUrl: dataUrl });
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <input
                      type="url"
                      value={editingExp.coverImageUrl || ''}
                      onChange={(e) =>
                        setEditingExp({ ...editingExp, coverImageUrl: e.target.value })
                      }
                      placeholder="이미지 주소(URL) 입력 또는 위 버튼으로 업로드"
                      className="w-full px-3 py-1.5 bg-white border border-[#c8ccc3] text-xs"
                    />
                    {editingExp.coverImageUrl && (
                      <div className="relative h-28 w-44 bg-[#e8eae3] border border-[#c8ccc3] overflow-hidden">
                        <img
                          src={editingExp.coverImageUrl}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* YouTube URL */}
                  <div className="p-3 bg-[#f8f7f3] border border-[#dcded6] space-y-2">
                    <label className="block text-[11px] font-bold text-[#555c55] uppercase flex items-center gap-1.5">
                      <Youtube className="w-3.5 h-3.5 text-red-700" />
                      동영상 링크 (YouTube URL)
                    </label>
                    <input
                      type="url"
                      value={editingExp.youtubeUrl || ''}
                      onChange={(e) =>
                        setEditingExp({ ...editingExp, youtubeUrl: e.target.value })
                      }
                      placeholder="예: https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-1.5 bg-white border border-[#c8ccc3] text-xs"
                    />
                    {extractYouTubeId(editingExp.youtubeUrl) && (
                      <p className="text-[11px] text-green-700 font-medium">
                        ✓ YouTube 동영상이 연결되었습니다.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                      내용 (Description)
                    </label>
                    <textarea
                      rows={3}
                      value={editingExp.description}
                      onChange={(e) =>
                        setEditingExp({ ...editingExp, description: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#e4e2db]">
                    <span className="text-xs text-[#70766e]">
                      첨부된 사진/문서: {editingExp.attachments.length}개
                    </span>
                    <div>
                      <input
                        ref={expFilesInputRef}
                        type="file"
                        multiple
                        onChange={async (e) => {
                          const uploaded = await readMultipleFiles(
                            e.target.files,
                            'experiences'
                          );
                          setEditingExp({
                            ...editingExp,
                            attachments: [...editingExp.attachments, ...uploaded],
                          });
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => expFilesInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#c8ccc3] bg-[#f8f7f3] cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        관련 사진/자료 첨부
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingExp(null)}
                      className="px-4 py-2 text-xs font-bold border border-[#c8ccc3] bg-white cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-[#202923] text-white cursor-pointer"
                    >
                      저장하기
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {sortExperiences(data.experiences).map((exp) => {
                  const thumb = exp.coverImageUrl || getYouTubeThumbnail(exp.youtubeUrl);
                  const hasYt = Boolean(extractYouTubeId(exp.youtubeUrl));

                  return (
                    <div
                      key={exp.id}
                      className="p-4 bg-white border border-[#dcded6] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {thumb ? (
                          <div className="relative w-20 h-14 bg-[#e8eae3] border border-[#c8ccc3] overflow-hidden shrink-0">
                            <img
                              src={thumb}
                              alt={exp.title}
                              className="w-full h-full object-cover"
                            />
                            {hasYt && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <span className="w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center">
                                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-20 h-14 bg-[#eeede7] border border-[#c8ccc3] flex items-center justify-center text-[#8a9287] shrink-0">
                            <ImageIcon className="w-5 h-5 opacity-40" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#8a9287]">
                              {exp.number}
                            </span>
                            {exp.categoryTag && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-[#e8eae3] text-[#536b56] font-semibold">
                                {exp.categoryTag}
                              </span>
                            )}
                            {exp.date && (
                              <span className="text-[10px] text-[#788475]">
                                {exp.date}
                              </span>
                            )}
                            {hasYt && (
                              <span className="text-[10px] font-bold text-red-700 flex items-center gap-0.5">
                                <Youtube className="w-3 h-3" />
                                YouTube
                              </span>
                            )}
                          </div>
                          <p className="font-serif-display text-lg text-[#202421] truncate">
                            {exp.title}
                          </p>
                          {exp.subtitle && (
                            <p className="text-xs text-[#536b56] font-medium">
                              {exp.subtitle}
                            </p>
                          )}
                          <p className="text-xs text-[#70766e] truncate max-w-md">
                            {exp.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingExp(exp)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-[#c8ccc3] bg-[#f8f7f3] cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'experience',
                              id: exp.id,
                              title: `${exp.number}. ${exp.title}`,
                            })
                          }
                          className="p-1.5 text-[#737a72] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: PROFILE & REPRESENTATIVE HERO IMAGE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* 01. Representative Image Upload */}
              <div className="p-5 bg-white border border-[#dcded6] space-y-4">
                <div className="flex items-center justify-between border-b border-[#e4e2db] pb-3">
                  <div>
                    <h4 className="font-serif-display text-xl text-[#202421]">
                      01. 포트폴리오 메인 대표 이미지 수정
                    </h4>
                    <p className="text-xs text-[#70766e] mt-0.5">
                      포트폴리오 최상단 히어로(Hero) 영역에 표시될 대표 이미지를 내 컴퓨터에서 업로드하거나 변경할 수 있습니다.
                    </p>
                  </div>
                  <div>
                    <input
                      ref={heroImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const dataUrl = await readFileAsDataUrl(file);
                        setProfileDraft((prev) => ({
                          ...prev,
                          heroCustomImage: dataUrl,
                        }));
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => heroImageInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#202923] text-white hover:opacity-90 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      내 컴퓨터에서 대표 이미지 선택
                    </button>
                  </div>
                </div>

                {profileDraft.heroCustomImage ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-3 bg-[#f8f7f3] border border-[#dcded6]">
                    <div className="relative aspect-video max-h-40 bg-[#eeede7] border border-[#c8ccc3] overflow-hidden">
                      <img
                        src={profileDraft.heroCustomImage}
                        alt="Hero representative preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <p className="text-xs font-bold text-[#344137]">
                        ✓ 사용자 지정 대표 이미지가 등록되어 있습니다.
                      </p>
                      <p className="text-[11px] text-[#788475]">
                        포트폴리오 첫 페이지 히어로 영역에 이 이미지가 메인 대표 비주얼로 나타납니다.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => heroImageInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#c8ccc3] hover:bg-[#e8eae3] cursor-pointer"
                        >
                          다른 이미지로 변경
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setProfileDraft((prev) => ({
                              ...prev,
                              heroCustomImage: undefined,
                            }))
                          }
                          className="px-3 py-1.5 text-xs font-semibold text-red-700 hover:underline cursor-pointer"
                        >
                          대표 이미지 제거 (기본 그래픽 복원)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => heroImageInputRef.current?.click()}
                    className="p-6 border border-dashed border-[#aab1a6] bg-[#f8f7f3] text-center cursor-pointer hover:border-[#202923] transition-colors"
                  >
                    <ImageIcon className="w-8 h-8 text-[#788475] mx-auto mb-1 opacity-70" />
                    <p className="text-xs font-medium text-[#344137]">
                      현재 기본 일러스트 그래픽이 적용되어 있습니다.
                    </p>
                    <p className="text-[11px] text-[#8a9287] mt-0.5">
                      클릭하여 내 컴퓨터에서 포트폴리오를 대표할 사진(프로필, 활동 사진 등)을 업로드해 보세요.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-5 bg-white border border-[#dcded6] space-y-4">
                <h4 className="font-serif-display text-xl text-[#202421] border-b border-[#e4e2db] pb-2">
                  기본 프로필 및 텍스트 문구 수정
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                      상단 키워드 (Eyebrow)
                    </label>
                    <input
                      type="text"
                      value={profileDraft.eyebrow}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, eyebrow: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                      학교 · 졸업연도
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={profileDraft.school}
                        onChange={(e) =>
                          setProfileDraft({ ...profileDraft, school: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                      />
                      <input
                        type="text"
                        value={profileDraft.classYear}
                        onChange={(e) =>
                          setProfileDraft({ ...profileDraft, classYear: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                    히어로 소개글 (Hero Lede)
                  </label>
                  <textarea
                    rows={2}
                    value={profileDraft.heroLede}
                    onChange={(e) =>
                      setProfileDraft({ ...profileDraft, heroLede: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                      01 About 첫 번째 문단
                    </label>
                    <textarea
                      rows={3}
                      value={profileDraft.aboutPara1}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, aboutPara1: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                      01 About 두 번째 문단
                    </label>
                    <textarea
                      rows={3}
                      value={profileDraft.aboutPara2}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, aboutPara2: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#555c55] uppercase mb-1">
                    Contact 이메일 주소
                  </label>
                  <input
                    type="email"
                    value={profileDraft.contactEmail}
                    onChange={(e) =>
                      setProfileDraft({ ...profileDraft, contactEmail: e.target.value })
                    }
                    className="w-full max-w-md px-3 py-2 bg-[#f8f7f3] border border-[#c8ccc3] text-xs"
                  />
                </div>
              </div>

              {/* Password Change Box */}
              <div className="p-5 bg-[#eeede7] border border-[#dcded6] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#202421]">
                  <KeyRound className="w-4 h-4 text-[#536b56]" />
                  관리자 비밀번호 변경 (현재 기본값: 1111)
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="변경할 새 비밀번호 입력 (비워두면 유지)"
                    className="w-72 px-3 py-2 bg-white border border-[#c8ccc3] text-xs"
                  />
                  <span className="text-xs text-[#70766e]">
                    초기 비밀번호는 <b>1111</b>로 설정되어 있습니다.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-800 border border-red-300 bg-red-50 hover:bg-red-100 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  기본 데이터 및 초기 비밀번호(1111)로 초기화
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-[#202923] text-white cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  설정 및 프로필 저장
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-md bg-white border-2 border-[#202923] shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif-display text-lg font-bold text-[#202421]">
                  항목 삭제 확인
                </h4>
                <p className="text-xs text-[#788475]">
                  삭제 후에는 복구할 수 없습니다.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#f8f7f3] border border-[#e5e3dc] text-xs text-[#344137] leading-relaxed">
              정말로 <b>'{deleteConfirm.title}'</b> 항목을 삭제하시겠습니까?
              <br />
              <span className="text-[#a14040] text-[11px] mt-1.5 block font-medium">
                ※ 해당 항목에 등록된 모든 세부 활동 내역과 사진·영상 등 첨부자료도 함께 영구 삭제됩니다.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-bold border border-[#c8ccc3] bg-white text-[#555c55] hover:bg-[#eeede7] transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold bg-red-700 text-white hover:bg-red-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                확인 및 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
