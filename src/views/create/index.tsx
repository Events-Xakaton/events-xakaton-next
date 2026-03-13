"use client";

import { FormEvent, ReactNode, RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarArrowDown,
  CalendarArrowUp,
  MapPin,
  Users,
  Calendar,
  RefreshCw,
  ChevronDown,
  Check,
  Pencil,
} from "lucide-react";
import { useCreateClubMutation, useEventAuthoringClubsQuery } from "@/entities/club/api";
import { useCreateEventMutation } from "@/entities/event/api";
import { buildGradient, newSeed } from "@/shared/lib/gradient";
import { useViewportMode } from "@/shared/lib/telegram/useViewportMode";
import { useTelegramMainButton } from "@/shared/lib/telegram/useTelegramButtons";
import { CreateTab } from "@/shared/types/navigation";
import { appErrorText, toIsoFromLocal, cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/button";
import {
  ADAPTIVE_VIEWPORT_HEIGHT,
  SAFE_AREA_TOP,
  getBottomPadding,
  APP_SECTION_CARD_CLASS,
  APP_PREVIEW_SCRIM_CLASS,
  APP_PANEL_SHADOW_CLASS,
} from "@/shared/lib/ui-styles";
import { AppHeader } from "@/widgets/app-header";

function stableColor(key: string): string {
  const palette = ["#7c3aed", "#0ea5e9", "#f59e0b", "#ef4444", "#10b981", "#6366f1"];
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length] ?? palette[0];
}

function initials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((v) => v[0]?.toUpperCase() ?? "")
      .join("") || "К"
  );
}

const SECTION_CARD = APP_SECTION_CARD_CLASS;
const DETAIL_LABEL_WIDTH = "w-[58%] min-w-[176px] pr-2";
const SECTION_TITLE_CLASS = "text-lg font-semibold text-neutral-900";
const INPUT_BASE_CLASS =
  "w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none focus:border-neutral-300 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0";

function toLocalDateTimeInputValue(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function createDefaultEventTimes() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(17, 0, 0, 0);

  const end = new Date(start);
  end.setHours(19, 0, 0, 0);

  return {
    startsAt: toLocalDateTimeInputValue(start),
    endsAt: toLocalDateTimeInputValue(end),
  };
}

