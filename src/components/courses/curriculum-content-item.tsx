"use client";

import { CourseMediaPlayer } from "@/components/media/course-media-player";
import type { LessonContentType } from "@/lib/api/types";
import { FileText, Film, Headphones } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

const MEDIA_TYPES = new Set<LessonContentType>(["video", "audio"]);

/** Absolute http(s) URL from freeform `content` (embed or direct file). */
function trimHttpUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
  } catch {
    /* not an absolute URL */
  }
  return null;
}

/** True when `content` looks like HTML markup (vs plain text). */
function looksLikeHtmlFragment(raw: string): boolean {
  const t = raw.trim();
  if (!t || !t.includes("<")) return false;
  return /<\/?[a-z][\w-]*\b/i.test(t);
}

function parseYouTubeVideoId(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ?? null;
    }
    if (
      host === "youtube.com" ||
      host === "youtube-nocookie.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      if (u.pathname === "/watch" || u.pathname.startsWith("/watch")) {
        const v = u.searchParams.get("v");
        if (v) return v;
      }
      const embed = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (embed?.[1]) return embed[1];
      const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts?.[1]) return shorts[1];
    }
  } catch {
    return null;
  }
  return null;
}

function parseVimeoVideoId(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "player.vimeo.com") {
      const m = u.pathname.match(/^\/video\/(\d+)/);
      if (m?.[1]) return m[1];
    }
    if (host === "vimeo.com") {
      const m = u.pathname.match(/^\/(\d+)/);
      if (m?.[1]) return m[1];
    }
  } catch {
    return null;
  }
  return null;
}

function isLikelyPdfUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith(".pdf") || /\.pdf(\?|#)/i.test(url);
  } catch {
    return /\.pdf(\?|#|$)/i.test(url);
  }
}

function MediaBlockHeader({
  contentType,
  title,
}: {
  contentType: "video" | "audio";
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
      {contentType === "video" ? (
        <Film className="size-4 shrink-0 text-fuchsia-600 dark:text-fuchsia-400" aria-hidden />
      ) : (
        <Headphones className="size-4 shrink-0 text-fuchsia-600 dark:text-fuchsia-400" aria-hidden />
      )}
      <span>{title}</span>
    </div>
  );
}

function DocumentBlockHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
      <FileText className="size-4 shrink-0 text-fuchsia-600 dark:text-fuchsia-400" aria-hidden />
      <span>{title}</span>
    </div>
  );
}

