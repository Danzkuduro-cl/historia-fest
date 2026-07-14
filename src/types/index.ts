export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';
export type PlayerType = 'core' | 'substitute';

export interface Team {
  id: string;
  team_name: string;
  captain_name: string;
  whatsapp: string;
  logo_url?: string;
  registration_code: string;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  player_type: PlayerType;
  full_name: string;
  nickname: string;
  mlbb_id: string;
  server_id: string;
  player_order?: number;
}

export interface Payment {
  id: string;
  team_id: string;
  transaction_id: string;
  amount: number;
  status: PaymentStatus;
  payment_method?: string;
  snap_token?: string;
  payment_url?: string;
  created_at: string;
}

export interface TeamWithPlayers extends Team {
  players: Player[];
  payments: Payment[];
}

// Form types
export interface TeamInfoFormData {
  team_name: string;
  captain_name: string;
  whatsapp: string;
  logo?: FileList;
}

export interface PlayerFormData {
  full_name: string;
  nickname: string;
  mlbb_id: string;
  server_id: string;
}

export interface RegistrationFormData {
  team: TeamInfoFormData;
  players: PlayerFormData[];
  substitutes: (PlayerFormData | null)[];
  agreed: boolean;
}

export interface MidtransResponse {
  token: string;
  redirect_url: string;
}

export interface TournamentConfig {
  name: string;
  date: string;
  fee: number;
  maxSlots: number;
  whatsapp: string;
}
