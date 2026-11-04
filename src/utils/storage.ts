import {
  PortfolioData,
  UploadedFile,
  SportItem,
  InterestItem,
  SubActivityItem,
  AwardItem,
  ExperienceItem,
  ProfileSettings,
} from '../types';

const DB_NAME = 'JacksonHongPortfolioDB';
const DB_VERSION = 2;
const STORE_NAME = 'portfolio_store';
const DATA_KEY = 'portfolio_data_v2';
const ADMIN_PASS_KEY = 'jh_portfolio_admin_password';

export const INITIAL_PORTFOLIO_DATA: PortfolioData = {
  profile: {
    eyebrow: 'STUDENT · ATHLETE · WRITER',
    heroTitleLine1: 'Curious by nature.',
    heroTitleItalic: 'Driven by growth.',
    heroLede:
      'I’m Jackson Hong, a student at Chadwick International School. I enjoy challenging myself, learning from different perspectives, and growing through experiences both inside and outside the classroom.',
    school: 'CHADWICK INTERNATIONAL SCHOOL',
    classYear: 'CLASS OF 2029',
    aboutLabel: 'A little about me',
    aboutTitleLine1: 'Becoming who I am',
    aboutTitleItalic: 'what I pursue.',
    aboutPara1:
      'I’m interested in the ways discipline, curiosity, and creativity shape the person I become. Whether I’m leading a golf team, working toward a faster swim, or developing an idea through writing, I value the process as much as the outcome.',
    aboutPara2:
      'Having lived in Canada and traveled from a young age, I’ve learned to appreciate new environments and different points of view. I hope to keep exploring, asking thoughtful questions, and contributing positively to the communities I’m part of.',
    stats: [
      {
        id: 'stat-1',
        valueMain: '3',
        valueSuffix: '×',
        labelLine1: 'Years of John Locke',
        labelLine2: 'recognition · 2024–2026',
      },
      {
        id: 'stat-2',
        valueMain: '01',
        valueSuffix: '',
        labelLine1: 'Varsity Golf Team',
        labelLine2: 'Captain',
      },
      {
        id: 'stat-3',
        valueMain: '50',
        valueSuffix: 'm',
        labelLine1: 'School breaststroke',
        labelLine2: 'record held through H1 2026',
      },
      {
        id: 'stat-4',
        valueMain: '’29',
        valueSuffix: '',
        labelLine1: 'Expected graduation',
        labelLine2: 'year',
      },
    ],
    athleticsHeadingNote:
      'Sport has taught me to stay focused, support teammates, respond to setbacks, and keep working toward the next goal.',
    writingLeadCopy:
      'Writing is a way for me to examine ideas, consider perspectives different from my own, and communicate what I think with clarity. The John Locke Essay Competition has encouraged me to keep developing these skills.',
    awardTopLeft: 'JOHN LOCKE',
    awardTopRight: '2024 — 2026',
    awardHeadline: 'Three consecutive years\nof recognition.',
    awardFootnote: 'The specific 2024 award category can be added once confirmed.',
    contactEmail: 'jackson.hong@example.com',
    closingCopy:
      'I’m always interested in learning from new people and experiences. Thank you for visiting my portfolio.',
    contactNote: 'Add a student-managed email address before publishing.',
  },
  athletics: [
    {
      id: 'sport-golf',
      indexLabel: 'A / GOLF',
      title: 'Golf',
      tag: 'VARSITY CAPTAIN',
      description:
        'As captain of the Varsity Golf Team, I value the responsibility of setting a positive example and helping create a team environment where everyone can improve.',
      visualStyle: 'golf',
      featuredMode: 'latest',
      activities: [
        {
          id: 'golf-act-1',
          title: '2026 전국 청소년 골프 토너먼트 (남학생부 3위 입상)',
          date: '2026.04',
          categoryTag: '대회 입상',
          description:
            '안정적인 티샷과 퍼팅 집중력을 바탕으로 최종 라운드 3위를 기록하며 팀의 종합 상위권 진입을 이끌었습니다.',
          createdAt: '2026-04-12T09:00:00Z',
          attachments: [],
        },
        {
          id: 'golf-act-2',
          title: 'Varsity Golf Team 주장 선임 및 정기 팀 라운딩 훈련',
          date: '2025.10',
          categoryTag: '주장 활동',
          description:
            '팀원들과 함께 코스 매니지먼트 전략을 논의하고 주 3회 정기 연습 세션을 주도하였습니다.',
          createdAt: '2025-10-18T10:00:00Z',
          attachments: [],
        },
        {
          id: 'golf-act-3',
          title: '숏게임 및 벙커샷 집중 테크닉 강화 세션',
          date: '2025.06',
          categoryTag: '테크닉 훈련',
          description:
            '그린 주변 세이브율을 높이기 위해 다양한 라이에서의 웨지 샷 데이터와 궤도를 분석했습니다.',
          createdAt: '2025-06-20T14:00:00Z',
          attachments: [],
        },
      ],
      details: [
        { label: 'Leadership', value: 'Varsity Golf Team Captain' },
        {
          label: 'Competition',
          value: '3rd overall among boys in recent school competition results*',
        },
      ],
      footnote:
        '*Competition wording and event details can be refined when the official results are available.',
      attachments: [],
    },
    {
      id: 'sport-swim',
      indexLabel: 'B / SWIMMING',
      title: 'Swimming',
      tag: 'VARSITY TEAM',
      description:
        'Swimming gives me a clear way to measure consistency and progress. I enjoy both freestyle and breaststroke, and I continue to work on technique, strength, and speed.',
      visualStyle: 'swim',
      featuredMode: 'latest',
      activities: [
        {
          id: 'swim-act-1',
          title: '교내 50m 평형 신기록 수립 (2026 상반기 공식 기록)',
          date: '2026.05',
          categoryTag: '신기록 수립',
          description:
            '글라이딩 효율을 높이고 턴 동작을 단축시켜 학교 50m 평형 역대 최고 기록을 달성했습니다.',
          createdAt: '2026-05-10T11:00:00Z',
          attachments: [],
        },
        {
          id: 'swim-act-2',
          title: '국제학교 대항전 자유형 & 평형 대표 출전',
          date: '2025.11',
          categoryTag: '대항전 출전',
          description:
            '자유형 100m 및 평형 50m 종목에서 개인 최고 기록을 경신하며 팀 계영 주자로도 활약했습니다.',
          createdAt: '2025-11-22T08:30:00Z',
          attachments: [],
        },
        {
          id: 'swim-act-3',
          title: '동계 스타트 & 스트로크 파워 집중 훈련',
          date: '2025.08',
          categoryTag: '정기 훈련',
          description:
            '수중 카메라 모니터링을 통해 입수 각도와 킥 템포를 미세 조정하여 초반 15m 기록을 단축했습니다.',
          createdAt: '2025-08-15T07:00:00Z',
          attachments: [],
        },
      ],
      details: [
        { label: 'Events', value: 'Freestyle · Breaststroke' },
        {
          label: 'Achievement',
          value: 'Held the school 50m breaststroke record through the first half of 2026',
        },
      ],
      attachments: [],
    },
  ],
  awards: [
    {
      id: 'award-2026',
      year: '2026',
      title: 'Commendation',
      subtitle: 'John Locke Essay Competition',
      essayTitle: '2026 John Locke Essay Competition Entry',
      summary: 'Third consecutive year of international recognition in essay writing.',
      createdAt: '2026-06-01T00:00:00Z',
      attachments: [],
    },
    {
      id: 'award-2025',
      year: '2025',
      title: 'Commendation',
      subtitle: 'John Locke Essay Competition',
      essayTitle: '2025 John Locke Essay Competition Entry',
      summary: 'Awarded Commendation by the Oxford-affiliated adjudication panel.',
      createdAt: '2025-06-01T00:00:00Z',
      attachments: [],
    },
    {
      id: 'award-2024',
      year: '2024',
      title: 'Award recipient',
      subtitle: 'Recognition received',
      essayTitle: '2024 John Locke Junior Category Submission',
      summary: 'Recognized for analytical rigor and philosophical inquiry.',
      createdAt: '2024-06-01T00:00:00Z',
      attachments: [],
    },
  ],
  experiences: [
    {
      id: 'exp-2',
      number: '01',
      title: 'Travel & exploration',
      subtitle: 'Europe, Asia & North America',
      date: '2022 — Present',
      categoryTag: '글로벌 견문 & 문화탐방',
      description:
        'Traveling from a young age has helped me stay open to unfamiliar places, people, and ways of seeing the world.',
      coverImageUrl:
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=FjU_x1106pg',
      createdAt: '2026-04-01T00:00:00Z',
      attachments: [],
    },
    {
      id: 'exp-3',
      number: '02',
      title: 'U.S. boarding school summer programs',
      subtitle: 'Massachusetts & New Hampshire · USA',
      date: 'Summer 2024 & 2025',
      categoryTag: '썸머 아카데믹 & 리더십',
      description:
        'Participating in summer programs at leading boarding schools in the eastern United States gave me a taste of residential school life and learning in a new environment.',
      coverImageUrl:
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=bTqVqk7FSmY',
      createdAt: '2025-08-31T00:00:00Z',
      attachments: [],
    },
    {
      id: 'exp-1',
      number: '03',
      title: 'Living in Canada',
      subtitle: 'Vancouver & Toronto · Canada',
      date: '2018 — 2021',
      categoryTag: '다문화 적응 & 어학',
      description:
        'Living in Canada gave me an early opportunity to experience a different culture and community. It also helped spark my interest in ice hockey.',
      coverImageUrl:
        'https://images.unsplash.com/photo-1517935703635-27c946e6ab90?auto=format&fit=crop&w=1200&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=1La4QzGeaaQ',
      createdAt: '2021-12-31T00:00:00Z',
      attachments: [],
    },
  ],
  interests: [
    {
      id: 'interest-donation',
      icon: '🤝',
      title: '기부 및 사회공헌 활동',
      caption: 'COMMUNITY · VOLUNTEERING',
      description:
        '학습과 스포츠에서 얻은 긍정적인 에너지를 이웃과 나누며, 함께 성장하는 사회적 책임을 실천하고 있습니다.',
      featuredMode: 'latest',
      activities: [
        {
          id: 'don-act-1',
          title: '어린이 도서관 도서 120권 기증 및 주말 독서 멘토링',
          date: '2026.03',
          categoryTag: '도서 기증 & 교육',
          description:
            '다양한 분야의 어린이 교양 도서를 모아 지역 아동센터에 전달하고, 주말 책 읽기 프로그램을 함께 진행했습니다.',
          createdAt: '2026-03-24T10:00:00Z',
          attachments: [],
        },
        {
          id: 'don-act-2',
          title: '겨울철 따뜻한 나눔, 사랑의 연탄 나눔 자원봉사',
          date: '2025.12',
          categoryTag: '생활 지원 나눔',
          description:
            '추운 겨울 취약계층 가구를 위해 연탄을 직접 배달하며 온정을 전하고 나눔의 보람을 배웠습니다.',
          createdAt: '2025-12-15T09:00:00Z',
          attachments: [],
        },
        {
          id: 'don-act-3',
          title: '청소년 스포츠 장비 나눔 및 꿈나무 지도 봉사',
          date: '2025.07',
          categoryTag: '스포츠 재능기부',
          description:
            '사용하지 않는 스포츠 용품을 점검해 기증하고 기초 수영 및 골프 기본기를 가르쳐주는 재능기부를 실천했습니다.',
          createdAt: '2025-07-28T14:00:00Z',
          attachments: [],
        },
      ],
      attachments: [],
    },
    {
      id: 'interest-hockey',
      icon: '🏒',
      title: 'Ice Hockey',
      caption: 'SPORT · RECREATION',
      description:
        'An interest that began during my time in Canada and remains one of the activities I enjoy, teaching agility, teamwork, and quick decision-making.',
      featuredMode: 'latest',
      activities: [
        {
          id: 'hockey-act-1',
          title: '캐나다 유스 아이스하키 클럽 친선 매치 참가',
          date: '2026.01',
          categoryTag: '친선 경기',
          description:
            '현지 유스 클럽 선수들과의 교류전을 통해 빠른 템포의 스케이팅과 팀워크 수비 전술을 체득했습니다.',
          createdAt: '2026-01-20T15:00:00Z',
          attachments: [],
        },
        {
          id: 'hockey-act-2',
          title: '동계 아이스링크 퍽 핸들링 & 슈팅 훈련',
          date: '2025.10',
          categoryTag: '정기 훈련',
          description:
            '빙판 위에서의 밸런스 유지와 슬랩샷 정밀도를 높이기 위한 개인 맞춤 훈련을 진행했습니다.',
          createdAt: '2025-10-05T18:00:00Z',
          attachments: [],
        },
      ],
      attachments: [],
    },
    {
      id: 'interest-guitar',
      icon: '♪',
      title: 'Guitar',
      caption: 'MUSIC · IN PROGRESS',
      description:
        'I’m learning guitar and enjoy the steady process of building musical skills, patience, and creative expression through practice.',
      featuredMode: 'latest',
      activities: [
        {
          id: 'guitar-act-1',
          title: '학교 자선 축제 어쿠스틱 앙상블 합주 공연',
          date: '2025.11',
          categoryTag: '축제 연주',
          description:
            '어쿠스틱 기타 리듬 파트를 맡아 밴드와 함께 곡을 편곡하고 관객들에게 따뜻한 음악을 선사했습니다.',
          createdAt: '2025-11-14T19:00:00Z',
          attachments: [],
        },
        {
          id: 'guitar-act-2',
          title: '핑거스타일 클래식 곡 연주 연습 프로젝트',
          date: '2025.08',
          categoryTag: '주법 연습',
          description:
            '메트로놈에 맞춘 아르페지오 연습을 통해 섬세한 음색 표현과 핑거링 기법을 꾸준히 연마하고 있습니다.',
          createdAt: '2025-08-10T16:00:00Z',
          attachments: [],
        },
      ],
      attachments: [],
    },
  ],
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error('IndexedDB open timeout'));
    }, 2000);

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => {
        clearTimeout(timer);
        resolve(request.result);
      };
      request.onerror = () => {
        clearTimeout(timer);
        reject(request.error || new Error('IndexedDB error'));
      };
      request.onblocked = () => {
        clearTimeout(timer);
        reject(new Error('IndexedDB blocked'));
      };
    } catch (e) {
      clearTimeout(timer);
      reject(e);
    }
  });
}

