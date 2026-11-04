import React, { useState } from 'react';
import { Mail, Copy, Check, ExternalLink, X, Send } from 'lucide-react';

interface ContactModalProps {
  email: string;
  copyText?: string;
  contactNote?: string;
  onClose: () => void;
  onOpenAdminSettings?: () => void;
}

export function ContactModal({
  email,
  copyText,
  contactNote,
  onClose,
  onOpenAdminSettings,
}: ContactModalProps) {
  const [copied, setCopied] = useState(false);

  const cleanEmail = email?.trim() || 'jackson.hong@example.com';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = cleanEmail;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    cleanEmail
  )}&su=${encodeURIComponent('Contact via Jackson Hong Portfolio')}`;

  const naverMailUrl = `https://mail.naver.com/write/popup?to=${encodeURIComponent(
    cleanEmail
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#f8f7f3] border-2 border-[#202923] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#202923] text-white">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#aab9a3]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#aab9a3]">
              06 — CONTACT
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#c0c9be] hover:text-white transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-serif-display text-2xl sm:text-3xl text-[#202421]">
              Get in touch
            </h3>
            <p className="text-xs text-[#70766e] mt-2 leading-relaxed">
              {copyText ||
                'I’m always interested in learning from new people and experiences. Thank you for visiting my portfolio.'}
            </p>
          </div>

          {/* Email Address Card & Copy Action */}
          <div className="p-4 bg-white border border-[#dcded6] space-y-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#8a9287]">
              연락처 / Email Address
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="font-mono text-sm sm:text-base font-semibold text-[#202421] select-all break-all">
                {cleanEmail}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  copied
                    ? 'bg-[#536b56] text-white'
                    : 'bg-[#eeede7] text-[#202421] hover:bg-[#202923] hover:text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    복사 완료!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    이메일 복사
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-[11px] text-[#536b56] font-medium animate-in fade-in duration-150">
                ✓ 이메일 주소가 클립보드에 복사되었습니다.
              </p>
            )}
          </div>

          {/* Direct Send Options */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#8a9287]">
              메일 작성 방법 선택
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white border border-[#c8ccc3] hover:border-[#202923] hover:bg-[#fafaf7] transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-red-50 text-red-700 flex items-center justify-center font-bold text-xs">
                    G
                  </div>
                  <span className="text-xs font-semibold text-[#202421]">
                    Gmail로 작성하기
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#8a9287] group-hover:text-[#202421]" />
              </a>

              <a
                href={naverMailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white border border-[#c8ccc3] hover:border-[#202923] hover:bg-[#fafaf7] transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-green-50 text-green-700 flex items-center justify-center font-bold text-xs">
                    N
                  </div>
                  <span className="text-xs font-semibold text-[#202421]">
                    네이버 메일로 작성하기
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#8a9287] group-hover:text-[#202421]" />
              </a>
            </div>

            <a
              href={`mailto:${cleanEmail}`}
              className="flex items-center justify-center gap-2 w-full p-2.5 text-xs font-medium text-[#536b56] bg-[#f0f2eb] border border-[#d4d9cd] hover:bg-[#e4eae0] transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>기본 메일 클라이언트 앱으로 열기 (mailto)</span>
            </a>
          </div>

          {contactNote && (
            <p className="text-[11px] text-[#8a9287] border-t border-[#eceae2] pt-3">
              {contactNote}
            </p>
          )}

          {onOpenAdminSettings && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminSettings();
                }}
                className="text-[11px] text-[#555c55] hover:underline cursor-pointer"
              >
                관리자에서 이메일 주소 수정 ↗
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
