
/**
 * Generate a random ID suitable for P2P identification
 * @returns A random ID string
 */
export function generateRandomId(): string {
  // Create a base64 string from random values
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Format a peer ID for display (truncate if needed)
 * @param id The full peer ID
 * @param length Maximum length to show
 * @returns A shortened peer ID for display
 */
export function formatPeerId(id: string, length: number = 8): string {
  if (!id) return 'Unknown';
  if (id.length <= length) return id;
  return `${id.substring(0, length)}...`;
}

/**
 * Get device type icon name based on device type string
 * @param deviceType The device type
 * @returns A string representing an icon name
 */
export function getDeviceTypeIcon(deviceType: string | undefined): string {
  switch (deviceType?.toLowerCase()) {
    case 'mobile':
    case 'phone':
      return 'smartphone';
    case 'tablet':
      return 'tablet';
    case 'server':
      return 'server';
    case 'laptop':
      return 'laptop';
    case 'desktop':
      return 'monitor';
    default:
      return 'device';
  }
}

/**
 * Calculate sync efficiency percentage based on successful and failed operations
 * @param successCount Number of successful operations
 * @param totalCount Total number of operations
 * @returns Efficiency percentage
 */
export function calculateSyncEfficiency(successCount: number, totalCount: number): number {
  if (totalCount === 0) return 100;
  return Math.round((successCount / totalCount) * 100);
}

/**
 * Encrypt data for P2P transmission (simplified version)
 * @param data Data to encrypt
 * @param key Encryption key
 * @returns Encrypted data as string
 */
export async function encryptData(data: any, key: string): Promise<string> {
  // This is a placeholder for actual encryption logic
  // In a real implementation, you would use Web Crypto API or a library
  const jsonString = JSON.stringify(data);
  return btoa(jsonString + '|' + key.substring(0, 4));
}

/**
 * Decrypt data from P2P transmission (simplified version)
 * @param encryptedData Encrypted data string
 * @param key Encryption key
 * @returns Decrypted data object
 */
export async function decryptData(encryptedData: string, key: string): Promise<any> {
  // This is a placeholder for actual decryption logic
  try {
    const decoded = atob(encryptedData);
    const parts = decoded.split('|');
    if (parts.length !== 2 || parts[1] !== key.substring(0, 4)) {
      throw new Error('Invalid encryption key');
    }
    return JSON.parse(parts[0]);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}