function EmbeddedHostedVideo({ title, embedSrc }: { title: string; embedSrc: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl ring-1 ring-fuchsia-500/15">
      <div className="aspect-video w-full bg-black">
        <iframe
          title={title}
          src={embedSrc}
          className="size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}

function DocumentAssetFrame({ title, src }: { title: string; src: string }) {
  const pdf = isLikelyPdfUrl(src);
  return (
    <div className="space-y-3">
      <DocumentBlockHeader title={title} />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-xl ring-1 ring-fuchsia-500/10">
        <iframe
          title={title}
          src={src}
          className={`w-full border-0 bg-zinc-900 ${pdf ? "min-h-[75vh]" : "aspect-4/3 min-h-96"}`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <p className="text-sm">
        <Link
          href={src}
          className="font-medium text-fuchsia-700 underline-offset-2 hover:underline dark:text-fuchsia-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          {pdf ? "Download / open PDF in a new tab" : "Open document in a new tab"}
        </Link>
      </p>
    </div>
  );
}

const htmlBodyClass =
  "mt-2 max-w-none rounded-lg bg-zinc-50/90 p-4 text-sm leading-relaxed text-zinc-800 ring-1 ring-zinc-950/5 dark:bg-zinc-900/60 dark:text-zinc-200 dark:ring-zinc-700/50 [&_a]:text-fuchsia-700 [&_a]:underline dark:[&_a]:text-fuchsia-400 [&_blockquote]:mt-2 [&_blockquote]:border-l-2 [&_blockquote]:border-fuchsia-500/40 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-zinc-200/90 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.8125rem] dark:[&_code]:bg-zinc-800 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold [&_li]:mt-1 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-2 [&_p]:leading-relaxed [&_pre]:mt-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-zinc-900 [&_pre]:p-3 [&_pre]:text-xs [&_pre]:text-zinc-100 dark:[&_pre]:bg-black/60 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5";

function CurriculumContentItemInner({
  title,
  contentType,
  fileUrl,
  bodyText,
}: {
  title: string;
  contentType: LessonContentType;
  fileUrl: string | null;
  bodyText: string;
}) {
  const urlFromContent = trimHttpUrl(bodyText);
  const mediaSrc =
    (fileUrl && fileUrl.trim() !== "" ? fileUrl : null) ??
    (MEDIA_TYPES.has(contentType) ? urlFromContent : null);

  if (mediaSrc && contentType === "video") {
    const yt = parseYouTubeVideoId(mediaSrc);
    if (yt) {
      return (
        <div className="space-y-3">
          <MediaBlockHeader contentType="video" title={title} />
          <EmbeddedHostedVideo
            title={title}
            embedSrc={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}?rel=0`}
          />
        </div>
      );
    }
    const vim = parseVimeoVideoId(mediaSrc);
    if (vim) {
      return (
        <div className="space-y-3">
          <MediaBlockHeader contentType="video" title={title} />
          <EmbeddedHostedVideo
            title={title}
            embedSrc={`https://player.vimeo.com/video/${encodeURIComponent(vim)}`}
          />
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <MediaBlockHeader contentType="video" title={title} />
        <CourseMediaPlayer src={mediaSrc} variant="video" title={title} />
      </div>
    );
  }

  if (mediaSrc && contentType === "audio") {
    return (
      <div className="space-y-3">
        <MediaBlockHeader contentType="audio" title={title} />
        <CourseMediaPlayer src={mediaSrc} variant="audio" title={title} />
      </div>
    );
  }

  const docAssetUrl =
    contentType === "document"
      ? (fileUrl && fileUrl.trim() !== "" ? fileUrl.trim() : null) ?? urlFromContent
      : null;

  if (contentType === "document" && docAssetUrl) {
    return <DocumentAssetFrame title={title} src={docAssetUrl} />;
  }

  const trimmedBody = bodyText.trim();
  const bareHttpBody =
    trimmedBody.length > 0 && urlFromContent !== null && trimmedBody === urlFromContent;

  return (
    <div className="space-y-2">
      <div className="flex gap-2 text-sm text-zinc-800 dark:text-zinc-200">
        <FileText
          className="mt-0.5 size-4 shrink-0 text-fuchsia-600/90 dark:text-fuchsia-400"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
          {trimmedBody ? (
            contentType === "text" && bareHttpBody ? (
              <p className="mt-2 break-all text-sm">
                <Link
                  href={trimmedBody}
                  className="font-medium text-fuchsia-700 underline-offset-2 hover:underline dark:text-fuchsia-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {trimmedBody}
                </Link>
              </p>
            ) : looksLikeHtmlFragment(bodyText) ? (
              /* Trusted rich text from course authors */
              <div className={htmlBodyClass} dangerouslySetInnerHTML={{ __html: bodyText }} />
            ) : (
              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-zinc-50/90 p-3 text-sm leading-relaxed text-zinc-700 ring-1 ring-zinc-950/5 dark:bg-zinc-900/60 dark:text-zinc-300 dark:ring-zinc-700/50">
                {bodyText}
              </p>
            )
          ) : null}
          {fileUrl && contentType !== "document" ? (
            <p className="mt-2">
              <Link
                href={fileUrl}
                className="font-medium text-fuchsia-700 underline-offset-2 hover:underline dark:text-fuchsia-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open resource
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const CurriculumContentItem = memo(CurriculumContentItemInner);
