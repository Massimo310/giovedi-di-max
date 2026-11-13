export type Role = 'admin' | 'fedelissimo' | 'occasionale' | 'ospite';

export interface Profile {
  id: string;
  name: string;
  role: Role;
  username?: string | null;
}

export interface Bar {
  id: string;
  name: string;
  address: string;
  notes: string;
  added_by: string | null;
  scheduled_date: string | null; // YYYY-MM-DD
  has_foosball: boolean;
  created_at: string;
}

export type Scores = Record<string, number>; // categoria -> 1..10

export interface Rating {
  bar_id: string;
  user_id: string;
  scores: Scores;
  comment: string;
  updated_at: string;
}

export interface Settings {
  weights: Record<Exclude<Role, 'ospite'>, number>;
  foosball_bonus: number;
}

export interface NewBar {
  name: string;
  address: string;
  notes: string;
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Fondatore',
  fedelissimo: 'Fedelissimo',
  occasionale: 'Occasionale',
  ospite: 'Ospite',
};

export const ROLE_DESC: Record<Role, string> = {
  admin: 'Gestisce calendario, bar e compagnia',
  fedelissimo: 'Viene spesso: il suo voto pesa di più',
  occasionale: 'Viene ogni tanto: voto con peso ridotto',
  ospite: 'Può solo guardare classifica e calendario',
};

export const canVote = (r: Role) => r !== 'ospite';
export const canAddBar = (r: Role) => r !== 'ospite';
export const isAdmin = (r: Role) => r === 'admin';

/** Scala dei voti: da 1 a MAX_VOTE boccali */
export const MAX_VOTE = 10;

export interface NewUser {
  name: string;
  username: string;
  password: string;
  role: Role;
}