export async function loadPortfolioData(): Promise<PortfolioData> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(INITIAL_PORTFOLIO_DATA);
      }, 1500);

      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(DATA_KEY);
        req.onsuccess = () => {
          clearTimeout(timer);
          if (req.result) {
            const loaded = req.result as PortfolioData;
            const migrated = migrateData(loaded);
            resolve(migrated);
          } else {
            resolve(INITIAL_PORTFOLIO_DATA);
          }
        };
        req.onerror = () => {
          clearTimeout(timer);
          resolve(INITIAL_PORTFOLIO_DATA);
        };
      } catch {
        clearTimeout(timer);
        resolve(INITIAL_PORTFOLIO_DATA);
      }
    });
  } catch {
    return INITIAL_PORTFOLIO_DATA;
  }
}

function migrateData(data: Partial<PortfolioData>): PortfolioData {
  if (!data || typeof data !== 'object') {
    return INITIAL_PORTFOLIO_DATA;
  }

  // Merge profile and guarantee stats array
  const rawProfile: Partial<ProfileSettings> = data.profile || {};
  const mergedProfile = {
    ...INITIAL_PORTFOLIO_DATA.profile,
    ...rawProfile,
    stats: Array.isArray(rawProfile.stats) && rawProfile.stats.length > 0
      ? rawProfile.stats
      : INITIAL_PORTFOLIO_DATA.profile.stats,
  };

  // Merge athletics
  const rawAthletics = Array.isArray(data.athletics) && data.athletics.length > 0
    ? data.athletics
    : INITIAL_PORTFOLIO_DATA.athletics;

  const athletics: SportItem[] = rawAthletics.map((sport) => {
    const defaultSport = INITIAL_PORTFOLIO_DATA.athletics.find((s) => s.id === sport.id);
    const activities = Array.isArray(sport.activities) && sport.activities.length > 0
      ? sport.activities
      : defaultSport?.activities || [];
    const details = Array.isArray(sport.details) && sport.details.length > 0
      ? sport.details
      : defaultSport?.details || [];
    const attachments = Array.isArray(sport.attachments) ? sport.attachments : [];

    return {
      ...sport,
      visualStyle: sport.visualStyle || defaultSport?.visualStyle || 'golf',
      featuredMode: sport.featuredMode || 'latest',
      activities: sortActivities(activities),
      details,
      attachments: sortAttachments(attachments),
    };
  });

  // Merge interests
  const rawInterests = Array.isArray(data.interests) && data.interests.length > 0
    ? data.interests
    : INITIAL_PORTFOLIO_DATA.interests;

  const interests: InterestItem[] = rawInterests.map((interest) => {
    const defaultInt = INITIAL_PORTFOLIO_DATA.interests.find((i) => i.id === interest.id);
    let activities = Array.isArray(interest.activities) ? interest.activities : [];

    if (activities.length === 0) {
      // Check legacy mediaGallery
      const oldGallery = (interest as unknown as { mediaGallery?: { id: string; title: string; imageUrl: string; youtubeUrl?: string; description?: string; createdAt: string }[] }).mediaGallery;
      if (Array.isArray(oldGallery) && oldGallery.length > 0) {
        activities = oldGallery.map((g, idx) => ({
          id: g.id || `act-${idx}`,
          title: g.title,
          date: new Date(g.createdAt || Date.now()).toLocaleDateString(),
          description: g.description || '',
          imageUrl: g.imageUrl,
          youtubeUrl: g.youtubeUrl,
          createdAt: g.createdAt || new Date().toISOString(),
          attachments: [],
        }));
      } else if (defaultInt?.activities) {
        activities = defaultInt.activities;
      }
    }

    return {
      ...interest,
      featuredMode: interest.featuredMode || 'latest',
      activities: sortActivities(activities),
      attachments: sortAttachments(Array.isArray(interest.attachments) ? interest.attachments : []),
    };
  });

  // Ensure donation is present
  if (!interests.some((i) => i.id === 'interest-donation')) {
    const donationItem = INITIAL_PORTFOLIO_DATA.interests.find((i) => i.id === 'interest-donation');
    if (donationItem) {
      interests.unshift(donationItem);
    }
  }

  // Merge awards (sorted newest first)
  const rawAwards = Array.isArray(data.awards) && data.awards.length > 0
    ? data.awards
    : INITIAL_PORTFOLIO_DATA.awards;

  const awards = sortAwards(
    rawAwards.map((a) => ({
      ...a,
      attachments: sortAttachments(Array.isArray(a.attachments) ? a.attachments : []),
    }))
  );

  // Merge experiences (sorted newest first)
  const defaultExps = INITIAL_PORTFOLIO_DATA.experiences;
  const rawExps = Array.isArray(data.experiences) && data.experiences.length > 0
    ? data.experiences
    : defaultExps;

  const experiences = sortExperiences(
    rawExps.map((x) => {
      const defaultExp = defaultExps.find((d) => d.id === x.id || d.number === x.number);
      return {
        ...defaultExp,
        ...x,
        subtitle: x.subtitle || defaultExp?.subtitle || '',
        date: x.date || defaultExp?.date || '',
        categoryTag: x.categoryTag || defaultExp?.categoryTag || '',
        coverImageUrl: x.coverImageUrl || defaultExp?.coverImageUrl || '',
        youtubeUrl: x.youtubeUrl || defaultExp?.youtubeUrl || '',
        createdAt: x.createdAt || defaultExp?.createdAt || new Date().toISOString(),
        attachments: sortAttachments(
          Array.isArray(x.attachments) ? x.attachments : (defaultExp?.attachments || [])
        ),
      };
    })
  );

  return {
    profile: mergedProfile,
    athletics,
    awards,
    experiences,
    interests,
  };
}

