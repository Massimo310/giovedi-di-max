// Le categorie di voto. Per aggiungerne/toglierne o cambiare le spiegazioni
// basta modificare questa lista: i voti sono salvati come JSON, quindi non
// serve toccare il database. La pagina "Come si vota" si aggiorna da sola.
export interface Category {
  key: string;
  label: string;
  emoji: string;
  /** Cosa si giudica, in una frase */
  description: string;
  /** A cosa fare caso quando si vota */
  lookFor: string[];
  /** Com'è un 1 e com'è un 10 */
  low: string;
  high: string;
}

export const CATEGORIES: Category[] = [
  {
    key: 'prezzo',
    label: 'Prezzo',
    emoji: '💶',
    description: 'Quanto vale quello che spendi: non solo quanto costa, ma se ne vale la pena.',
    lookFor: ['Prezzo di una media alla spina', 'Rapporto qualità/prezzo', 'Stuzzichini o aperitivo compresi'],
    low: 'Una rapina: esci col portafoglio in lacrime',
    high: 'Quasi regalato, e pure buono',
  },
  {
    key: 'location',
    label: 'Location',
    emoji: '🏠',
    description: 'Il posto in sé: com’è fatto, quanto ci si sta comodi, se ci torneresti.',
    lookFor: ['Spazio e posti a sedere', 'Arredamento e pulizia (bagni compresi)', 'Dehors, tavoli fuori, facilità di arrivo'],
    low: 'Scantinato umido, in piedi tutta sera',
    high: 'Ci trasferirei la residenza',
  },
  {
    key: 'intrattenimento',
    label: 'Intrattenimento',
    emoji: '🎯',
    description: 'Cosa c’è da fare oltre a bere e chiacchierare.',
    lookFor: ['Giochi: freccette, carte, giochi da tavolo', 'Musica dal vivo, DJ, quiz', 'Partite in TV'],
    low: 'Si fissa il muro',
    high: 'Non ti annoi un secondo',
  },
  {
    key: 'mood',
    label: 'Mood',
    emoji: '✨',
    description: 'L’atmosfera della serata: la sensazione che ti lascia il posto.',
    lookFor: ['Musica e volume giusti', 'Luci e ambiente', 'Il tipo di gente e l’energia della sala'],
    low: 'Vibrazioni da sala d’attesa',
    high: 'Non volevi più andare via',
  },
  {
    key: 'personale',
    label: 'Personale',
    emoji: '🙋',
    description: 'Chi ci serve: simpatia, velocità e attenzione.',
    lookFor: ['Gentilezza e simpatia', 'Tempi di attesa al bancone o al tavolo', 'Sanno consigliarti una birra?'],
    low: 'Ti hanno fatto sentire di troppo',
    high: 'Già amici dopo un giro',
  },
  {
    key: 'birra',
    label: 'Qualità birra',
    emoji: '🍺',
    description: 'La protagonista: com’è la birra che ti portano.',
    lookFor: ['Scelta alla spina e in bottiglia', 'Temperatura e freschezza', 'Come viene spillata (la schiuma conta!)'],
    low: 'Acqua tiepida con le bollicine',
    high: 'Spillata da manuale, la sogni la notte',
  },
];
