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