export async function savePortfolioData(data: PortfolioData): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, DATA_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save portfolio data to IndexedDB:', err);
  }
}

export function getAdminPassword(): string {
  try {
    return localStorage.getItem(ADMIN_PASS_KEY) || '1111';
  } catch {
    return '1111';
  }
}

export function setAdminPassword(newPassword: string): void {
  try {
    localStorage.setItem(ADMIN_PASS_KEY, newPassword);
  } catch (err) {
    console.error('Failed to save password:', err);
  }
}

export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  try {
    const parsed = new URL(trimmed);
    const v = parsed.searchParams.get('v');
    if (v && v.length === 11) return v;
  } catch {
    // ignore invalid URL
  }

  return null;
}

export function getYouTubeThumbnail(url?: string): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function detectFileCategory(file: File): UploadedFile['type'] {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/.test(name)) {
    return 'image';
  }
  if (mime === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf';
  }
  if (mime.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/.test(name)) {
    return 'video';
  }
  if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac)$/.test(name)) {
    return 'audio';
  }
  return 'document';
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * Extracts a comparable numeric score from freeform date strings.
 * Higher number = more recent date.
 * Handles:
 * - "2026.05.10" -> 20260510
 * - "2026.04" -> 20260400
 * - "2025.12" -> 20251200
 * - "2025 가을" -> 20251000
 * - "Summer 2024 & 2025" -> 20250700
 * - "2022 — Present" / "현재" -> 20991231 (active / ongoing)
 * - "2018 — 2021" -> 20210000
 * - "2026" -> 20260000
 */
