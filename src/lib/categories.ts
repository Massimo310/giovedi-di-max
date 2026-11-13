// Le categorie di voto. Per aggiungerne/toglierne basta modificare questa lista:
// i voti sono salvati come JSON, quindi non serve toccare il database.
export interface Category {
  key: string;
  label: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { key: 'prezzo', label: 'Prezzo', emoji: '💶' },
  { key: 'location', label: 'Location', emoji: '🏠' },
  { key: 'intrattenimento', label: 'Intrattenimento', emoji: '🎯' },
  { key: 'mood', label: 'Mood', emoji: '✨' },
  { key: 'personale', label: 'Personale', emoji: '🙋' },
  { key: 'birra', label: 'Qualità birra', emoji: '🍺' },
];
