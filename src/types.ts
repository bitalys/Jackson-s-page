export type SectionCategory = 'athletics' | 'writing' | 'experiences' | 'interests';

export interface UploadedFile {
  id: string;
  name: string;
  folderPath?: string;
  type: 'image' | 'pdf' | 'video' | 'audio' | 'document';
  mimeType: string;
  size: number;
  dataUrl: string;
  youtubeUrl?: string;
  caption?: string;
  section: SectionCategory;
  parentItemId?: string;
  createdAt: string;
}

export interface SubActivityItem {
  id: string;
  title: string;
  date?: string; // e.g. "2026.04", "2025 가을"
  categoryTag?: string; // e.g. "대회 참가", "봉사 활동", "정기 훈련"
  description: string;
  imageUrl?: string;
  youtubeUrl?: string;
  isFeatured?: boolean; // 대표 활동 여부
  createdAt: string;
  attachments?: UploadedFile[];
}

export interface SportDetail {
  label: string;
  value: string;
}

export interface SportItem {
  id: string;
  indexLabel: string;
  title: string;
  tag: string;
  description: string;
  visualStyle: 'golf' | 'swim' | 'custom';
  coverImageUrl?: string;
  youtubeUrl?: string;
  featuredMode?: 'latest' | 'selected' | 'default'; // 'latest' = 최신 등록 활동, 'selected' = 지정된 대표 활동, 'default' = 기본 일러스트/커버
  selectedActivityId?: string; // 대표로 지정된 활동 ID
  activities: SubActivityItem[]; // 세부 활동 목록
  details: SportDetail[];
  footnote?: string;
  attachments: UploadedFile[];
}

export interface AwardItem {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  essayTitle?: string;
  summary?: string;
  createdAt?: string;
  attachments: UploadedFile[];
}

export interface ExperienceItem {
  id: string;
  number: string;
  title: string;
  subtitle?: string; // e.g. "Vancouver & Toronto, Canada"
  date?: string; // e.g. "2018 — 2021"
  categoryTag?: string; // e.g. "다문화 적응 & 어학"
  description: string;
  coverImageUrl?: string;
  youtubeUrl?: string;
  createdAt?: string;
  attachments: UploadedFile[];
}

export interface InterestItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  caption: string;
  coverImageUrl?: string;
  youtubeUrl?: string;
  featuredMode?: 'latest' | 'selected' | 'default'; // 'latest' = 최신 등록 활동, 'selected' = 지정된 대표 활동, 'default' = 기본 커버
  selectedActivityId?: string; // 대표로 지정된 활동 ID
  activities: SubActivityItem[]; // 세부 활동 목록 (기부활동, 아이스하키 등 하위의 다양한 활동들)
  attachments: UploadedFile[];
}

export interface StatItem {
  id: string;
  valueMain: string;
  valueSuffix?: string;
  labelLine1: string;
  labelLine2: string;
}

export interface ProfileSettings {
  eyebrow: string;
  heroTitleLine1: string;
  heroTitleItalic: string;
  heroLede: string;
  school: string;
  classYear: string;
  heroCustomImage?: string;
  aboutLabel: string;
  aboutTitleLine1: string;
  aboutTitleItalic: string;
  aboutPara1: string;
  aboutPara2: string;
  stats: StatItem[];
  athleticsHeadingNote: string;
  writingLeadCopy: string;
  awardTopLeft: string;
  awardTopRight: string;
  awardHeadline: string;
  awardFootnote: string;
  contactEmail: string;
  closingCopy: string;
  contactNote: string;
}

export interface PortfolioData {
  profile: ProfileSettings;
  athletics: SportItem[];
  awards: AwardItem[];
  experiences: ExperienceItem[];
  interests: InterestItem[];
}
