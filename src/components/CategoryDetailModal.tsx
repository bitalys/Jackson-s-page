import React from 'react';
import {
  X,
  Plus,
  Play,
  Pencil,
  Trash2,
  Calendar,
  Star,
  Youtube,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { SportItem, InterestItem, SubActivityItem } from '../types';
import { extractYouTubeId, sortActivities } from '../utils/storage';

interface CategoryDetailModalProps {
  item: SportItem | InterestItem;
  categoryType: 'athletics' | 'interests';
  onAddActivity: () => void;
  onEditActivity: (activity: SubActivityItem) => void;
  onDeleteActivity: (activityId: string) => void;
  onSelectFeaturedActivity: (activityId: string) => void;
  onChangeFeaturedMode: (mode: 'latest' | 'selected' | 'default') => void;
  onViewMedia: (activity: SubActivityItem) => void;
  onClose: () => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  item,
  categoryType,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onSelectFeaturedActivity,
  onChangeFeaturedMode,
  onViewMedia,
  onClose,
}) => {
  const activities = sortActivities(item.activities || []);
  const currentMode = item.featuredMode || 'latest';
  const selectedId = item.selectedActivityId;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#f5f4f0] text-[#202421] border border-[#dcded6] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f5f4f0]/95 border-b border-[#e4e2db] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.16em] text-[#788475] uppercase">
                {categoryType === 'athletics' ? '02 — ATHLETICS' : '05 — BEYOND THE CLASSROOM'}
              </span>
              <span className="text-xs text-[#8a9287]">·</span>
              <span className="text-xs font-semibold text-[#536b56]">
                활동 {activities.length}개 등록됨
              </span>
            </div>
            <h3 className="font-serif-display text-2xl md:text-3xl font-medium text-[#202421] mt-0.5">
              {'icon' in item ? `${item.icon} ` : ''}
              {item.title} 세부 활동 관리
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onAddActivity}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#202923] text-white hover:opacity-90 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + 새 활동 추가
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#555c55] hover:text-[#111] hover:bg-[#e8eae3] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Display Mode Selector Ribbon */}
        <div className="px-6 py-3 bg-[#eeede7] border-b border-[#dcded6] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#344137]">메인 카드 대표 표시 설정:</span>
            <div className="inline-flex items-center gap-1 p-0.5 bg-white border border-[#c8ccc3]">
              <button
                type="button"
                onClick={() => onChangeFeaturedMode('latest')}
                className={`px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  currentMode === 'latest'
                    ? 'bg-[#202923] text-white font-bold'
                    : 'text-[#555c55] hover:text-[#111]'
                }`}
              >
                최신 등록 활동 자동 표시
              </button>
              <button
                type="button"
                onClick={() => onChangeFeaturedMode('selected')}
                className={`px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  currentMode === 'selected'
                    ? 'bg-[#202923] text-white font-bold'
                    : 'text-[#555c55] hover:text-[#111]'
                }`}
              >
                지정된 대표 활동 표시
              </button>
              <button
                type="button"
                onClick={() => onChangeFeaturedMode('default')}
                className={`px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  currentMode === 'default'
                    ? 'bg-[#202923] text-white font-bold'
                    : 'text-[#555c55] hover:text-[#111]'
                }`}
              >
                기본 일러스트/커버
              </button>
            </div>
          </div>

          <span className="text-[11px] text-[#737a72]">
            {currentMode === 'latest' && '가장 최근에 등록한 활동 사진과 내용이 메인 화면에 자동으로 노출됩니다.'}
            {currentMode === 'selected' && '아래 목록에서 [★ 대표로 지정] 버튼을 누른 활동이 메인 화면에 노출됩니다.'}
            {currentMode === 'default' && '기본 일러스트 그래픽 또는 등록된 기본 커버 이미지가 메인 화면에 노출됩니다.'}
          </span>
        </div>

        {/* Content Body: List of activities */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-4">
          {activities.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#dcded6] space-y-3">
              <p className="text-base font-medium text-[#202421]">
                아직 등록된 세부 활동이 없습니다.
              </p>
              <p className="text-xs text-[#70766e]">
                상단의 <b>[+ 새 활동 추가]</b> 버튼을 눌러 사진, 유튜브 영상 링크, 일정, 설명과 함께 첫 활동을 등록해 보세요!
              </p>
              <button
                type="button"
                onClick={onAddActivity}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#202923] text-white cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                첫 세부 활동 등록하기
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {activities.map((act, index) => {
                const hasYt = Boolean(extractYouTubeId(act.youtubeUrl));
                const isSelected = selectedId === act.id;
                const isLatest = index === 0;

                return (
                  <div
                    key={act.id}
                    className={`p-4 bg-white border transition-all ${
                      (currentMode === 'selected' && isSelected) ||
                      (currentMode === 'latest' && isLatest)
                        ? 'border-[#536b56] shadow-sm ring-1 ring-[#536b56]/20'
                        : 'border-[#dcded6] hover:border-[#8a9b83]'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      {/* Photo / Media Box */}
                      <div className="md:col-span-3">
                        {act.imageUrl ? (
                          <div
                            onClick={() => onViewMedia(act)}
                            className="relative h-28 w-full bg-[#e8eae3] border border-[#dcded6] overflow-hidden group cursor-pointer"
                          >
                            <img
                              src={act.imageUrl}
                              alt={act.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {hasYt && (
                              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                <span className="w-8 h-8 rounded-full bg-[#202923]/90 text-white flex items-center justify-center">
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </span>
                              </div>
                            )}
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px]">
                              {hasYt ? '유튜브 재생' : '확대보기'}
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => onViewMedia(act)}
                            className="h-28 w-full bg-[#eeede7] border border-[#dcded6] flex flex-col items-center justify-center text-[#788475] cursor-pointer hover:bg-[#e4e2db]"
                          >
                            <ImageIcon className="w-6 h-6 mb-1 opacity-60" />
                            <span className="text-[10px]">사진 미등록</span>
                          </div>
                        )}
                      </div>

                      {/* Text & Metadata */}
                      <div className="md:col-span-6 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {act.date && (
                            <span className="text-[10px] font-bold tracking-[0.1em] text-[#788475] flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {act.date}
                            </span>
                          )}
                          {act.categoryTag && (
                            <span className="text-[10px] font-semibold text-[#536b56] bg-[#e8eae3] px-2 py-0.5">
                              {act.categoryTag}
                            </span>
                          )}
                          {currentMode === 'selected' && isSelected && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 flex items-center gap-1 border border-amber-200">
                              <Star className="w-3 h-3 fill-amber-500" />
                              대표 지정됨
                            </span>
                          )}
                          {currentMode === 'latest' && isLatest && (
                            <span className="text-[10px] font-bold text-[#344137] bg-[#eeede7] px-2 py-0.5">
                              최신 활동 (메인 노출중)
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif-display text-lg font-medium text-[#202421]">
                          {act.title}
                        </h4>

                        <p className="text-xs text-[#70766e] leading-relaxed line-clamp-2">
                          {act.description}
                        </p>

                        {hasYt && (
                          <div className="flex items-center gap-1.5 text-xs text-red-700 font-semibold pt-0.5">
                            <Youtube className="w-3.5 h-3.5" />
                            <span>유튜브 영상 연동됨</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 h-full">
                        <button
                          type="button"
                          onClick={() => onSelectFeaturedActivity(act.id)}
                          className={`w-full md:w-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                              : 'bg-white border-[#c8ccc3] text-[#555c55] hover:bg-[#e8eae3]'
                          }`}
                          title="메인 화면의 대표 활동으로 지정"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              isSelected ? 'fill-amber-500 text-amber-600' : ''
                            }`}
                          />
                          {isSelected ? '대표 활동 지정됨' : '대표로 지정'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditActivity(act)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border border-[#c8ccc3] bg-[#f8f7f3] hover:bg-white text-[#202421] cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteActivity(act.id)}
                            className="p-1 text-[#737a72] hover:text-red-700 cursor-pointer"
                            title="활동 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
