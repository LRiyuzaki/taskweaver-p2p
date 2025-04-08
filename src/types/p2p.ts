
import { Task } from './task';
import { Client } from './client';

export interface PeerInfo {
  id: string;
  name?: string;
  status: 'connected' | 'disconnected' | 'connecting';
  lastSeen?: Date;
  deviceType?: string;
}

export interface SyncStatus {
  lastSynced?: Date;
  syncing: boolean;
  peersConnected: number;
  error?: string;
}

export interface SyncedDocument {
  id: string;
  cid: string; // Content ID (IPFS hash)
  type: 'client' | 'task' | 'document' | 'service' | 'project';
  lastModified: Date;
  version: number;
  signature?: string; // For verification purposes
}

export interface SyncOptions {
  autoSync: boolean;
  syncInterval: number; // In milliseconds
  syncOnlyOnWifi: boolean;
  syncOnlyOnLocalNetwork: boolean;
  syncEncryption: boolean;
}

export interface IPFSNode {
  id: string;
  status: 'online' | 'offline' | 'starting';
  addresses?: string[];
}
