import { useEffect, useState } from 'react';
import { GripVertical, X, Plus, ArrowLeft, Loader2, Pencil, Check } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type TitleCandidate = { id: string; text: string };
export type FirstLineCandidate = { id: string; text: string };
export type OutlineItem = { id: string; text: string };
export type RelatedCandidate = { id: string | number; title: string; score: number; createdAt?: string };

type BriefPlannerProps = {
  titles: TitleCandidate[];
  firstLines?: FirstLineCandidate[];
  defaultOutline: OutlineItem[];
  relatedCandidates?: RelatedCandidate[];
  isGenerating?: boolean;
  onSubmit: (selectedTitle: string, selectedFirstLine: string | null, outline: OutlineItem[], relatedTitles: string[]) => void;
  onBack: () => void;
};

function SortableOutlineItem({
  item,
  onDelete,
}: {
  item: OutlineItem;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging ? '0 10px 24px rgba(0,0,0,0.12)' : undefined,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-2 py-3"
    >
      <button
        type="button"
        aria-label="드래그해서 순서 바꾸기"
        className="touch-none cursor-grab p-2 text-neutral-400 hover:text-neutral-600 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </button>
      <span className="flex-1 text-[15px] text-neutral-800">{item.text}</span>
      <button
        type="button"
        aria-label={`${item.text} 삭제`}
        onClick={() => onDelete(item.id)}
        className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
      >
        <X size={18} />
      </button>
    </li>
  );
}

