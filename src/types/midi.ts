export interface MidiEventPayload {
  type: 'note_on' | 'note_off' | 'cc';
  channel: number; // 1-16
  control: number; // Note or CC number 0-127
  value: number;   // 0-127
  timestamp: number;
  deck?: 1 | 2;
  actionName?: string;
  vdjScript?: string;
}

export interface DeckState {
  isPlaying: boolean;
  isCueing: boolean;
  isSynced: boolean;
  bpm: number;
  pitch: number; // -100 to +100 (%)
  volume: number; // 0 to 127
  gain: number; // 0 to 127
  eqHigh: number; // 0 to 127, 64 is neutral
  eqMid: number;  // 0 to 127, 64 is neutral
  eqLow: number;  // 0 to 127, 64 is neutral
  killLow: boolean;
  killMid: boolean;
  killHigh: boolean;
  hotCues: { [key: number]: boolean }; // 1 to 4
  loopActive: boolean;
  loopSize: number; // 1, 2, 4, 8, 16 beats
  activeFx: { [key: string]: boolean };
  jogAngle: number;
}

export interface ControllerGlobalState {
  crossfader: number; // 0 (Deck 1) to 127 (Deck 2), 64 center
  masterVolume: number;
  headphonesMix: number;
  deck1: DeckState;
  deck2: DeckState;
}

export interface RoomStatus {
  roomId: string;
  phoneConnected: boolean;
  pcConnected: boolean;
  total: number;
}

export interface MidiDeviceOption {
  id: string;
  name: string;
  manufacturer?: string;
  state?: string;
}