export function extractDateScore(dateStr?: string): number {
  if (!dateStr) return 0;
  const str = dateStr.trim().toLowerCase();
  if (!str) return 0;

  // 1. Ongoing / Present indicators (should be considered latest active)
  const isPresent =
    str.includes('present') ||
    str.includes('현재') ||
    str.includes('진행중') ||
    str.includes('재학중') ||
    str.includes('now');

  // 2. Find all 4-digit years (e.g. 2018, 2021, 2024, 2025, 2026)
  const yearMatches = str.match(/\b(19\d\d|20\d\d)\b/g);
  let maxYear = 0;
  if (yearMatches && yearMatches.length > 0) {
    maxYear = Math.max(...yearMatches.map((y) => parseInt(y, 10)));
  }

  if (isPresent) {
    return 20990000 + (maxYear > 0 ? maxYear : 2026);
  }

  // 3. If no 4-digit year found, try Date.parse
  if (maxYear === 0) {
    const parsed = Date.parse(str);
    if (!isNaN(parsed)) {
      return parsed;
    }
    return 0;
  }

  // 4. Extract Month & Day
  let month = 0;
  let day = 0;

  if (str.includes('겨울') || str.includes('winter')) {
    month = 12;
  } else if (str.includes('가을') || str.includes('autumn') || str.includes('fall')) {
    month = 10;
  } else if (str.includes('여름') || str.includes('summer')) {
    month = 7;
  } else if (str.includes('봄') || str.includes('spring')) {
    month = 4;
  } else {
    // Look for Month pattern after year: YYYY.MM or YYYY-MM or YYYY/MM
    const ymMatch = str.match(/(?:19\d\d|20\d\d)[.\-/](\d{1,2})(?:[.\-/](\d{1,2}))?/);
    if (ymMatch) {
      month = parseInt(ymMatch[1], 10) || 0;
      day = parseInt(ymMatch[2], 10) || 0;
    } else {
      const koreanMonthMatch = str.match(/(\d{1,2})\s*월/);
      if (koreanMonthMatch) {
        month = parseInt(koreanMonthMatch[1], 10) || 0;
        const koreanDayMatch = str.match(/(\d{1,2})\s*일/);
        if (koreanDayMatch) {
          day = parseInt(koreanDayMatch[1], 10) || 0;
        }
      }
    }
  }

  if (month < 0 || month > 12) month = 0;
  if (day < 0 || day > 31) day = 0;

  return maxYear * 10000 + month * 100 + day;
}

