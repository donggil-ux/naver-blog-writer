import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Loader2, MapPin, X, Phone, Tag } from 'lucide-react';

export type NaverLocalItem = {
  title: string;
  link?: string;
  category?: string;
  description?: string;
  telephone?: string;
  address?: string;
  roadAddress?: string;
  mapx?: string;
  mapy?: string;
};

export type StoreDetail = {
  name: string;
  address: string;
  phone: string;
  category: string;
  hours: string;
  closed: string;
  breakTime: string;
  mapx?: string;
  mapy?: string;
  placeId?: string;
  matched?: boolean;
};

type Props = {
  onSelect: (detail: StoreDetail) => void;
  placeholder?: string;
  useMock?: boolean;
};

const MOCK_NAVER_ITEMS: NaverLocalItem[] = [
  {
    title: '<b>어니언</b> 성수',
    roadAddress: '서울특별시 성동구 아차산로9길 8',
    address: '서울특별시 성동구 성수동2가 277-135',
    category: '카페,디저트',
    telephone: '',
    mapx: '1270553556',
    mapy: '375447389',
  },
  {
    title: '<b>어니언</b> 안국',
    roadAddress: '서울특별시 종로구 계동길 5',
    address: '서울특별시 종로구 계동 89-10',
    category: '카페,디저트',
    telephone: '02-1234-5678',
    mapx: '1269864900',
    mapy: '375777000',
  },
  {
    title: '<b>어니언</b> 광장시장',
    roadAddress: '서울특별시 종로구 종로32길 7',
    address: '서울특별시 종로구 예지동 174-3',
    category: '카페,디저트',
    telephone: '',
    mapx: '1269993100',
    mapy: '375691200',
  },
];

const MOCK_PLACE_DETAIL = {
  hours:
    '월요일: 오전 11:00 ~ 오후 10:00\n화요일: 오전 11:00 ~ 오후 10:00\n수요일: 오전 11:00 ~ 오후 10:00\n목요일: 오전 11:00 ~ 오후 10:00\n금요일: 오전 11:00 ~ 오후 10:00\n토요일: 오전 10:00 ~ 오후 10:00\n일요일: 오전 10:00 ~ 오후 10:00',
  closed: '',
  breakTime: '',
  matched: true,
};

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '');
const addressOf = (it: NaverLocalItem) => it.roadAddress || it.address || '';

