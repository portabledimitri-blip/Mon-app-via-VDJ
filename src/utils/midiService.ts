import { MidiDeviceOption, MidiEventPayload } from '../types/midi';

// Standard MIDI mappings for Virtual DJ
// Channel 1: Deck 1
// Channel 2: Deck 2
// Channel 3: Mixer (Crossfader, Master, Headphones)
export const MIDI_MAP = {
  // Deck 1 (Channel 1)
  DECK1_PLAY: { type: 'note', channel: 1, control: 60, name: 'Deck 1 Play/Pause', vdj: 'deck 1 play_pause' },
  DECK1_CUE: { type: 'note', channel: 1, control: 61, name: 'Deck 1 Cue', vdj: 'deck 1 cue' },
  DECK1_SYNC: { type: 'note', channel: 1, control: 62, name: 'Deck 1 Sync', vdj: 'deck 1 sync' },
  DECK1_HOTCUE1: { type: 'note', channel: 1, control: 64, name: 'Deck 1 Hot Cue 1', vdj: 'deck 1 hot_cue 1' },
  DECK1_HOTCUE2: { type: 'note', channel: 1, control: 65, name: 'Deck 1 Hot Cue 2', vdj: 'deck 1 hot_cue 2' },
  DECK1_HOTCUE3: { type: 'note', channel: 1, control: 66, name: 'Deck 1 Hot Cue 3', vdj: 'deck 1 hot_cue 3' },
  DECK1_HOTCUE4: { type: 'note', channel: 1, control: 67, name: 'Deck 1 Hot Cue 4', vdj: 'deck 1 hot_cue 4' },
  DECK1_LOOP_IN: { type: 'note', channel: 1, control: 70, name: 'Deck 1 Loop In', vdj: 'deck 1 loop_in' },
  DECK1_LOOP_OUT: { type: 'note', channel: 1, control: 71, name: 'Deck 1 Loop Out', vdj: 'deck 1 loop_out' },
  DECK1_LOOP_AUTO: { type: 'note', channel: 1, control: 72, name: 'Deck 1 Auto Loop', vdj: 'deck 1 loop 4' },
  DECK1_LOOP_HALF: { type: 'note', channel: 1, control: 73, name: 'Deck 1 Loop /2', vdj: 'deck 1 loop_half' },
  DECK1_LOOP_DOUBLE: { type: 'note', channel: 1, control: 74, name: 'Deck 1 Loop 2x', vdj: 'deck 1 loop_double' },
  DECK1_JOG_TOUCH: { type: 'note', channel: 1, control: 75, name: 'Deck 1 Jog Touch', vdj: 'deck 1 touchwheel_touch' },

  DECK1_VOLUME: { type: 'cc', channel: 1, control: 1, name: 'Deck 1 Volume', vdj: 'deck 1 volume' },
  DECK1_GAIN: { type: 'cc', channel: 1, control: 2, name: 'Deck 1 Gain', vdj: 'deck 1 gain' },
  DECK1_EQ_HIGH: { type: 'cc', channel: 1, control: 3, name: 'Deck 1 EQ High', vdj: 'deck 1 eq_high' },
  DECK1_EQ_MID: { type: 'cc', channel: 1, control: 4, name: 'Deck 1 EQ Mid', vdj: 'deck 1 eq_mid' },
  DECK1_EQ_LOW: { type: 'cc', channel: 1, control: 5, name: 'Deck 1 EQ Low', vdj: 'deck 1 eq_low' },
  DECK1_PITCH: { type: 'cc', channel: 1, control: 6, name: 'Deck 1 Pitch/Tempo', vdj: 'deck 1 pitch' },
  DECK1_JOG_WHEEL: { type: 'cc', channel: 1, control: 7, name: 'Deck 1 Jog Scratch', vdj: 'deck 1 jog' },

  // Deck 2 (Channel 2)
  DECK2_PLAY: { type: 'note', channel: 2, control: 60, name: 'Deck 2 Play/Pause', vdj: 'deck 2 play_pause' },
  DECK2_CUE: { type: 'note', channel: 2, control: 61, name: 'Deck 2 Cue', vdj: 'deck 2 cue' },
  DECK2_SYNC: { type: 'note', channel: 2, control: 62, name: 'Deck 2 Sync', vdj: 'deck 2 sync' },
  DECK2_HOTCUE1: { type: 'note', channel: 2, control: 64, name: 'Deck 2 Hot Cue 1', vdj: 'deck 2 hot_cue 1' },
  DECK2_HOTCUE2: { type: 'note', channel: 2, control: 65, name: 'Deck 2 Hot Cue 2', vdj: 'deck 2 hot_cue 2' },
  DECK2_HOTCUE3: { type: 'note', channel: 2, control: 66, name: 'Deck 2 Hot Cue 3', vdj: 'deck 2 hot_cue 3' },
  DECK2_HOTCUE4: { type: 'note', channel: 2, control: 67, name: 'Deck 2 Hot Cue 4', vdj: 'deck 2 hot_cue 4' },
  DECK2_LOOP_IN: { type: 'note', channel: 2, control: 70, name: 'Deck 2 Loop In', vdj: 'deck 2 loop_in' },
  DECK2_LOOP_OUT: { type: 'note', channel: 2, control: 71, name: 'Deck 2 Loop Out', vdj: 'deck 2 loop_out' },
  DECK2_LOOP_AUTO: { type: 'note', channel: 2, control: 72, name: 'Deck 2 Auto Loop', vdj: 'deck 2 loop 4' },
  DECK2_LOOP_HALF: { type: 'note', channel: 2, control: 73, name: 'Deck 2 Loop /2', vdj: 'deck 2 loop_half' },
  DECK2_LOOP_DOUBLE: { type: 'note', channel: 2, control: 74, name: 'Deck 2 Loop 2x', vdj: 'deck 2 loop_double' },
  DECK2_JOG_TOUCH: { type: 'note', channel: 2, control: 75, name: 'Deck 2 Jog Touch', vdj: 'deck 2 touchwheel_touch' },

  DECK2_VOLUME: { type: 'cc', channel: 2, control: 1, name: 'Deck 2 Volume', vdj: 'deck 2 volume' },
  DECK2_GAIN: { type: 'cc', channel: 2, control: 2, name: 'Deck 2 Gain', vdj: 'deck 2 gain' },
  DECK2_EQ_HIGH: { type: 'cc', channel: 2, control: 3, name: 'Deck 2 EQ High', vdj: 'deck 2 eq_high' },
  DECK2_EQ_MID: { type: 'cc', channel: 2, control: 4, name: 'Deck 2 EQ Mid', vdj: 'deck 2 eq_mid' },
  DECK2_EQ_LOW: { type: 'cc', channel: 2, control: 5, name: 'Deck 2 EQ Low', vdj: 'deck 2 eq_low' },
  DECK2_PITCH: { type: 'cc', channel: 2, control: 6, name: 'Deck 2 Pitch/Tempo', vdj: 'deck 2 pitch' },
  DECK2_JOG_WHEEL: { type: 'cc', channel: 2, control: 7, name: 'Deck 2 Jog Scratch', vdj: 'deck 2 jog' },

  // Master / Mixer (Channel 3)
  CROSSFADER: { type: 'cc', channel: 3, control: 10, name: 'Crossfader', vdj: 'crossfader' },
  MASTER_VOLUME: { type: 'cc', channel: 3, control: 11, name: 'Master Volume', vdj: 'master_volume' },
  HEADPHONES_MIX: { type: 'cc', channel: 3, control: 12, name: 'Headphones Mix', vdj: 'headphone_mix' },
} as const;