export function compareItemsByDateDesc<
  T extends {
    date?: string;
    year?: string;
    createdAt?: string;
    id?: string;
  }
>(a: T, b: T): number {
  const dateStrA = a.date || a.year;
  const dateStrB = b.date || b.year;

  const scoreA = extractDateScore(dateStrA);
  const scoreB = extractDateScore(dateStrB);

  // 1. If parsed dates differ, latest date first
  if (scoreA !== scoreB) {
    return scoreB - scoreA;
  }

  // 2. If dates match or are absent, newly created/saved thread first ("나중에 저장된 쓰레드 우선")
  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  if (timeA !== timeB) {
    return timeB - timeA;
  }

  // 3. Fallback to ID string comparison
  return (b.id || '').localeCompare(a.id || '');
}

export function sortActivities(activities: SubActivityItem[]): SubActivityItem[] {
  return [...activities].sort(compareItemsByDateDesc);
}

export function sortExperiences(experiences: ExperienceItem[]): ExperienceItem[] {
  return [...experiences].sort(compareItemsByDateDesc);
}

export function sortAwards(awards: AwardItem[]): AwardItem[] {
  return [...awards].sort(compareItemsByDateDesc);
}

export function sortAttachments(attachments: UploadedFile[]): UploadedFile[] {
  return [...attachments].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return (b.id || '').localeCompare(a.id || '');
  });
}