function formatDateTimeDisplay(value: string): string {
  if (!value) return "Выберите дату";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function moveCaretToEnd(node: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

const CREATE_TYPE_OPTIONS: Array<{
  value: CreateTab;
  title: string;
  description: string;
}> = [
  {
    value: "event",
    title: "Ивент",
    description: "Для встреч, нетворкинга и внутренних активностей",
  },
  {
    value: "club",
    title: "Клуб",
    description: "Для постоянных сообществ, интересов и команд",
  },
];

export type PreviewCardProps = {
  background: string;
  title: string;
  onChangeBackground: () => void;
  subtitle?: string;
  titleEditing?: boolean;
  onTitleClick?: () => void;
  titleEditor?: ReactNode;
  titleHint?: ReactNode;
  showEditIndicator?: boolean;
  showChangeBackgroundButton?: boolean;
};

export function PreviewCard({
  background,
  title,
  onChangeBackground,
  subtitle,
  titleEditing = false,
  onTitleClick,
  titleEditor,
  titleHint,
  showEditIndicator = false,
  showChangeBackgroundButton = true,
}: PreviewCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="relative overflow-hidden" style={{ background }} data-testid="cover-preview-background">
        <div className={cn("pointer-events-none absolute inset-0", APP_PREVIEW_SCRIM_CLASS)} />
        {showChangeBackgroundButton && (
          <div className="absolute left-4 top-4 z-10">
            <button
              type="button"
              onClick={onChangeBackground}
              data-testid="cover-change-background"
              className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/45 bg-white/20 px-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition hover:bg-white/30"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Другой фон
            </button>
          </div>
        )}
        {showEditIndicator && onTitleClick ? (
          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              onClick={() => {
                onTitleClick();
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/45 bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
              aria-label="Редактировать заголовок"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
        <div className="relative flex min-h-[280px] flex-col justify-end p-6">
          <div className="relative max-w-full">
            {titleEditing ? (
              titleEditor
            ) : (
              <div className="relative">
                <h2
                  className={cn(
                    "block pr-10 text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg",
                    onTitleClick ? "cursor-pointer" : "",
                  )}
                  onClick={onTitleClick}
                >
                  <span>{title}</span>
                </h2>
              </div>
            )}
            {titleHint ?? null}
            {subtitle ? <p className="mt-2 line-clamp-2 text-white/90">{subtitle}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

type DescriptionSectionProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
};

function DescriptionSection({
  value,
  onChange,
  placeholder,
  rows = 3,
  textareaRef,
}: DescriptionSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className={SECTION_TITLE_CLASS}>Описание</h3>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 1000))}
        placeholder={placeholder}
        rows={rows}
        className={INPUT_BASE_CLASS}
        required
      />
    </div>
  );
}


export function CreateScreen() {
  const mode = useViewportMode();
  const [tab, setTab] = useState<CreateTab>("event");
  const [isCreateTypeOpen, setIsCreateTypeOpen] = useState(false);
  const createTypeRef = useRef<HTMLDivElement>(null);

  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const defaultTimes = useMemo(createDefaultEventTimes, []);
  const [eventStartsAt, setEventStartsAt] = useState(defaultTimes.startsAt);
  const [eventEndsAt, setEventEndsAt] = useState(defaultTimes.endsAt);
  const [eventMaxParticipants, setEventMaxParticipants] = useState("");
  const [selectedClubId, setSelectedClubId] = useState("");
  const [createFromClub, setCreateFromClub] = useState(false);
  const [eventHint, setEventHint] = useState("");
  const [eventCoverSeed, setEventCoverSeed] = useState(() => newSeed("event"));
  const [clubCoverSeed, setClubCoverSeed] = useState(() => newSeed("club"));
  const [showTitleEditor, setShowTitleEditor] = useState(false);
  const [showClubTitleEditor, setShowClubTitleEditor] = useState(false);
  const eventTitleEditorRef = useRef<HTMLDivElement>(null);
  const clubTitleEditorRef = useRef<HTMLDivElement>(null);
  const eventDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const clubDescriptionRef = useRef<HTMLTextAreaElement>(null);

  const [clubTitle, setClubTitle] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [clubHint, setClubHint] = useState("");
  const [showAllClubs, setShowAllClubs] = useState(false);

  const [createEvent, createEventState] = useCreateEventMutation();
  const [createClub, createClubState] = useCreateClubMutation();
  const eventAuthoringClubs = useEventAuthoringClubsQuery();

  const titleForPreview = eventTitle.trim() || "Настолки в офисе";
  const eventCoverBackground = useMemo(() => buildGradient(eventCoverSeed, "event"), [eventCoverSeed]);
  const clubCoverBackground = useMemo(() => buildGradient(clubCoverSeed, "club"), [clubCoverSeed]);

  const eventTimeError = useMemo(() => {
    if (!eventStartsAt || !eventEndsAt) return "";
    const startsAtUtc = toIsoFromLocal(eventStartsAt);
    const endsAtUtc = toIsoFromLocal(eventEndsAt);
    if (!startsAtUtc || !endsAtUtc || new Date(endsAtUtc) <= new Date(startsAtUtc)) {
      return "Время окончания должно быть позже времени начала.";
    }
    return "";
  }, [eventStartsAt, eventEndsAt]);

  const canPublishEvent =
    eventTitle.trim().length > 0 &&
    eventDescription.trim().length > 0 &&
    eventLocation.trim().length > 0 &&
    Boolean(eventStartsAt) &&
    Boolean(eventEndsAt) &&
    !eventTimeError;

  const ownedClubs = useMemo(
    () => (eventAuthoringClubs.data ?? []).filter((club) => club.role === "owner"),
    [eventAuthoringClubs.data],
  );

  const selectedCreateType = CREATE_TYPE_OPTIONS.find((option) => option.value === tab) ?? CREATE_TYPE_OPTIONS[0];

  const canPublishClub = clubTitle.trim().length > 0 && clubDescription.trim().length > 0;

  // Telegram MainButton в compact mode
  useTelegramMainButton({
    text: tab === "event" ? "Создать мероприятие" : "Создать клуб",
    onClick: () => {
      if (tab === "event") {
        const fakeEvent = { preventDefault: () => {} } as FormEvent;
        void submitEvent(fakeEvent);
      } else {
        const fakeEvent = { preventDefault: () => {} } as FormEvent;
        void submitClub(fakeEvent);
      }
    },
    enabled: tab === "event" ? canPublishEvent : canPublishClub,
    visible: mode === "compact",
  });

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!createTypeRef.current) return;
      if (!createTypeRef.current.contains(event.target as Node)) {
        setIsCreateTypeOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!eventDescriptionRef.current) return;
    eventDescriptionRef.current.style.height = "auto";
    eventDescriptionRef.current.style.height = `${eventDescriptionRef.current.scrollHeight}px`;
  }, [eventDescription]);

  useEffect(() => {
    if (!clubDescriptionRef.current) return;
    clubDescriptionRef.current.style.height = "auto";
    clubDescriptionRef.current.style.height = `${clubDescriptionRef.current.scrollHeight}px`;
  }, [clubDescription]);

  useEffect(() => {
    if (!showTitleEditor || !eventTitleEditorRef.current) return;
    eventTitleEditorRef.current.textContent = eventTitle;
    eventTitleEditorRef.current.focus();
    moveCaretToEnd(eventTitleEditorRef.current);
  }, [showTitleEditor]);

  useEffect(() => {
    if (!showClubTitleEditor || !clubTitleEditorRef.current) return;
    clubTitleEditorRef.current.textContent = clubTitle;
    clubTitleEditorRef.current.focus();
    moveCaretToEnd(clubTitleEditorRef.current);
  }, [showClubTitleEditor]);

  async function submitEvent(e: FormEvent) {
    e.preventDefault();
    setEventHint("");

    const startsAtUtc = toIsoFromLocal(eventStartsAt);
    const endsAtUtc = toIsoFromLocal(eventEndsAt);
    if (!startsAtUtc || !endsAtUtc || new Date(endsAtUtc) <= new Date(startsAtUtc)) {
      setEventHint("Время окончания должно быть позже времени начала.");
      return;
    }

    try {
      const clubIdForCreate = createFromClub ? selectedClubId || undefined : undefined;
      const result = await createEvent({
        clubId: clubIdForCreate,
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        locationOrLink: eventLocation.trim(),
        startsAtUtc,
        endsAtUtc,
        maxParticipants: eventMaxParticipants ? Number(eventMaxParticipants) : undefined,
        categoryCode: "general",
        coverSeed: eventCoverSeed,
      }).unwrap();

      setEventHint(`Ивент создан: ${result.id}`);
      setEventTitle("");
      setEventDescription("");
      setEventLocation("");
      const nextDefaults = createDefaultEventTimes();
      setEventStartsAt(nextDefaults.startsAt);
      setEventEndsAt(nextDefaults.endsAt);
      setEventMaxParticipants("");
      setSelectedClubId("");
      setCreateFromClub(false);
      setShowTitleEditor(false);
    } catch (error) {
      setEventHint(appErrorText(error, "Не удалось создать мероприятие."));
    }
  }

  async function submitClub(e: FormEvent) {
    e.preventDefault();
    setClubHint("");

    try {
      const result = await createClub({
        title: clubTitle.trim(),
        description: clubDescription.trim(),
        categoryCode: "general",
        coverUrl: undefined,
        coverSeed: clubCoverSeed,
      }).unwrap();
      setClubHint(`Клуб создан: ${result.id}`);
      setShowClubTitleEditor(false);
    } catch (error) {
      setClubHint(appErrorText(error, "Не удалось создать клуб."));
    }
  }

  return (
    <div
      className="relative bg-[#f2f2f5]"
      style={{
        minHeight: ADAPTIVE_VIEWPORT_HEIGHT,
        paddingBottom: getBottomPadding('form'),
      }}
    >
      <AppHeader
        mode="fixed"
        topClassName="z-fixed"
        useSafeArea={false}
        showTopGap={false}
        rootStyle={{ paddingTop: `calc(${SAFE_AREA_TOP} + 16px)` }}
        center={
          <div ref={createTypeRef} className="relative">
            <button
              type="button"
              onClick={() => setIsCreateTypeOpen((prev) => !prev)}
              data-testid="create-type-toggle"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-[13px] font-semibold text-neutral-800 shadow-sm"
            >
              {selectedCreateType.title}
              <ChevronDown className={cn("h-4 w-4 transition-transform", isCreateTypeOpen && "rotate-180")} />
            </button>

            {isCreateTypeOpen && (
              <div className={cn("absolute left-1/2 top-[calc(100%+10px)] z-[220] w-[300px] -translate-x-1/2 overflow-hidden rounded-3xl border border-neutral-200 bg-white", APP_PANEL_SHADOW_CLASS)}>
                {CREATE_TYPE_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    data-testid={`create-type-option-${option.value}`}
                    onClick={() => {
                      setTab(option.value);
                      setIsCreateTypeOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors",
                      option.value === tab ? "bg-neutral-100" : "hover:bg-neutral-50",
                      index !== 0 && "border-t border-neutral-100"
                    )}
                  >
                    {option.value === "event" ? (
                      <Calendar className="mt-0.5 h-5 w-5 text-neutral-700" aria-hidden="true" />
                    ) : (
                      <Users className="mt-0.5 h-5 w-5 text-neutral-700" aria-hidden="true" />
                    )}
                    <span className="block">
                      <span className="block text-sm font-semibold text-neutral-900">{option.title}</span>
                      <span className="block text-xs text-neutral-500">{option.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      {tab === "event" ? (
        <form className="space-y-4 px-4" style={{ paddingTop: `calc(${SAFE_AREA_TOP} + 88px)` }} onSubmit={submitEvent}>
          <PreviewCard
            background={eventCoverBackground}
            title={titleForPreview}
            onChangeBackground={() => setEventCoverSeed(newSeed("event"))}
            titleEditing={showTitleEditor}
            onTitleClick={() => setShowTitleEditor(true)}
            showEditIndicator
            titleEditor={
              <div className="relative">
                <div
                  ref={eventTitleEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  className="w-full min-h-[1.2em] bg-transparent text-4xl font-bold leading-tight tracking-tight text-white outline-none"
                  dir="ltr"
                  style={{
                    outline: "none",
                    boxShadow: "none",
                    border: "none",
                    WebkitTapHighlightColor: "transparent",
                    caretColor: "#fff",
                    direction: "ltr",
                    textAlign: "left",
                    unicodeBidi: "plaintext",
                  }}
                  onInput={(e) => {
                    const value = e.currentTarget.textContent ?? "";
                    const next = value.slice(0, 60);
                    if (next !== value) {
                      e.currentTarget.textContent = next;
                      moveCaretToEnd(e.currentTarget);
                    }
                    setEventTitle(next);
                  }}
                  onBlur={() => {
                    setEventTitle((prev) => prev.trim());
                    setShowTitleEditor(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setEventTitle((prev) => prev.trim());
                      setShowTitleEditor(false);
                    }
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = "none";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.border = "none";
                  }}
                >
                  {null}
                </div>
              </div>
            }
            titleHint={
              showTitleEditor && 60 - eventTitle.length <= 10 ? (
                <p className="mt-2 text-xs text-white/70">Осталось символов: {60 - eventTitle.length}</p>
              ) : null
            }
          />

          {/* inline title editing handled inside preview */}

          <DescriptionSection
            value={eventDescription}
            onChange={setEventDescription}
            placeholder="Опишите план встречи: чем будете заниматься, где пройдет ивент и что участникам важно знать заранее."
            rows={3}
            textareaRef={eventDescriptionRef}
          />

          {/* Details */}
          <div className="space-y-2">
            <h3 className={SECTION_TITLE_CLASS}>Детали</h3>
            <div className={SECTION_CARD}>
              {/* Location */}
              <div className="flex items-center gap-3 bg-white rounded-2xl pl-3 pr-4 py-3.5">
                <MapPin className="h-5 w-5 text-neutral-700 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium text-neutral-900 flex-shrink-0 w-[90px]">Локация</span>
                <div className={cn("ml-auto", DETAIL_LABEL_WIDTH)}>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Укажите локацию"
                    className="w-full appearance-none bg-transparent text-right text-sm leading-6 text-neutral-500 border-0 outline-none ring-0 shadow-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0"
                    style={{
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                      WebkitAppearance: "none",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "none";
                      e.currentTarget.style.outline = "none";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.webkitAppearance = "none";
                    }}
                    required
                  />
                </div>
              </div>

              {/* Starts */}
              <div className="flex items-center gap-3 bg-white rounded-2xl pl-3 pr-4 py-3.5">
                <CalendarArrowUp className="h-5 w-5 text-neutral-700 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium text-neutral-900 flex-shrink-0 w-[90px]">Начало</span>
                <label className={cn("relative ml-auto flex cursor-pointer items-center justify-end gap-2", DETAIL_LABEL_WIDTH)}>
                  <span className="text-right text-sm leading-6 tabular-nums text-neutral-500">{formatDateTimeDisplay(eventStartsAt)}</span>
                  <Calendar className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  <input
                    type="datetime-local"
                    value={eventStartsAt}
                    onChange={(e) => setEventStartsAt(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    required
                  />
                </label>
              </div>

              {/* Ends */}
              <div className="flex items-center gap-3 bg-white rounded-2xl pl-3 pr-4 py-3.5">
                <CalendarArrowDown className="h-5 w-5 text-neutral-700 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium text-neutral-900 flex-shrink-0 w-[90px]">Окончание</span>
                <label className={cn("relative ml-auto flex cursor-pointer items-center justify-end gap-2", DETAIL_LABEL_WIDTH)}>
                  <span className="text-right text-sm leading-6 tabular-nums text-neutral-500">{formatDateTimeDisplay(eventEndsAt)}</span>
                  <Calendar className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  <input
                    type="datetime-local"
                    value={eventEndsAt}
                    onChange={(e) => setEventEndsAt(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    required
                  />
                </label>
              </div>

              {/* Max participants */}
              <div className="flex items-center gap-3 bg-white rounded-2xl pl-3 pr-4 py-3.5">
                <Users className="h-5 w-5 text-neutral-700 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium text-neutral-900 flex-shrink-0 w-[90px]">Лимит</span>
                <div className={cn("ml-auto", DETAIL_LABEL_WIDTH)}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={eventMaxParticipants}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                      const normalized = digitsOnly.replace(/^0+/, "");
                      setEventMaxParticipants(normalized);
                    }}
                    placeholder="Без лимита"
                    maxLength={4}
                    className="w-full appearance-none bg-transparent text-right text-sm leading-6 text-neutral-500 border-0 outline-none ring-0 shadow-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 placeholder:text-neutral-400"
                    style={{
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                      WebkitAppearance: "none",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "none";
                      e.currentTarget.style.outline = "none";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.webkitAppearance = "none";
                    }}
                  />
                </div>
              </div>
            </div>
            {eventTimeError && (
              <p className="text-sm text-red-500 mt-2">{eventTimeError}</p>
            )}
          </div>

          {/* Link to club */}
          <div className={SECTION_CARD}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className={SECTION_TITLE_CLASS}>Ивент от клуба</p>
                {createFromClub && (
                  <p className="text-xs text-neutral-500 leading-relaxed mt-1.5 mb-1">
                    Ивент будет опубликован в выбранном клубе
                  </p>
                )}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={createFromClub}
                onClick={() => setCreateFromClub((prev) => !prev)}
                className={cn(
                  "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors mt-0.5",
                  createFromClub ? "bg-primary-500" : "bg-neutral-300",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                    createFromClub ? "translate-x-6" : "translate-x-1",
                  )}
                />
              </button>
            </div>

            {createFromClub ? (
              <>
                {eventAuthoringClubs.isLoading ? (
                  <div className="rounded-2xl bg-neutral-200 p-4 mt-4">
                    <p className="text-sm text-neutral-600">Загружаем ваши клубы...</p>
                  </div>
                ) : null}

                {eventAuthoringClubs.isError ? (
                  <div className="rounded-2xl bg-red-100 border border-red-200 p-4 mt-4">
                    <p className="text-sm text-red-600">Не удалось загрузить список клубов.</p>
                  </div>
                ) : null}

                {!eventAuthoringClubs.isLoading && !eventAuthoringClubs.isError ? (
                  ownedClubs.length > 0 ? (
                    <>
                      <div className="mt-3 space-y-1.5">
                        {(showAllClubs ? ownedClubs : ownedClubs.slice(0, 4)).map((club) => {
                          const isSelected = selectedClubId === club.id;
                          const clubColor = stableColor(club.id);
                          return (
                            <button
                              key={club.id}
                              type="button"
                              role="checkbox"
                              aria-checked={isSelected}
                              aria-label={isSelected ? `Отменить выбор клуба ${club.title}` : `Выбрать клуб ${club.title}`}
                              className={cn(
                                "group relative w-full rounded-lg p-2.5 text-left transition-all duration-200",
                                "flex items-center gap-3 min-h-[56px]",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                                isSelected
                                  ? "shadow-md scale-[1.005]"
                                  : "ring-1 ring-neutral-200 hover:ring-neutral-300 shadow-sm hover:shadow active:scale-[0.995]",
                              )}
                              style={{
                                background: isSelected
                                  ? clubColor
                                  : `linear-gradient(135deg, ${clubColor}12 0%, ${clubColor}06 100%)`
                              }}
                              onClick={() => setSelectedClubId(isSelected ? "" : club.id)}
                            >
                              {/* Avatar */}
                              <div className={cn(
                                "h-11 w-11 shrink-0 overflow-hidden rounded-md transition-all duration-200",
                                "grid place-items-center text-sm font-bold text-white shadow-sm",
                                isSelected ? "scale-95" : "group-hover:scale-105"
                              )}
                              style={{ background: clubColor }}>
                                {initials(club.title)}
                              </div>

                              {/* Title */}
                              <p className={cn(
                                "flex-1 min-w-0 text-sm font-medium leading-snug transition-colors",
                                isSelected ? "text-white" : "text-neutral-900"
                              )}>
                                {club.title}
                              </p>

                              {/* Checkmark */}
                              <div className={cn(
                                "h-5 w-5 shrink-0 grid place-items-center rounded-full transition-all duration-200",
                                isSelected
                                  ? "bg-white text-primary-600 scale-100"
                                  : "bg-white/40 text-transparent scale-90 group-hover:bg-white/60"
                              )}>
                                <Check className="h-3.5 w-3.5 stroke-[3px]" aria-hidden="true" />
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Show more/less button */}
                      {ownedClubs.length > 4 && (
                        <button
                          type="button"
                          onClick={() => setShowAllClubs(!showAllClubs)}
                          className="mt-2 w-full text-center text-sm font-medium text-neutral-600 hover:text-neutral-900 py-2 transition-colors"
                        >
                          {showAllClubs ? (
                            <>Свернуть ▲</>
                          ) : (
                            <>Показать еще {ownedClubs.length - 4} {ownedClubs.length - 4 === 1 ? 'клуб' : ownedClubs.length - 4 < 5 ? 'клуба' : 'клубов'} ▼</>
                          )}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-neutral-100 border border-neutral-200 p-4">
                      <p className="text-sm text-neutral-700">У вас пока нет созданных клубов.</p>
                    </div>
                  )
                ) : null}
              </>
            ) : null}
          </div>

          {/* Success/Error messages */}
          {eventHint && (
            <div className={cn(
              "p-4 rounded-2xl",
              eventHint.includes("создано") ? "bg-green-100" : "bg-red-100"
            )}>
              <p className={cn(
                "text-sm font-medium",
                eventHint.includes("создано") ? "text-green-700" : "text-red-700"
              )}>
                {eventHint}
              </p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            fullWidth
            disabled={!canPublishEvent}
            isLoading={createEventState.isLoading}
            className="rounded-full text-lg font-bold"
          >
            {createEventState.isLoading ? "Публикация..." : "Создать мероприятие"}
          </Button>
        </form>
      ) : (
        <form className="space-y-4 px-4" style={{ paddingTop: `calc(${SAFE_AREA_TOP} + 88px)` }} onSubmit={submitClub}>
          <PreviewCard
            background={clubCoverBackground}
            title={clubTitle.trim() || "Новый клуб"}
            subtitle={clubDescription.trim() || undefined}
            onChangeBackground={() => setClubCoverSeed(newSeed("club"))}
            titleEditing={showClubTitleEditor}
            onTitleClick={() => setShowClubTitleEditor(true)}
            showEditIndicator
            titleEditor={
              <div className="relative">
                <div
                  ref={clubTitleEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  className="w-full min-h-[1.2em] bg-transparent text-4xl font-bold leading-tight tracking-tight text-white outline-none"
                  dir="ltr"
                  style={{
                    outline: "none",
                    boxShadow: "none",
                    border: "none",
                    WebkitTapHighlightColor: "transparent",
                    caretColor: "#fff",
                    direction: "ltr",
                    textAlign: "left",
                    unicodeBidi: "plaintext",
                  }}
                  onInput={(e) => {
                    const value = e.currentTarget.textContent ?? "";
                    const next = value.slice(0, 60);
                    if (next !== value) {
                      e.currentTarget.textContent = next;
                      moveCaretToEnd(e.currentTarget);
                    }
                    setClubTitle(next);
                  }}
                  onBlur={() => {
                    setClubTitle((prev) => prev.trim());
                    setShowClubTitleEditor(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setClubTitle((prev) => prev.trim());
                      setShowClubTitleEditor(false);
                    }
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = "none";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.border = "none";
                  }}
                >
                  {null}
                </div>
              </div>
            }
            titleHint={
              showClubTitleEditor && 60 - clubTitle.length <= 10 ? (
                <p className="mt-2 text-xs text-white/70">Осталось символов: {60 - clubTitle.length}</p>
              ) : null
            }
          />

          <DescriptionSection
            value={clubDescription}
            onChange={setClubDescription}
            placeholder="Кратко опишите цель клуба и чем участники будут заниматься."
            rows={3}
            textareaRef={clubDescriptionRef}
          />

          {clubHint && (
            <div className={cn(
              "p-4 rounded-2xl",
              clubHint.includes("создан") ? "bg-green-100" : "bg-red-100"
            )}>
              <p className={cn(
                "text-sm font-medium",
                clubHint.includes("создан") ? "text-green-700" : "text-red-700"
              )}>
                {clubHint}
              </p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            fullWidth
            disabled={!clubTitle.trim() || !clubDescription.trim()}
            isLoading={createClubState.isLoading}
            className="rounded-full text-lg font-bold"
          >
            {createClubState.isLoading ? "Создание..." : "Создать клуб"}
          </Button>
        </form>
      )}
    </div>
  );
}