interface WebMIDIAccessLike {
  outputs: Map<string, { id: string; name: string; manufacturer?: string; state?: string; send: (bytes: number[]) => void }>;
}

class MidiService {
  private midiAccess: WebMIDIAccessLike | null = null;
  private selectedOutputId: string | null = null;
  private isSupported = false;
  private listeners: ((event: MidiEventPayload) => void)[] = [];

  constructor() {
    this.isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  public getSupported(): boolean {
    return this.isSupported;
  }

  public async initMidi(): Promise<MidiDeviceOption[]> {
    if (!this.isSupported) {
      return [];
    }
    try {
      // @ts-expect-error WebMIDI API typing
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      const devices = this.getAvailableOutputs();
      // Auto-select loopMIDI if present
      const loopDevice = devices.find(d => d.name.toLowerCase().includes('loopmidi'));
      if (loopDevice) {
        this.selectedOutputId = loopDevice.id;
      } else if (devices.length > 0 && !this.selectedOutputId) {
        this.selectedOutputId = devices[0].id;
      }
      return devices;
    } catch (err) {
      console.warn('WebMIDI access denied or unavailable:', err);
      return [];
    }
  }

  public getAvailableOutputs(): MidiDeviceOption[] {
    if (!this.midiAccess) return [];
    const list: MidiDeviceOption[] = [];
    this.midiAccess.outputs.forEach((output) => {
      list.push({
        id: output.id,
        name: output.name || `MIDI Port ${output.id}`,
        manufacturer: output.manufacturer || '',
        state: output.state || 'connected',
      });
    });
    return list;
  }

  public selectOutput(id: string) {
    this.selectedOutputId = id;
  }

  public getSelectedOutputId(): string | null {
    return this.selectedOutputId;
  }

  public onMidiSent(cb: (event: MidiEventPayload) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public sendNoteOn(channel: number, note: number, velocity = 127, actionName?: string, vdjScript?: string) {
    const statusByte = 0x90 + (Math.max(1, Math.min(16, channel)) - 1);
    const bytes = [statusByte, Math.max(0, Math.min(127, note)), Math.max(0, Math.min(127, velocity))];
    this.transmitBytes(bytes);

    const payload: MidiEventPayload = {
      type: 'note_on',
      channel,
      control: note,
      value: velocity,
      timestamp: Date.now(),
      actionName,
      vdjScript,
    };
    this.notify(payload);
    return payload;
  }

  public sendNoteOff(channel: number, note: number, actionName?: string, vdjScript?: string) {
    const statusByte = 0x80 + (Math.max(1, Math.min(16, channel)) - 1);
    const bytes = [statusByte, Math.max(0, Math.min(127, note)), 0];
    this.transmitBytes(bytes);

    const payload: MidiEventPayload = {
      type: 'note_off',
      channel,
      control: note,
      value: 0,
      timestamp: Date.now(),
      actionName,
      vdjScript,
    };
    this.notify(payload);
    return payload;
  }

  public sendCC(channel: number, ccNumber: number, value: number, actionName?: string, vdjScript?: string) {
    const statusByte = 0xB0 + (Math.max(1, Math.min(16, channel)) - 1);
    const clampedVal = Math.max(0, Math.min(127, Math.round(value)));
    const bytes = [statusByte, Math.max(0, Math.min(127, ccNumber)), clampedVal];
    this.transmitBytes(bytes);

    const payload: MidiEventPayload = {
      type: 'cc',
      channel,
      control: ccNumber,
      value: clampedVal,
      timestamp: Date.now(),
      actionName,
      vdjScript,
    };
    this.notify(payload);
    return payload;
  }

  private transmitBytes(bytes: number[]) {
    if (!this.midiAccess || !this.selectedOutputId) return;
    try {
      const output = this.midiAccess.outputs.get(this.selectedOutputId);
      if (output) {
        output.send(bytes);
      }
    } catch (err) {
      console.warn('Failed to send MIDI bytes:', err);
    }
  }

  private notify(payload: MidiEventPayload) {
    this.listeners.forEach(fn => fn(payload));
  }
}

export const midiService = new MidiService();
