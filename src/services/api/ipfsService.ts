
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast-extensions';

/**
 * Interface for IPFS document sync responses
 */
export interface IPFSSyncResponse<T = any> {
  success: boolean;
  data: T | null;
  error: Error | null;
  cid?: string;
}

/**
 * Service for IPFS operations
 */
export const ipfsService = {
  /**
   * Publish data to IPFS and sync with Supabase
   * @param type The document type (client, task, etc)
   * @param data The data to publish
   * @returns Response with CID and sync status
   */
  async publishData<T extends { id: string }>(
    type: string,
    data: T
  ): Promise<IPFSSyncResponse<T>> {
    try {
      // First publish to IPFS via the edge function
      const response = await supabase.functions.invoke('ipfs-gateway', {
        body: {
          action: 'publish',
          data,
          type
        }
      });
      
      if (response.error) {
        throw new Error(`Failed to publish to IPFS: ${response.error.message}`);
      }
      
      const { cid } = response.data;
      
      if (!cid) {
        throw new Error('No CID received from IPFS');
      }
      
      // Then sync the document with Supabase
      const { data: syncData, error: syncError } = await supabase
        .from('sync_documents')
        .insert({
          original_id: data.id,
          document_type: type,
          cid,
          content: data,
          version: 1,
          is_deleted: false
        })
        .select()
        .single();
        
      if (syncError) {
        throw new Error(`Failed to sync with database: ${syncError.message}`);
      }
      
      // Log the successful operation
      await supabase.from('sync_logs').insert({
        operation: 'publish',
        document_id: syncData.id,
        status: 'success',
        details: { original_id: data.id, type }
      });
      
      toast.success(`Successfully published ${type} to the network`);
      
      return {
        success: true,
        data,
        error: null,
        cid
      };
      
    } catch (error) {
      console.error('Error publishing to IPFS:', error);
      
      toast.error(error instanceof Error ? error.message : 'Failed to publish to the network');
      
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  },
  
  /**
   * Retrieve data from IPFS by CID
   * @param cid The content identifier for the data
   * @returns Response with retrieved data
   */
  async retrieveData<T>(cid: string): Promise<IPFSSyncResponse<T>> {
    try {
      const response = await supabase.functions.invoke('ipfs-gateway', {
        body: {
          action: 'retrieve',
          cid
        }
      });
      
      if (response.error) {
        throw new Error(`Failed to retrieve from IPFS: ${response.error.message}`);
      }
      
      return {
        success: true,
        data: response.data.content,
        error: null,
        cid
      };
      
    } catch (error) {
      console.error('Error retrieving from IPFS:', error);
      
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        cid
      };
    }
  }
};