export default function StoreSearchInput({ onSelect, placeholder, useMock = false }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NaverLocalItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<NaverLocalItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [hours, setHours] = useState('');
  const [closed, setClosed] = useState('');
  const [breakTime, setBreakTime] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  const runSearch = useCallback(
    async (q: string) => {
      const id = ++reqIdRef.current;
      setSearching(true);
      setError('');
      try {
        if (useMock) {
          await new Promise((r) => setTimeout(r, 350));
          if (id !== reqIdRef.current) return;
          const filtered = MOCK_NAVER_ITEMS.filter((it) => stripHtml(it.title).includes(q));
          setResults(filtered.length ? filtered : MOCK_NAVER_ITEMS);
        } else {
          const res = await fetch(`/api/naver-local?query=${encodeURIComponent(q)}`);
          const data = await res.json();
          if (id !== reqIdRef.current) return;
          if (data.error) throw new Error(data.error);
          setResults(data.items || []);
        }
      } catch (e: unknown) {
        if (id !== reqIdRef.current) return;
        const msg = e instanceof Error ? e.message : '검색 오류';
        setError(msg);
        setResults([]);
      } finally {
        if (id === reqIdRef.current) setSearching(false);
      }
    },
    [useMock]
  );

  useEffect(() => {
    if (selected) return;
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(q), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected, runSearch]);

  const fetchDetailAndNotify = useCallback(
    async (item: NaverLocalItem) => {
      const cleanName = stripHtml(item.title);
      const address = addressOf(item);
      const phone = item.telephone || '';
      const category = item.category || '';
      setLoadingDetail(true);
      setError('');

      let detailPart = { hours: '', closed: '', breakTime: '', matched: false, placeId: undefined as string | undefined };
      try {
        if (useMock) {
          await new Promise((r) => setTimeout(r, 400));
          detailPart = { ...MOCK_PLACE_DETAIL, placeId: undefined };
        } else {
          const naverRes = await fetch(
            `/api/naver-hours?query=${encodeURIComponent(cleanName)}&address=${encodeURIComponent(address)}`
          );
          const naverData = await naverRes.json();

          if (!naverData.error && naverData.matched && naverData.hours) {
            detailPart = {
              hours: naverData.hours || '',
              closed: naverData.closed || '',
              breakTime: naverData.breakTime || '',
              matched: true,
              placeId: naverData.placeId,
            };
          } else {
            // fallback to Google Places
            const gRes = await fetch(
              `/api/google-places?query=${encodeURIComponent(cleanName)}&address=${encodeURIComponent(address)}`
            );
            const gData = await gRes.json();
            if (gData.error) throw new Error(gData.error);
            detailPart = {
              hours: gData.hours || '',
              closed: gData.closed || '',
              breakTime: gData.breakTime || '',
              matched: !!gData.matched,
              placeId: gData.placeId,
            };
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '영업시간 조회 실패';
        setError(msg);
      } finally {
        setLoadingDetail(false);
      }

      setHours(detailPart.hours);
      setClosed(detailPart.closed);
      setBreakTime(detailPart.breakTime);

      onSelect({
        name: cleanName,
        address,
        phone,
        category,
        hours: detailPart.hours,
        closed: detailPart.closed,
        breakTime: detailPart.breakTime,
        mapx: item.mapx,
        mapy: item.mapy,
        placeId: detailPart.placeId,
        matched: detailPart.matched,
      });
    },
    [onSelect, useMock]
  );

  const handlePick = (item: NaverLocalItem) => {
    setSelected(item);
    setResults([]);
    setQuery(stripHtml(item.title));
    void fetchDetailAndNotify(item);
  };

  const handleReset = () => {
    reqIdRef.current += 1;
    setSelected(null);
    setResults([]);
    setQuery('');
    setHours('');
    setClosed('');
    setBreakTime('');
    setError('');
  };

  const updateParent = (next: { hours?: string; closed?: string; breakTime?: string }) => {
    if (!selected) return;
    const cleanName = stripHtml(selected.title);
    onSelect({
      name: cleanName,
      address: addressOf(selected),
      phone: selected.telephone || '',
      category: selected.category || '',
      hours: next.hours ?? hours,
      closed: next.closed ?? closed,
      breakTime: next.breakTime ?? breakTime,
      mapx: selected.mapx,
      mapy: selected.mapy,
    });
  };

  return (
    <div className="w-full">
      {!selected && (
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder || '가게 이름을 입력하세요 (2자 이상)'}
            aria-label="가게 이름 검색"
            className="w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-10 py-3 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
          />
          {query && (
            <button
              type="button"
              aria-label="입력 지우기"
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {!selected && searching && (
        <ul className="mt-2 space-y-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-[68px] animate-pulse rounded-xl border border-neutral-200 bg-neutral-100" />
          ))}
        </ul>
      )}

      {!selected && !searching && error && (
        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </div>
      )}

      {!selected && !searching && results.length > 0 && (
        <ul className="mt-2 space-y-2">
          {results.map((it, idx) => {
            const name = stripHtml(it.title);
            const address = addressOf(it);
            return (
              <li key={`${name}-${idx}`}>
                <button
                  type="button"
                  onClick={() => handlePick(it)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-3 text-left transition-colors hover:border-neutral-900"
                  aria-label={`${name} 선택`}
                >
                  <div className="text-[15px] font-semibold text-neutral-900">{name}</div>
                  <div className="mt-1 flex items-start gap-1 text-[13px] text-neutral-500">
                    <MapPin size={13} className="mt-0.5 flex-none" />
                    <span className="line-clamp-2">{address || '주소 없음'}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-neutral-500">
                    {it.category && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5">
                        <Tag size={11} />
                        {it.category}
                      </span>
                    )}
                    {it.telephone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={11} />
                        {it.telephone}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!selected && !searching && !error && query.trim().length >= 2 && results.length === 0 && (
        <div className="mt-2 rounded-xl border border-dashed border-neutral-300 bg-white px-3 py-3 text-center text-[13px] text-neutral-500">
          검색 결과가 없어요. 이름을 더 구체적으로 입력해보세요.
        </div>
      )}

      {selected && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-neutral-900">{stripHtml(selected.title)}</div>
              <div className="mt-1 flex items-start gap-1 text-[13px] text-neutral-500">
                <MapPin size={13} className="mt-0.5 flex-none" />
                <span className="line-clamp-2">{addressOf(selected) || '주소 없음'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex flex-none items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
              aria-label="다시 검색"
            >
              <X size={13} />
              다시 검색
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-neutral-500">영업시간</label>
              {loadingDetail ? (
                <div className="flex h-[110px] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-[13px] text-neutral-400">
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                  영업시간 불러오는 중…
                </div>
              ) : (
                <textarea
                  value={hours}
                  onChange={(e) => {
                    setHours(e.target.value);
                    updateParent({ hours: e.target.value });
                  }}
                  rows={4}
                  placeholder="예) 월-금 11:00~22:00"
                  aria-label="영업시간"
                  className="w-full resize-vertical rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] leading-relaxed text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-neutral-500">휴무일</label>
                <input
                  type="text"
                  value={closed}
                  onChange={(e) => {
                    setClosed(e.target.value);
                    updateParent({ closed: e.target.value });
                  }}
                  placeholder="예) 매주 월요일"
                  aria-label="휴무일"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-neutral-500">브레이크타임</label>
                <input
                  type="text"
                  value={breakTime}
                  onChange={(e) => {
                    setBreakTime(e.target.value);
                    updateParent({ breakTime: e.target.value });
                  }}
                  placeholder="예) 15:00~17:00"
                  aria-label="브레이크타임"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
