import { Peer, DataConnection } from 'peerjs';
import { MidiEventPayload } from '../types/midi';

class P2PService {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private isConnected = false;
  private onMessageCallback: ((data: unknown) => void) | null = null;
  private onStatusChangeCallback: ((connected: boolean, peerId: string) => void) | null = null;

  public init(role: 'pc' | 'phone', targetPeerId?: string, customId?: string) {
    try {
      // Clean up existing peer if any
      if (this.peer) {
        this.peer.destroy();
      }

      // Initialize Peer with public STUN servers
      this.peer = customId ? new Peer(customId) : new Peer();

      this.peer.on('open', (id) => {
        if (role === 'pc') {
          this.onStatusChangeCallback?.(false, id);
        } else if (role === 'phone' && targetPeerId) {
          this.connectToPeer(targetPeerId);
        }
      });

      // On PC: listen for incoming phone connection
      this.peer.on('connection', (conn) => {
        this.connection = conn;
        this.setupConnectionHandlers(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('P2P WebRTC warning/error:', err);
      });
    } catch (e) {
      console.warn('PeerJS initialization skipped:', e);
    }
  }

  public connectToPeer(targetId: string) {
    if (!this.peer) return;
    try {
      const conn = this.peer.connect(targetId, { reliable: true });
      this.connection = conn;
      this.setupConnectionHandlers(conn);
    } catch (e) {
      console.warn('P2P connection error:', e);
    }
  }

  private setupConnectionHandlers(conn: DataConnection) {
    conn.on('open', () => {
      this.isConnected = true;
      this.onStatusChangeCallback?.(true, conn.peer);
    });

    conn.on('data', (data) => {
      this.onMessageCallback?.(data);
    });

    conn.on('close', () => {
      this.isConnected = false;
      this.onStatusChangeCallback?.(false, '');
    });

    conn.on('error', () => {
      this.isConnected = false;
      this.onStatusChangeCallback?.(false, '');
    });
  }

  public send(payload: unknown): boolean {
    if (this.connection && this.isConnected) {
      try {
        this.connection.send(payload);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  public onMessage(cb: (data: unknown) => void) {
    this.onMessageCallback = cb;
  }

  public onStatus(cb: (connected: boolean, peerId: string) => void) {
    this.onStatusChangeCallback = cb;
  }

  public getPeerId(): string | null {
    return this.peer ? this.peer.id : null;
  }

  public isPeerConnected(): boolean {
    return this.isConnected;
  }

  public destroy() {
    if (this.connection) this.connection.close();
    if (this.peer) this.peer.destroy();
    this.isConnected = false;
  }
}

export const p2pService = new P2PService();