export default function BriefPlanner({
  titles,
  firstLines = [],
  defaultOutline,
  relatedCandidates = [],
  isGenerating = false,
  onSubmit,
  onBack,
}: BriefPlannerProps) {
  const [selectedTitleId, setSelectedTitleId] = useState<string | null>(null);
  const [selectedFirstLineId, setSelectedFirstLineId] = useState<string | null>(null);
  const [outline, setOutline] = useState<OutlineItem[]>(defaultOutline);
  const [adding, setAdding] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [titleList, setTitleList] = useState<TitleCandidate[]>(titles);
  const [firstLineList, setFirstLineList] = useState<FirstLineCandidate[]>(firstLines);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedRelatedIds, setSelectedRelatedIds] = useState<Set<string>>(new Set());

  // 부모에서 titles prop이 바뀌면(재생성 등) 로컬 상태 동기화
  useEffect(() => {
    setTitleList(titles);
  }, [titles]);
  useEffect(() => {
    setFirstLineList(firstLines);
    // 새 데이터 오면 기존 선택 초기화
    setSelectedFirstLineId(null);
  }, [firstLines]);

  const beginEdit = (id: string, current: string) => {
    setEditingId(id);
    setEditText(current);
    setSelectedTitleId(id);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const next = editText.trim();
    if (next) {
      setTitleList((list) =>
        list.map((t) => (t.id === editingId ? { ...t, text: next } : t))
      );
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOutline((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleDelete = (id: string) => {
    setOutline((items) => items.filter((i) => i.id !== id));
  };

  const handleAdd = () => {
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    setOutline((items) => [...items, { id: `o-${Date.now()}`, text: trimmed }]);
    setNewItemText('');
    setAdding(false);
  };

  const handleSubmitClick = () => {
    if (!selectedTitleId || isGenerating) return;
    const selected = titleList.find((t) => t.id === selectedTitleId);
    if (!selected) return;
    const selFirst = firstLineList.find((f) => f.id === selectedFirstLineId) ?? null;
    const relatedTitles = relatedCandidates
      .filter((r) => selectedRelatedIds.has(String(r.id)))
      .map((r) => r.title);
    onSubmit(selected.text, selFirst?.text ?? null, outline, relatedTitles);
  };

  const toggleRelated = (id: string) => {
    setSelectedRelatedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSubmit = !!selectedTitleId && !isGenerating;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col">
        <header className="flex items-center justify-between px-5 pt-6 pb-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="입력 단계로 돌아가기"
            disabled={isGenerating}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[13px] font-medium text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800 disabled:opacity-40"
          >
            <ArrowLeft size={16} />
            돌아가기
          </button>
          <span className="text-[12px] font-medium text-neutral-400">STEP 2 / 3</span>
        </header>

        <div className="px-5 pt-2 pb-1">
          <h1 className="text-[22px] font-bold leading-snug text-neutral-900">
            추천 제목과 목차를 확인하세요
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
            AI가 초안을 만들기 전에 글의 방향을 먼저 정리해드릴게요.
          </p>
        </div>

        <section className="px-5 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-neutral-900">제목 후보</h2>
            <span className="text-[12px] text-neutral-400">1개 선택</span>
          </div>
          <ul className="space-y-2">
            {titleList.map((title) => {
              const isSelected = selectedTitleId === title.id;
              const isEditing = editingId === title.id;

              if (isEditing) {
                return (
                  <li key={title.id}>
                    <div
                      className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-colors ${
                        isSelected ? 'border-neutral-900 bg-white' : 'border-neutral-300 bg-white'
                      }`}
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            commitEdit();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelEdit();
                          }
                        }}
                        aria-label="제목 편집"
                        className="flex-1 rounded-lg bg-transparent px-2 py-2 text-[15px] leading-snug text-neutral-900 outline-none placeholder:text-neutral-400"
                      />
                      <button
                        type="button"
                        onClick={commitEdit}
                        aria-label="편집 저장"
                        disabled={!editText.trim()}
                        className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-neutral-900 text-white transition-colors disabled:cursor-not-allowed disabled:bg-neutral-300"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        aria-label="편집 취소"
                        className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </li>
                );
              }

              return (
                <li key={title.id}>
                  <div
                    className={`relative flex items-center rounded-2xl border transition-colors ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={`제목 후보 선택: ${title.text}`}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedTitleId(title.id)}
                      className="flex-1 rounded-2xl px-4 py-4 pr-12 text-left"
                    >
                      <span className="text-[15px] leading-snug">{title.text}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        beginEdit(title.id, title.text);
                      }}
                      aria-label={`${title.text} 편집`}
                      className={`absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition-colors ${
                        isSelected
                          ? 'text-white/70 hover:bg-white/10 hover:text-white'
                          : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700'
                      }`}
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {firstLineList.length > 0 && (
          <section className="px-5 pt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-neutral-900">첫 문장 후보</h2>
              <span className="text-[12px] text-neutral-400">1개 선택 (선택)</span>
            </div>
            <ul className="space-y-2">
              {firstLineList.map((line) => {
                const isSelected = selectedFirstLineId === line.id;
                return (
                  <li key={line.id}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedFirstLineId(isSelected ? null : line.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                      }`}
                    >
                      <span className="text-[14px] leading-relaxed">{line.text}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[12px] text-neutral-400">
              선택하지 않으면 AI가 글 전체 맥락에 맞춰 자동으로 첫 문장을 써드려요.
            </p>
          </section>
        )}

        {relatedCandidates.length > 0 && (
          <section className="px-5 pt-8">
            <h2 className="mb-3 text-[15px] font-semibold text-neutral-900">
              💡 이 글과 함께 소개하면 좋은 이전 글
            </h2>
            <ul className="space-y-2">
              {relatedCandidates.map((r) => {
                const id = String(r.id);
                const checked = selectedRelatedIds.has(id);
                const dt = r.createdAt ? new Date(r.createdAt) : null;
                const dateStr = dt
                  ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
                  : '';
                return (
                  <li key={id}>
                    <button
                      type="button"
                      aria-pressed={checked}
                      onClick={() => toggleRelated(id)}
                      className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                        checked
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                          checked ? 'border-white bg-white text-neutral-900' : 'border-neutral-400 bg-white'
                        }`}
                      >
                        {checked && <Check size={12} />}
                      </span>
                      <span className="flex-1">
                        <span className="block text-[14px] font-medium leading-snug">{r.title || '(제목 없음)'}</span>
                        {dateStr && (
                          <span className={`block text-[11px] ${checked ? 'text-neutral-300' : 'text-neutral-400'}`}>
                            {dateStr} · 점수 {r.score}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[12px] text-neutral-400">
              체크한 글은 본문 끝에 "이런 글도 함께 읽어보세요" 섹션으로 자동 추가돼요.
            </p>
          </section>
        )}

        <section className="px-5 pt-8 pb-28">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-neutral-900">목차</h2>
            <span className="text-[12px] text-neutral-400">드래그로 순서 변경</span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={outline.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {outline.map((item) => (
                  <SortableOutlineItem key={item.id} item={item} onDelete={handleDelete} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          <div className="mt-3">
            {adding ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAdd();
                    }
                    if (e.key === 'Escape') {
                      setAdding(false);
                      setNewItemText('');
                    }
                  }}
                  placeholder="새 목차 제목"
                  aria-label="새 목차 제목 입력"
                  className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!newItemText.trim()}
                  aria-label="목차 추가 확정"
                  className="rounded-xl bg-neutral-900 px-4 py-3 text-[14px] font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-neutral-300"
                >
                  추가
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                aria-label="새 목차 추가"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 bg-white py-3 text-[14px] text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-800"
              >
                <Plus size={16} />
                목차 추가
              </button>
            )}
          </div>
        </section>

        <div className="sticky bottom-0 left-0 right-0 border-t border-neutral-200 bg-neutral-50/95 px-5 pt-3 pb-5 backdrop-blur">
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={!canSubmit}
            aria-label="이대로 글 쓰기"
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-[16px] font-semibold transition-colors ${
              canSubmit
                ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                : 'cursor-not-allowed bg-neutral-200 text-neutral-400'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                본문 생성 중…
              </>
            ) : (
              '이대로 글 쓰기'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
