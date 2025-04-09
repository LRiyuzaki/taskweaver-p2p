
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

// Any-Sync specific types
export interface AnySyncNode {
  id: string;
  status: 'online' | 'offline' | 'starting';
  deviceId?: string;
  capabilities?: string[];
}

export interface AnySyncDocumentMetadata {
  id: string;
  version: number;
  lastModified: Date;
  authorId?: string;
  isDeleted?: boolean;
  mergeHistory?: string[];
}

export interface AnySyncConflict<T> {
  docId: string;
  localVersion: T;
  remoteVersion: T;
  merged?: T;
  resolved: boolean;
}

export enum SyncProtocol {
  IPFS = 'ipfs',
  ANY_SYNC = 'any-sync'
}
