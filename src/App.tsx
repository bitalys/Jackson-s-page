import React, { useState, useEffect } from 'react';
import {
  FolderUp,
  Play,
  FileText,
  Image as ImageIcon,
  Plus,
  Settings,
  Unlock,
  Youtube,
  Pencil,
  Trash2,
  Calendar,
  Star,
  ListFilter,
  CheckCircle2,
} from 'lucide-react';
import {
  PortfolioData,
  InterestItem,
  SportItem,
  SubActivityItem,
  SectionCategory,
  UploadedFile,
} from './types';
import {
  INITIAL_PORTFOLIO_DATA,
  loadPortfolioData,
  savePortfolioData,
  extractYouTubeId,
  getRepresentativeView,
} from './utils/storage';
import { MediaViewerModal, ViewerTarget } from './components/MediaViewerModal';
import { SubActivityModal } from './components/SubActivityModal';
import { CategoryDetailModal } from './components/CategoryDetailModal';
import { MainCategoryModal } from './components/MainCategoryModal';
import { FolderUploadModal } from './components/FolderUploadModal';
import { AdminModal } from './components/AdminModal';

export function App() {
  const [data, setData] = useState<PortfolioData>(INITIAL_PORTFOLIO_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Media / Lightbox / YouTube viewer modal state
  const [viewerTarget, setViewerTarget] = useState<ViewerTarget | null>(null);

  // Category Activities Detail modal state (Golf, Swimming, Donation, Hockey, Guitar)
  const [detailModalState, setDetailModalState] = useState<{
    open: boolean;
    item: SportItem | InterestItem | null;
    type: 'athletics' | 'interests';
  }>({
    open: false,
    item: null,
    type: 'athletics',
  });

  // SubActivity add/edit modal state
  const [subActivityModalState, setSubActivityModalState] = useState<{
    open: boolean;
    categoryTitle: string;
    section: SectionCategory;
    parentId: string;
    activityToEdit: SubActivityItem | null;
  }>({
    open: false,
    categoryTitle: '',
    section: 'athletics',
    parentId: '',
    activityToEdit: null,
  });

  // Main Category add/edit modal state (e.g. Adding 기부활동, or adding a new sport)
  const [mainCategoryModalState, setMainCategoryModalState] = useState<{
    open: boolean;
    categoryType: 'interests' | 'athletics';
    editingItem: InterestItem | SportItem | null;
  }>({
    open: false,
    categoryType: 'interests',
    editingItem: null,
  });

  // Folder / File upload modal state
  const [folderUploadConfig, setFolderUploadConfig] = useState<{
    open: boolean;
    defaultSection: SectionCategory;
    defaultParentId?: string;
  }>({
    open: false,
    defaultSection: 'athletics',
  });

  useEffect(() => {
    loadPortfolioData().then((loaded) => {
      setData(loaded);
      setIsLoaded(true);
    });
  }, []);

  const updateAndPersist = (nextData: PortfolioData) => {
    setData(nextData);
    savePortfolioData(nextData);

    // Keep active detail modal in sync if open
    if (detailModalState.open && detailModalState.item) {
      if (detailModalState.type === 'athletics') {
        const refreshed = nextData.athletics.find(
          (s) => s.id === detailModalState.item?.id
        );
        if (refreshed) {
          setDetailModalState((prev) => ({ ...prev, item: refreshed }));
        }
      } else {
        const refreshed = nextData.interests.find(
          (i) => i.id === detailModalState.item?.id
        );
        if (refreshed) {
          setDetailModalState((prev) => ({ ...prev, item: refreshed }));
        }
      }
    }
  };

  // --- SUB-ACTIVITY CRUD HANDLERS ---
  const handleSaveSubActivity = (savedActivity: SubActivityItem) => {
    const { section, parentId } = subActivityModalState;
    const nextData = { ...data };

    if (section === 'athletics') {
      nextData.athletics = nextData.athletics.map((sport) => {
        if (sport.id !== parentId) return sport;
        const exists = sport.activities.some((a) => a.id === savedActivity.id);
        let updatedActivities: SubActivityItem[];
        if (exists) {
          updatedActivities = sport.activities.map((a) =>
            a.id === savedActivity.id ? savedActivity : a
          );
        } else {
          // Add as latest activity at the beginning
          updatedActivities = [savedActivity, ...sport.activities];
        }

        // If user marked as featured, update selectedActivityId and mode
        let selectedActivityId = sport.selectedActivityId;
        let featuredMode = sport.featuredMode;
        if (savedActivity.isFeatured) {
          selectedActivityId = savedActivity.id;
          featuredMode = 'selected';
        }

        return {
          ...sport,
          activities: updatedActivities,
          selectedActivityId,
          featuredMode,
        };
      });
    } else {
      nextData.interests = nextData.interests.map((interest) => {
        if (interest.id !== parentId) return interest;
        const exists = interest.activities.some((a) => a.id === savedActivity.id);
        let updatedActivities: SubActivityItem[];
        if (exists) {
          updatedActivities = interest.activities.map((a) =>
            a.id === savedActivity.id ? savedActivity : a
          );
        } else {
          updatedActivities = [savedActivity, ...interest.activities];
        }

        let selectedActivityId = interest.selectedActivityId;
        let featuredMode = interest.featuredMode;
        if (savedActivity.isFeatured) {
          selectedActivityId = savedActivity.id;
          featuredMode = 'selected';
        }

        return {
          ...interest,
          activities: updatedActivities,
          selectedActivityId,
          featuredMode,
        };
      });
    }

    updateAndPersist(nextData);
    setSubActivityModalState((prev) => ({
      ...prev,
      open: false,
      activityToEdit: null,
    }));
  };

  const handleDeleteSubActivity = (parentId: string, activityId: string, type: 'athletics' | 'interests') => {
    const nextData = { ...data };
    if (type === 'athletics') {
      nextData.athletics = nextData.athletics.map((sport) => {
        if (sport.id !== parentId) return sport;
        const remaining = sport.activities.filter((a) => a.id !== activityId);
        const selectedActivityId =
          sport.selectedActivityId === activityId ? undefined : sport.selectedActivityId;
        return {
          ...sport,
          activities: remaining,
          selectedActivityId,
        };
      });
    } else {
      nextData.interests = nextData.interests.map((interest) => {
        if (interest.id !== parentId) return interest;
        const remaining = interest.activities.filter((a) => a.id !== activityId);
        const selectedActivityId =
          interest.selectedActivityId === activityId ? undefined : interest.selectedActivityId;
        return {
          ...interest,
          activities: remaining,
          selectedActivityId,
        };
      });
    }
    updateAndPersist(nextData);
  };

  const handleSelectFeaturedActivity = (parentId: string, activityId: string, type: 'athletics' | 'interests') => {
    const nextData = { ...data };
    if (type === 'athletics') {
      nextData.athletics = nextData.athletics.map((sport) => {
        if (sport.id !== parentId) return sport;
        return {
          ...sport,
          featuredMode: 'selected',
          selectedActivityId: activityId,
          activities: sport.activities.map((a) => ({
            ...a,
            isFeatured: a.id === activityId,
          })),
        };
      });
    } else {
      nextData.interests = nextData.interests.map((interest) => {
        if (interest.id !== parentId) return interest;
        return {
          ...interest,
          featuredMode: 'selected',
          selectedActivityId: activityId,
          activities: interest.activities.map((a) => ({
            ...a,
            isFeatured: a.id === activityId,
          })),
        };
      });
    }
    updateAndPersist(nextData);
  };

  const handleChangeFeaturedMode = (
    parentId: string,
    mode: 'latest' | 'selected' | 'default',
    type: 'athletics' | 'interests'
  ) => {
    const nextData = { ...data };
    if (type === 'athletics') {
      nextData.athletics = nextData.athletics.map((sport) => {
        if (sport.id !== parentId) return sport;
        return { ...sport, featuredMode: mode };
      });
    } else {
      nextData.interests = nextData.interests.map((interest) => {
        if (interest.id !== parentId) return interest;
        return { ...interest, featuredMode: mode };
      });
    }
    updateAndPersist(nextData);
  };

  // --- MAIN CATEGORY CRUD (Interests & Athletics) ---
  const handleSaveMainInterest = (savedInterest: InterestItem) => {
    const exists = data.interests.some((i) => i.id === savedInterest.id);
    const updated = exists
      ? data.interests.map((i) => (i.id === savedInterest.id ? savedInterest : i))
      : [savedInterest, ...data.interests];
    updateAndPersist({ ...data, interests: updated });
    setMainCategoryModalState((prev) => ({ ...prev, open: false, editingItem: null }));
  };

  const handleSaveMainSport = (savedSport: SportItem) => {
    const exists = data.athletics.some((s) => s.id === savedSport.id);
    const updated = exists
      ? data.athletics.map((s) => (s.id === savedSport.id ? savedSport : s))
      : [...data.athletics, savedSport];
    updateAndPersist({ ...data, athletics: updated });
    setMainCategoryModalState((prev) => ({ ...prev, open: false, editingItem: null }));
  };

  // --- FOLDER / FILES UPLOAD COMPLETED ---
  const handleFolderUploadComplete = (
    files: UploadedFile[],
    targetSection: SectionCategory,
    targetParentId?: string
  ) => {
    const nextData: PortfolioData = { ...data };

    if (targetSection === 'athletics' && targetParentId) {
      // Convert image files into activities under this sport if applicable
      const imageActivities: SubActivityItem[] = files
        .filter((f) => f.type === 'image')
        .map((f, idx) => ({
          id: `act-upload-${f.id}`,
          title: f.caption || f.name.replace(/\.[^/.]+$/, ''),
          date: `${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}`,
          description: f.folderPath ? `폴더 경로: ${f.folderPath}` : '',
          imageUrl: f.dataUrl,
          youtubeUrl: f.youtubeUrl,
          createdAt: f.createdAt,
          attachments: [],
        }));
      const nonImages = files.filter((f) => f.type !== 'image');

      nextData.athletics = nextData.athletics.map((sport) => {
        if (sport.id !== targetParentId) return sport;
        return {
          ...sport,
          activities: [...imageActivities, ...sport.activities],
          attachments: [...sport.attachments, ...nonImages],
        };
      });
    } else if (targetSection === 'interests' && targetParentId) {
      const imageActivities: SubActivityItem[] = files
        .filter((f) => f.type === 'image')
        .map((f) => ({
          id: `act-upload-${f.id}`,
          title: f.caption || f.name.replace(/\.[^/.]+$/, ''),
          date: `${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}`,
          description: f.folderPath ? `폴더 경로: ${f.folderPath}` : '',
          imageUrl: f.dataUrl,
          youtubeUrl: f.youtubeUrl,
          createdAt: f.createdAt,
          attachments: [],
        }));
      const nonImages = files.filter((f) => f.type !== 'image');

      nextData.interests = nextData.interests.map((interest) => {
        if (interest.id !== targetParentId) return interest;
        return {
          ...interest,
          activities: [...imageActivities, ...interest.activities],
          attachments: [...interest.attachments, ...nonImages],
        };
      });
    } else if (targetSection === 'writing' && targetParentId) {
      nextData.awards = nextData.awards.map((a) =>
        a.id === targetParentId
          ? { ...a, attachments: [...a.attachments, ...files] }
          : a
      );
    } else if (targetSection === 'experiences' && targetParentId) {
      nextData.experiences = nextData.experiences.map((x) =>
        x.id === targetParentId
          ? { ...x, attachments: [...x.attachments, ...files] }
          : x
      );
    }

    updateAndPersist(nextData);
    setFolderUploadConfig({ open: false, defaultSection: 'athletics' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="topline"></div>

      {/* 3-ZONE TOP BAR CONTRACT */}
      <header className="site-header">
        {/* Zone 1: Wordmark */}
        <a className="wordmark" href="#home" aria-label="Jackson Hong home">
          JH<span>.</span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav
          className={`nav ${mobileMenuOpen ? 'open' : ''}`}
          aria-label="Main navigation"
        >
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>
            About
          </a>
          <a href="#athletics" onClick={() => setMobileMenuOpen(false)}>
            Athletics
          </a>
          <a href="#writing" onClick={() => setMobileMenuOpen(false)}>
            Writing
          </a>
          <a href="#experiences" onClick={() => setMobileMenuOpen(false)}>
            Experiences
          </a>
          <a href="#interests" onClick={() => setMobileMenuOpen(false)}>
            Interests & 사회공헌
          </a>
        </nav>

        {/* Zone 3: Primary Action + Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setAdminModalOpen(true)}
            className="nav-contact inline-flex items-center gap-2 text-xs font-semibold text-[#202421] hover:bg-[#e8eae3] transition-colors cursor-pointer whitespace-nowrap"
          >
            {isAdminAuthenticated ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-[#536b56]" />
                관리자 페이지 (열림)
              </>
            ) : (
              <>
                <Settings className="w-3.5 h-3.5 text-[#788475]" />
                관리자 페이지
              </>
            )}
          </button>
          <button
            type="button"
            className="menu-toggle"
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Admin Mode Bar if unlocked */}
      {isAdminAuthenticated && (
        <div className="bg-[#202923] text-[#f5f4f0] px-[7.2%] py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-[#344137]">
          <div className="flex items-center gap-2">
            <Unlock className="w-3.5 h-3.5 text-[#a8b8a1]" />
            <span>
              <b>관리자 모드 활성화됨:</b> 각 종목 및 취미 카드의 [세부 활동 관리] 버튼을 눌러 활동을 추가·수정하고 대표 이미지를 선택할 수 있습니다.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMainCategoryModalState({
                  open: true,
                  categoryType: 'interests',
                  editingItem: null,
                })
              }
              className="underline text-[#a8b8a1] hover:text-white font-semibold cursor-pointer"
            >
              + 새 메인 항목 추가 (기부활동 등)
            </button>
            <button
              type="button"
              onClick={() => setAdminModalOpen(true)}
              className="underline text-white font-semibold cursor-pointer"
            >
              관리자 대시보드 열기
            </button>
            <button
              type="button"
              onClick={() => setIsAdminAuthenticated(false)}
              className="text-[#c0c9be] hover:text-white cursor-pointer"
            >
              잠금
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-line"></span> {data.profile.eyebrow}
            </p>
            <h1>
              {data.profile.heroTitleLine1}
              <br />
              <em>{data.profile.heroTitleItalic}</em>
            </h1>
            <p className="hero-lede">{data.profile.heroLede}</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#about">
                Get to know me <span>↘</span>
              </a>
              <a className="text-link" href="#athletics">
                Explore my journey <span>→</span>
              </a>
            </div>
            <div className="hero-meta">
              <span>{data.profile.school}</span>
              <span>·</span>
              <span>{data.profile.classYear}</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Hero composition">
            {data.profile.heroCustomImage ? (
              <div className="relative w-full h-full">
                <img
                  src={data.profile.heroCustomImage}
                  alt="Jackson Hong representative hero"
                  className="w-full h-full object-cover"
                />
                <div className="art-card art-card-top !bg-white/90 !backdrop-blur-sm">
                  <span>REPRESENTATIVE</span>
                  <b>{data.profile.school.split(' ')[0] || 'STUDENT'}</b>
                </div>
                <div className="art-card art-card-bottom !bg-white/95 !backdrop-blur-sm">
                  <span>ALWAYS IN PROGRESS</span>
                  <b>
                    Learn.
                    <br />
                    Practice.
                    <br />
                    Repeat.
                  </b>
                </div>
              </div>
            ) : (
              <>
                <div className="art-circle"></div>
                <div className="art-vertical"></div>
                <div className="art-card art-card-top">
                  <span>01 / 04</span>
                  <b>LEADERSHIP</b>
                </div>
                <div className="art-card art-card-bottom">
                  <span>ALWAYS IN PROGRESS</span>
                  <b>
                    Learn.
                    <br />
                    Practice.
                    <br />
                    Repeat.
                  </b>
                </div>
                <div className="art-caption">
                  A portfolio of interests
                  <br />
                  and ongoing pursuits
                </div>
              </>
            )}
          </div>

          <a className="scroll-cue" href="#about">
            <span></span> SCROLL TO EXPLORE
          </a>
        </section>

        {/* 01 — ABOUT */}
        <section className="intro section-wrap" id="about">
          <div className="section-kicker">01 — ABOUT</div>
          <div className="intro-content">
            <p className="section-label">{data.profile.aboutLabel}</p>
            <h2>
              {data.profile.aboutTitleLine1}
              <br />
              through <em>{data.profile.aboutTitleItalic}</em>
            </h2>
            <div className="intro-columns">
              <p>{data.profile.aboutPara1}</p>
              <p>{data.profile.aboutPara2}</p>
            </div>
          </div>
        </section>

        {/* STATS BAND */}
        <section className="stats-band">
          {data.profile.stats.map((st) => (
            <div className="stat" key={st.id}>
              <strong>
                {st.valueMain}
                {st.valueSuffix ? <span>{st.valueSuffix}</span> : null}
              </strong>
              <span>
                {st.labelLine1}
                <br />
                {st.labelLine2}
              </span>
            </div>
          ))}
        </section>

        {/* 02 — ATHLETICS (Golf, Swimming and Sub-Activities Hierarchy) */}
        <section className="athletics section-wrap" id="athletics">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <div className="section-kicker">02 — ATHLETICS</div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setMainCategoryModalState({
                    open: true,
                    categoryType: 'athletics',
                    editingItem: null,
                  })
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#536b56] hover:text-[#202421] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                새 스포츠 종목 추가
              </button>
              <span className="text-[#c8ccc3]">·</span>
              <button
                type="button"
                onClick={() =>
                  setFolderUploadConfig({
                    open: true,
                    defaultSection: 'athletics',
                    defaultParentId: data.athletics[0]?.id,
                  })
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#536b56] hover:text-[#202421] cursor-pointer"
              >
                <FolderUp className="w-3.5 h-3.5" />
                컴퓨터 폴더 자료 업로드
              </button>
            </div>
          </div>

          <div className="section-heading">
            <div>
              <p className="section-label">Commitment in motion</p>
              <h2>
                Progress is built
                <br />
                <em>one practice at a time.</em>
              </h2>
            </div>
            <p className="heading-note">{data.profile.athleticsHeadingNote}</p>
          </div>

          {/* Sport Cards Grid */}
          <div className="sport-grid">
            {data.athletics.map((sport) => {
              const rep = getRepresentativeView(sport);
              const repYtId = extractYouTubeId(rep.youtubeUrl);
              const acts = sport.activities || [];

              return (
                <article
                  key={sport.id}
                  className={`sport-card ${
                    sport.visualStyle === 'golf' ? 'golf-card' : 'swim-card'
                  }`}
                >
                  <div className="sport-index">
                    <span className="font-bold">{sport.indexLabel}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#536b56] font-semibold bg-[#e8eae3] px-2 py-0.5">
                        {rep.modeLabel}
                      </span>
                      {isAdminAuthenticated && (
                        <button
                          type="button"
                          onClick={() =>
                            setMainCategoryModalState({
                              open: true,
                              categoryType: 'athletics',
                              editingItem: sport,
                            })
                          }
                          className="text-[10px] font-semibold text-[#536b56] hover:underline cursor-pointer"
                        >
                          수정
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Representative Visual Box (Selected activity image, latest image, or custom visual) */}
                  {rep.imageUrl ? (
                    <div
                      onClick={() =>
                        setViewerTarget({
                          title: rep.activityTitle || sport.title,
                          subtitle: `${sport.title} · ${rep.modeLabel}`,
                          date: rep.activityDate,
                          description: rep.activityDescription || sport.description,
                          imageUrl: rep.imageUrl,
                          youtubeUrl: rep.youtubeUrl,
                        })
                      }
                      className="sport-visual group cursor-pointer bg-[#dcded6] relative overflow-hidden"
                    >
                      <img
                        src={rep.imageUrl}
                        alt={rep.activityTitle || sport.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {repYtId ? (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent flex flex-col justify-between p-3.5">
                          <span className="self-end px-2 py-0.5 bg-red-700 text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                            <Youtube className="w-3 h-3" />
                            YouTube 연동
                          </span>
                          <div className="flex items-center gap-2 text-white">
                            <span className="w-8 h-8 rounded-full bg-white text-[#202923] flex items-center justify-center shrink-0">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </span>
                            <span className="text-xs font-bold leading-tight truncate">
                              {rep.activityTitle || '클릭하여 연동 영상 재생'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/65 text-white text-[10px] font-semibold">
                          대표 사진 (클릭하여 확대)
                        </div>
                      )}
                    </div>
                  ) : sport.visualStyle === 'swim' ? (
                    <div className="sport-visual swim-visual">
                      <div className="pool-lane lane-one"></div>
                      <div className="pool-lane lane-two"></div>
                      <div className="pool-lane lane-three"></div>
                      <div className="pool-shimmer"></div>
                    </div>
                  ) : (
                    <div className="sport-visual golf-visual">
                      <div className="sun"></div>
                      <div className="hill hill-back"></div>
                      <div className="hill hill-front"></div>
                      <div className="flag"></div>
                    </div>
                  )}

                  <div className="sport-body">
                    <div className="sport-title-row">
                      <h3>{sport.title}</h3>
                      <span className="tag">{sport.tag}</span>
                    </div>
                    <p>{sport.description}</p>

                    <ul className="detail-list">
                      {sport.details.map((detail, idx) => (
                        <li key={idx}>
                          <span>{detail.label}</span>
                          <b>{detail.value}</b>
                        </li>
                      ))}
                    </ul>

                    {/* Sub-Activities Timeline Preview */}
                    <div className="mt-5 pt-4 border-t border-[#dcded6] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-[0.14em] text-[#788475] uppercase flex items-center gap-1.5">
                          <ListFilter className="w-3.5 h-3.5 text-[#536b56]" />
                          활동 내역 (최신 {Math.min(acts.length, 5)}개 / 전체 {acts.length}개)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSubActivityModalState({
                              open: true,
                              categoryTitle: sport.title,
                              section: 'athletics',
                              parentId: sport.id,
                              activityToEdit: null,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#536b56] hover:text-[#202421] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />새 활동 추가
                        </button>
                      </div>

                      {acts.length === 0 ? (
                        <p className="text-xs text-[#8a9287]">
                          등록된 세부 활동이 없습니다. [+ 새 활동 추가]를 눌러 대회나 훈련 기록을 등록하세요.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {/* 최신 1개: 썸네일 이미지 강조 표시 */}
                          {acts[0] && (() => {
                            const latestAct = acts[0];
                            const hasLatestYt = Boolean(extractYouTubeId(latestAct.youtubeUrl));
                            return (
                              <div
                                onClick={() =>
                                  setViewerTarget({
                                    title: latestAct.title,
                                    subtitle: `${sport.title} · 최신 등록 활동`,
                                    date: latestAct.date,
                                    categoryTag: latestAct.categoryTag,
                                    description: latestAct.description,
                                    imageUrl: latestAct.imageUrl,
                                    youtubeUrl: latestAct.youtubeUrl,
                                  })
                                }
                                className="p-2.5 bg-white border border-[#536b56]/40 hover:border-[#536b56] shadow-xs cursor-pointer transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  {/* Thumbnail Image */}
                                  <div className="relative w-24 h-16 sm:w-28 sm:h-18 bg-[#e8eae3] border border-[#c8ccc3] overflow-hidden shrink-0">
                                    {latestAct.imageUrl ? (
                                      <img
                                        src={latestAct.imageUrl}
                                        alt={latestAct.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-[#788475] bg-[#eeede7]">
                                        <ImageIcon className="w-5 h-5 opacity-50 mb-0.5" />
                                        <span className="text-[9px]">사진 없음</span>
                                      </div>
                                    )}
                                    {hasLatestYt && (
                                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                        <span className="w-6 h-6 rounded-full bg-red-700 text-white flex items-center justify-center">
                                          <Play className="w-3 h-3 fill-current ml-0.5" />
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Title & Metadata */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                      <span className="text-[9px] font-bold text-white bg-[#202923] px-1.5 py-0.5">
                                        최신 활동
                                      </span>
                                      {latestAct.date && (
                                        <span className="text-[10px] text-[#788475]">{latestAct.date}</span>
                                      )}
                                      {latestAct.categoryTag && (
                                        <span className="text-[10px] text-[#536b56] font-semibold bg-[#e8eae3] px-1.5 py-0.5">
                                          {latestAct.categoryTag}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="text-xs font-bold text-[#202421] line-clamp-2 leading-snug">
                                      {latestAct.title}
                                    </h4>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* 다음 최신 4개 (2번~5번) */}
                          {acts.slice(1, 5).map((act, idx) => {
                            const hasActYt = Boolean(extractYouTubeId(act.youtubeUrl));
                            return (
                              <div
                                key={act.id}
                                onClick={() =>
                                  setViewerTarget({
                                    title: act.title,
                                    subtitle: `${sport.title} · ${act.categoryTag || '활동'}`,
                                    date: act.date,
                                    categoryTag: act.categoryTag,
                                    description: act.description,
                                    imageUrl: act.imageUrl,
                                    youtubeUrl: act.youtubeUrl,
                                  })
                                }
                                className="px-2.5 py-1.5 bg-[#f8f7f3] border border-[#e5e3dc] hover:border-[#8a9b83] transition-colors cursor-pointer flex items-center justify-between gap-2 text-xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[10px] font-mono text-[#8a9287] shrink-0">
                                    0{idx + 2}
                                  </span>
                                  {act.date && (
                                    <span className="text-[10px] text-[#788475] shrink-0">{act.date}</span>
                                  )}
                                  {act.categoryTag && (
                                    <span className="text-[10px] font-medium text-[#536b56] shrink-0">
                                      [{act.categoryTag}]
                                    </span>
                                  )}
                                  <span className="truncate font-medium text-[#202421]">{act.title}</span>
                                </div>
                                <div className="shrink-0 flex items-center gap-1.5">
                                  {hasActYt && (
                                    <Play className="w-3 h-3 text-red-700 fill-current" />
                                  )}
                                  <span className="text-[10px] text-[#8a9287]">↗</span>
                                </div>
                              </div>
                            );
                          })}

                          {/* + more 팝업 메뉴 버튼 (전체 목록 확인) */}
                          <div className="pt-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setDetailModalState({
                                  open: true,
                                  item: sport,
                                  type: 'athletics',
                                })
                              }
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-[#f8f7f3] border border-[#c8ccc3] text-[#202421] hover:bg-white hover:border-[#202923] transition-colors cursor-pointer"
                            >
                              <span>+ more</span>
                              <span className="text-[#555c55] font-normal">
                                (전체 {acts.length}개 활동 목록 팝업 열기 ↗)
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {sport.footnote && (
                      <p className="small-note">{sport.footnote}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 03 — WRITING & IDEAS */}
        <section className="writing section-wrap" id="writing">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
            <div className="section-kicker">03 — WRITING & IDEAS</div>
            <button
              type="button"
              onClick={() =>
                setFolderUploadConfig({
                  open: true,
                  defaultSection: 'writing',
                  defaultParentId: data.awards[0]?.id,
                })
              }
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#536b56] hover:text-[#202421] cursor-pointer"
            >
              <FolderUp className="w-3.5 h-3.5" />
              + 에세이 원고/상장 폴더 업로드
            </button>
          </div>

          <div className="writing-layout">
            <div className="writing-lead">
              <p className="section-label">Thinking through writing</p>
              <h2>
                Good questions
                <br />
                lead to <em>better thinking.</em>
              </h2>
              <p>{data.profile.writingLeadCopy}</p>
            </div>

            <div className="award-panel">
              <div className="award-top">
                <span>{data.profile.awardTopLeft}</span>
                <span>{data.profile.awardTopRight}</span>
              </div>
              <h3>{data.profile.awardHeadline}</h3>

              {data.awards.map((award) => (
                <div key={award.id} className="border-t border-[#e3e4de] py-3.5">
                  <div className="award-row !border-0 !py-0">
                    <span>{award.year}</span>
                    <b>{award.title}</b>
                    <small>{award.subtitle}</small>
                  </div>
                  {award.attachments.length > 0 && (
                    <div className="mt-2 pl-[60px] flex flex-wrap gap-2">
                      {award.attachments.map((att) => (
                        <button
                          key={att.id}
                          type="button"
                          onClick={() =>
                            setViewerTarget({
                              title: att.caption || att.name,
                              subtitle: `${award.year} ${award.title} — ${award.subtitle}`,
                              description: award.essayTitle,
                              file: att,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eeede7] border border-[#c8ccc3] text-[11px] font-medium text-[#202421] hover:border-[#202923] cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-[#536b56]" />
                          <span>{att.caption || att.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <p className="award-footnote">{data.profile.awardFootnote}</p>
            </div>
          </div>
        </section>

        {/* 04 — GLOBAL EXPERIENCES */}
        <section className="experiences section-wrap" id="experiences">
          <div className="experience-heading">
            <div className="section-kicker mb-3">04 — GLOBAL EXPERIENCES</div>
            <p className="section-label">Learning beyond familiar places</p>
            <h2>
              New places.
              <br />
              <em>New perspectives.</em>
            </h2>
            <button
              type="button"
              onClick={() =>
                setFolderUploadConfig({
                  open: true,
                  defaultSection: 'experiences',
                  defaultParentId: data.experiences[0]?.id,
                })
              }
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#536b56] hover:text-[#202421] cursor-pointer"
            >
              <FolderUp className="w-3.5 h-3.5" />
              + 글로벌 경험 사진/폴더 업로드
            </button>
          </div>

          <div className="experience-list">
            {data.experiences.map((exp) => (
              <article key={exp.id}>
                <span className="experience-no">{exp.number}</span>
                <div className="space-y-2">
                  <h3>{exp.title}</h3>
                  <p>{exp.description}</p>
                  {exp.attachments.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {exp.attachments.map((att) => (
                        <button
                          key={att.id}
                          type="button"
                          onClick={() =>
                            setViewerTarget({
                              title: att.caption || att.name,
                              subtitle: `${exp.number} · ${exp.title}`,
                              file: att,
                              youtubeUrl: att.youtubeUrl,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eeede7] border border-[#c8ccc3] text-xs font-medium text-[#202421] hover:border-[#202923] cursor-pointer"
                        >
                          {att.type === 'image' ? (
                            <ImageIcon className="w-3.5 h-3.5 text-[#536b56]" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-[#536b56]" />
                          )}
                          <span>{att.caption || att.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="experience-mark">↗</span>
              </article>
            ))}
          </div>
        </section>

        {/* 05 — BEYOND THE CLASSROOM (INTERESTS, DONATIONS, EXTENSION ACTIVITIES) */}
        <section className="interests section-wrap" id="interests">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="section-kicker">05 — BEYOND THE CLASSROOM (취미 & 기부·사회공헌)</div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setMainCategoryModalState({
                    open: true,
                    categoryType: 'interests',
                    editingItem: null,
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#202923] text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                새 메인 항목 추가 (예: 기부활동, 봉사활동 등)
              </button>
              <button
                type="button"
                onClick={() =>
                  setFolderUploadConfig({
                    open: true,
                    defaultSection: 'interests',
                    defaultParentId: data.interests[0]?.id,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-[#c8ccc3] bg-[#f8f7f3] text-[#202421] hover:bg-white cursor-pointer"
              >
                <FolderUp className="w-3.5 h-3.5 text-[#536b56]" />
                컴퓨터 폴더 자료 업로드
              </button>
            </div>
          </div>

          <div className="interest-content">
            <div>
              <p className="section-label">Other things I enjoy</p>
              <h2>
                Room to explore
                <br />
                <em>and contribute.</em>
              </h2>
              <p className="text-xs text-[#70766e] leading-relaxed max-w-sm mt-2">
                기부활동, 아이스하키, 기타 등 메인 항목마다 다양한 세부 활동들을 계속해서 추가할 수 있습니다. 이미지를 등록하고 유튜브 영상 링크를 연동하여 활동 기록을 생생하게 공유하세요.
              </p>
            </div>

            {/* Interest Main Category Cards */}
            <div className="interest-cards">
              {data.interests.map((interest) => {
                const rep = getRepresentativeView(interest);
                const repYtId = extractYouTubeId(rep.youtubeUrl);
                const acts = interest.activities || [];

                return (
                  <article key={interest.id} className="interest-card">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="interest-icon">{interest.icon}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setSubActivityModalState({
                                open: true,
                                categoryTitle: interest.title,
                                section: 'interests',
                                parentId: interest.id,
                                activityToEdit: null,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold border border-[#dcded6] bg-white text-[#4e584d] hover:border-[#202923] hover:text-[#202421] transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            세부 활동 추가
                          </button>
                          {isAdminAuthenticated && (
                            <button
                              type="button"
                              onClick={() =>
                                setMainCategoryModalState({
                                  open: true,
                                  categoryType: 'interests',
                                  editingItem: interest,
                                })
                              }
                              className="p-1 text-[#8a9287] hover:text-[#202421] cursor-pointer"
                              title="메인 항목 수정"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Representative Image + Linked YouTube Video Preview */}
                      {rep.imageUrl && (
                        <div
                          onClick={() =>
                            setViewerTarget({
                              title: rep.activityTitle || interest.title,
                              subtitle: `${interest.title} · ${rep.modeLabel}`,
                              date: rep.activityDate,
                              description: rep.activityDescription || interest.description,
                              imageUrl: rep.imageUrl,
                              youtubeUrl: rep.youtubeUrl,
                            })
                          }
                          className="relative h-44 w-full bg-[#e8eae3] border border-[#dcded6] overflow-hidden group cursor-pointer"
                        >
                          <img
                            src={rep.imageUrl}
                            alt={rep.activityTitle || interest.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {repYtId ? (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent flex flex-col justify-between p-3">
                              <span className="self-end px-2 py-0.5 bg-red-700 text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                                <Youtube className="w-3 h-3" />
                                YouTube 연동
                              </span>
                              <div className="flex items-center gap-2 text-white">
                                <span className="w-8 h-8 rounded-full bg-white/95 text-[#202923] flex items-center justify-center shrink-0">
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </span>
                                <span className="text-xs font-bold leading-tight truncate">
                                  {rep.activityTitle || '클릭하여 연동 유튜브 영상 재생'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/65 text-white text-[10px] font-semibold">
                              대표 사진 (클릭하여 확대)
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <h3>{interest.title}</h3>
                        <p>{interest.description}</p>
                      </div>

                      {/* Sub-Activities List */}
                      <div className="pt-2 border-t border-[#e5e3dc] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold tracking-[0.1em] text-[#788475] uppercase flex items-center gap-1">
                            <ListFilter className="w-3 h-3 text-[#536b56]" />
                            활동 내역 (최신 {Math.min(acts.length, 5)}개 / 전체 {acts.length}개)
                          </span>
                          <span className="text-[10px] text-[#536b56] font-semibold bg-[#e8eae3] px-1.5 py-0.5">
                            {rep.modeLabel}
                          </span>
                        </div>

                        {acts.length === 0 ? (
                          <p className="text-[11px] text-[#8a9287]">
                            등록된 세부 활동이 없습니다. [+ 세부 활동 추가]를 눌러 활동을 추가해 보세요.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {/* 최신 1개: 썸네일 이미지 강조 표시 */}
                            {acts[0] && (() => {
                              const latestAct = acts[0];
                              const hasLatestYt = Boolean(extractYouTubeId(latestAct.youtubeUrl));
                              return (
                                <div
                                  onClick={() =>
                                    setViewerTarget({
                                      title: latestAct.title,
                                      subtitle: `${interest.title} · 최신 등록 활동`,
                                      date: latestAct.date,
                                      categoryTag: latestAct.categoryTag,
                                      description: latestAct.description,
                                      imageUrl: latestAct.imageUrl,
                                      youtubeUrl: latestAct.youtubeUrl,
                                    })
                                  }
                                  className="p-2.5 bg-white border border-[#536b56]/40 hover:border-[#536b56] shadow-xs cursor-pointer transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Thumbnail Image */}
                                    <div className="relative w-24 h-16 sm:w-28 sm:h-18 bg-[#e8eae3] border border-[#c8ccc3] overflow-hidden shrink-0">
                                      {latestAct.imageUrl ? (
                                        <img
                                          src={latestAct.imageUrl}
                                          alt={latestAct.title}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-[#788475] bg-[#eeede7]">
                                          <ImageIcon className="w-5 h-5 opacity-50 mb-0.5" />
                                          <span className="text-[9px]">사진 없음</span>
                                        </div>
                                      )}
                                      {hasLatestYt && (
                                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                          <span className="w-6 h-6 rounded-full bg-red-700 text-white flex items-center justify-center">
                                            <Play className="w-3 h-3 fill-current ml-0.5" />
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Title & Metadata */}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                        <span className="text-[9px] font-bold text-white bg-[#202923] px-1.5 py-0.5">
                                          최신 활동
                                        </span>
                                        {latestAct.date && (
                                          <span className="text-[10px] text-[#788475]">{latestAct.date}</span>
                                        )}
                                        {latestAct.categoryTag && (
                                          <span className="text-[10px] text-[#536b56] font-semibold bg-[#e8eae3] px-1.5 py-0.5">
                                            {latestAct.categoryTag}
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="text-xs font-bold text-[#202421] line-clamp-2 leading-snug">
                                        {latestAct.title}
                                      </h4>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* 다음 최신 4개 (2번~5번) */}
                            {acts.slice(1, 5).map((act, idx) => {
                              const hasActYt = Boolean(extractYouTubeId(act.youtubeUrl));
                              return (
                                <div
                                  key={act.id}
                                  onClick={() =>
                                    setViewerTarget({
                                      title: act.title,
                                      subtitle: `${interest.title} · ${act.categoryTag || '활동'}`,
                                      date: act.date,
                                      categoryTag: act.categoryTag,
                                      description: act.description,
                                      imageUrl: act.imageUrl,
                                      youtubeUrl: act.youtubeUrl,
                                    })
                                  }
                                  className="px-2.5 py-1.5 bg-[#f8f7f3] border border-[#e5e3dc] hover:border-[#8a9b83] transition-colors cursor-pointer flex items-center justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-[10px] font-mono text-[#8a9287] shrink-0">
                                      0{idx + 2}
                                    </span>
                                    {act.date && (
                                      <span className="text-[10px] text-[#788475] shrink-0">{act.date}</span>
                                    )}
                                    {act.categoryTag && (
                                      <span className="text-[10px] font-medium text-[#536b56] shrink-0">
                                        [{act.categoryTag}]
                                      </span>
                                    )}
                                    <span className="truncate font-medium text-[#202421]">{act.title}</span>
                                  </div>
                                  <div className="shrink-0 flex items-center gap-1.5">
                                    {hasActYt && (
                                      <Play className="w-3 h-3 text-red-700 fill-current" />
                                    )}
                                    <span className="text-[10px] text-[#8a9287]">↗</span>
                                  </div>
                                </div>
                              );
                            })}

                            {/* + more 팝업 메뉴 버튼 (전체 목록 확인) */}
                            <div className="pt-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setDetailModalState({
                                    open: true,
                                    item: interest,
                                    type: 'interests',
                                  })
                                }
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-[#f8f7f3] border border-[#c8ccc3] text-[#202421] hover:bg-white hover:border-[#202923] transition-colors cursor-pointer"
                              >
                                <span>+ more</span>
                                <span className="text-[#555c55] font-normal">
                                  (전체 {acts.length}개 활동 목록 팝업 열기 ↗)
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-2 flex items-center justify-between border-t border-[#eceae2]">
                      <span className="interest-caption">{interest.caption}</span>
                      {repYtId && rep.youtubeUrl && (
                        <a
                          href={rep.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 hover:underline"
                        >
                          YouTube 영상 ↗
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 06 — CONTACT */}
        <section className="closing section-wrap" id="contact">
          <p className="section-label">06 — CONTACT</p>
          <h2>
            Thank you for
            <br />
            <em>taking a look.</em>
          </h2>
          <p className="closing-copy">{data.profile.closingCopy}</p>
          <a
            className="button button-light"
            href={`mailto:${data.profile.contactEmail}`}
          >
            Get in touch <span>↗</span>
          </a>
          <p className="contact-note">{data.profile.contactNote}</p>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <a className="wordmark" href="#home">
          JH<span>.</span>
        </a>
        <span>© {new Date().getFullYear()} Jackson Hong</span>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setAdminModalOpen(true)}
            className="text-[10px] font-bold tracking-[0.1em] text-[#555c55] hover:text-[#202421] cursor-pointer uppercase"
          >
            ADMIN (초기 비밀번호: 1111)
          </button>
          <a href="#home" className="font-bold">
            BACK TO TOP ↑
          </a>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Media / Lightbox Viewer Modal */}
      <MediaViewerModal
        target={viewerTarget}
        onClose={() => setViewerTarget(null)}
      />

      {/* 2. Category Detail & Sub-Activities Modal */}
      {detailModalState.open && detailModalState.item && (
        <CategoryDetailModal
          item={detailModalState.item}
          categoryType={detailModalState.type}
          onAddActivity={() => {
            const currentItem = detailModalState.item!;
            const type = detailModalState.type;
            setSubActivityModalState({
              open: true,
              categoryTitle: currentItem.title,
              section: type,
              parentId: currentItem.id,
              activityToEdit: null,
            });
          }}
          onEditActivity={(act) => {
            const currentItem = detailModalState.item!;
            const type = detailModalState.type;
            setSubActivityModalState({
              open: true,
              categoryTitle: currentItem.title,
              section: type,
              parentId: currentItem.id,
              activityToEdit: act,
            });
          }}
          onDeleteActivity={(actId) => {
            handleDeleteSubActivity(
              detailModalState.item!.id,
              actId,
              detailModalState.type
            );
          }}
          onSelectFeaturedActivity={(actId) => {
            handleSelectFeaturedActivity(
              detailModalState.item!.id,
              actId,
              detailModalState.type
            );
          }}
          onChangeFeaturedMode={(mode) => {
            handleChangeFeaturedMode(
              detailModalState.item!.id,
              mode,
              detailModalState.type
            );
          }}
          onViewMedia={(act) => {
            setViewerTarget({
              title: act.title,
              subtitle: `${detailModalState.item?.title} · ${act.categoryTag || '활동 기록'}`,
              date: act.date,
              categoryTag: act.categoryTag,
              description: act.description,
              imageUrl: act.imageUrl,
              youtubeUrl: act.youtubeUrl,
            });
          }}
          onClose={() => setDetailModalState({ open: false, item: null, type: 'athletics' })}
        />
      )}

      {/* 3. Sub-Activity Add / Edit Modal */}
      {subActivityModalState.open && (
        <SubActivityModal
          categoryTitle={subActivityModalState.categoryTitle}
          categorySection={subActivityModalState.section}
          initialActivity={subActivityModalState.activityToEdit}
          onSave={handleSaveSubActivity}
          onClose={() =>
            setSubActivityModalState((prev) => ({
              ...prev,
              open: false,
              activityToEdit: null,
            }))
          }
        />
      )}

      {/* 4. Main Category Add / Edit Modal (Interests or Athletics) */}
      {mainCategoryModalState.open && (
        <MainCategoryModal
          categoryType={mainCategoryModalState.categoryType}
          initialItem={mainCategoryModalState.editingItem}
          onSaveInterest={handleSaveMainInterest}
          onSaveSport={handleSaveMainSport}
          onClose={() =>
            setMainCategoryModalState((prev) => ({
              ...prev,
              open: false,
              editingItem: null,
            }))
          }
        />
      )}

      {/* 5. Folder / Multiple Files Upload Modal */}
      {folderUploadConfig.open && (
        <FolderUploadModal
          data={data}
          defaultSection={folderUploadConfig.defaultSection}
          defaultParentId={folderUploadConfig.defaultParentId}
          onUploadComplete={handleFolderUploadComplete}
          onClose={() =>
            setFolderUploadConfig({ open: false, defaultSection: 'athletics' })
          }
        />
      )}

      {/* 6. Admin Modal */}
      {adminModalOpen && (
        <AdminModal
          isAuthenticated={isAdminAuthenticated}
          onAuthenticate={() => setIsAdminAuthenticated(true)}
          onLogout={() => setIsAdminAuthenticated(false)}
          data={data}
          onUpdateData={updateAndPersist}
          onOpenAddMainInterest={() => {
            setAdminModalOpen(false);
            setMainCategoryModalState({
              open: true,
              categoryType: 'interests',
              editingItem: null,
            });
          }}
          onOpenAddSport={() => {
            setAdminModalOpen(false);
            setMainCategoryModalState({
              open: true,
              categoryType: 'athletics',
              editingItem: null,
            });
          }}
          onOpenManageCategory={(item, type) => {
            setAdminModalOpen(false);
            setDetailModalState({
              open: true,
              item,
              type,
            });
          }}
          onOpenAddSubActivity={(categoryTitle, section, parentId) => {
            setAdminModalOpen(false);
            setSubActivityModalState({
              open: true,
              categoryTitle,
              section,
              parentId,
              activityToEdit: null,
            });
          }}
          onClose={() => setAdminModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
