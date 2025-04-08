
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw } from 'lucide-react';
import { generateSeedData } from '@/utils/seedData';
import { toast } from '@/hooks/use-toast';

export const SeedDataButton = () => {
  const handleSeedData = () => {
    generateSeedData();
    toast({
      title: "Test Data Generated",
      description: "Sample clients, services, and tasks have been created successfully.",
    });
    // Reload the page to show the new data
    window.location.reload();
  };
  
  return (
    <Button 
      onClick={handleSeedData} 
      variant="outline"
      className="flex items-center gap-2"
    >
      <Database className="h-4 w-4" />
      <RefreshCw className="h-4 w-4" />
      Generate Test Data
    </Button>
  );
};