/**
 * Returns the effective featured representative details for a SportItem or InterestItem.
 * Handles 'latest' (most recent activity with image/youtube), 'selected' (user-picked activity), or 'default' (custom cover image).
 */
export interface RepresentativeView {
  imageUrl?: string;
  youtubeUrl?: string;
  activityTitle?: string;
  activityDate?: string;
  activityDescription?: string;
  activityId?: string;
  modeLabel: string;
}

export function getRepresentativeView(
  item: SportItem | InterestItem
): RepresentativeView {
  const activities = sortActivities(item.activities || []);
  const mode = item.featuredMode || 'latest';

  // 1. If 'selected' mode and selectedActivityId exists:
  if (mode === 'selected' && item.selectedActivityId) {
    const selected = activities.find((a) => a.id === item.selectedActivityId);
    if (selected) {
      return {
        imageUrl: selected.imageUrl || item.coverImageUrl,
        youtubeUrl: selected.youtubeUrl || item.youtubeUrl,
        activityTitle: selected.title,
        activityDate: selected.date,
        activityDescription: selected.description,
        activityId: selected.id,
        modeLabel: '지정된 대표 활동',
      };
    }
  }

  // 2. If 'latest' mode:
  if (mode === 'latest') {
    const latest = activities.length > 0 ? activities[0] : null;
    return {
      imageUrl: latest?.imageUrl || item.coverImageUrl,
      youtubeUrl: latest?.youtubeUrl || item.youtubeUrl,
      activityTitle: latest?.title,
      activityDate: latest?.date,
      activityDescription: latest?.description,
      activityId: latest?.id,
      modeLabel: '최신 활동 자동 반영',
    };
  }

  // 3. Fallback to custom cover image / default
  return {
    imageUrl: item.coverImageUrl,
    youtubeUrl: item.youtubeUrl,
    activityTitle: undefined,
    activityDate: undefined,
    activityDescription: undefined,
    activityId: undefined,
    modeLabel: item.coverImageUrl ? '대표 지정 사진' : '기본 일러스트',
  };
}
