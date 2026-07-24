// CEFR 分級 → 顯示資訊（卡片 badge / 文章資訊列共用的單一事實來源）
// 人類可讀的完整對照表與驗證軌跡見 ../../../reference/cefr-toeic-levels.md
//
// ⚠️ TOEIC 數字是「推算便利總分」：ETS 官方只公布 Listening / Reading 分項
//    cut score，不發布合併總分對照。這裡的區間是分項下限相加，僅供快速參考。

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export interface CefrInfo {
  /** 中文程度白話 */
  zh: string;
  /** TOEIC L&R 對應總分（推算便利值，非 ETS 官方總分） */
  toeic: string;
}

export const CEFR_INFO: Record<CefrLevel, CefrInfo> = {
  A1: { zh: '入門', toeic: '120–225' },
  A2: { zh: '基礎生活', toeic: '225–550' },
  B1: { zh: '進階生活 / 職場基本', toeic: '550–785' },
  B2: { zh: '流利職場', toeic: '785–945' },
  C1: { zh: '高階學術 / 專業', toeic: '945–990' },
  C2: { zh: '近母語', toeic: '— (L&R 量不到)' },
};

/**
 * 單字級別是判斷型估計，不像 lesson `level` 只有六個乾淨的值——結尾 `?` 表示
 * 評估者對這個字沒把握（邊界字，或 CEFR 本來就不太適用的新造詞/俚語）。
 * 判準見 reference/cefr-leveling-process.md §8。
 */
export interface CefrMark {
  level: CefrLevel;
  /** true = 這個級別是估計值。UI 照實顯示 `?`，不要偷偷抹掉。 */
  hedged: boolean;
}

/** vocab frontmatter `cefr` 欄的合法字面。與 parseCefr 是同一套文法的兩面，故並列在此。 */
export const CEFR_RAW_PATTERN = new RegExp(`^(${CEFR_LEVELS.join('|')})\\??$`);

export function parseCefr(raw: string): CefrMark {
  const hedged = raw.endsWith('?');
  return { level: (hedged ? raw.slice(0, -1) : raw) as CefrLevel, hedged };
}

/** `?` 的意思。badge tooltip 與單字卡註解共用，避免同一句解釋各寫一份。 */
export const CEFR_HEDGE_NOTE = '? = 邊界字，這個級別是估計值，不是查官方詞表得來的';
