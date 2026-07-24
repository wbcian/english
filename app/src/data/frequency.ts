// 單字「實際多常遇到」→ 顯示資訊（vocab 清單 / 單字卡共用的單一事實來源）
// 判準見 ../../../reference/cefr-leveling-process.md §8.4
//
// ⚠️ 與 CEFR 是兩條獨立的軸：simple-but-rare（alpaca = A2 + low）與
//    hard-but-common（acknowledge = B2 + high）都存在。兩軸交叉才決定
//    一個字要練到「能主動說」還是「看懂就好」。

export const FREQUENCY_TIERS = ['high', 'mid', 'low'] as const;
export type FrequencyTier = (typeof FREQUENCY_TIERS)[number];

export interface FrequencyInfo {
  /** badge 上的短標籤 */
  zh: string;
  /** 這一層的學習目標（tooltip / 單字卡說明用） */
  goal: string;
}

export const FREQUENCY_INFO: Record<FrequencyTier, FrequencyInfo> = {
  high: { zh: '高頻', goal: '日常幾乎天天遇到 — 目標：主動會用' },
  mid: { zh: '中頻', goal: 'podcast／職場常見 — 目標：看到聽到秒懂' },
  low: { zh: '低頻', goal: '書面／專業／情緒強烈 — 目標：被動認得即可' },
};
