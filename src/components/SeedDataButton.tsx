
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw } from 'lucide-react';
import { seedLocalStorage } from '@/utils/seedData';
import { toast } from '@/hooks/use-toast';

export const SeedDataButton = () => {
  const handleSeedData = () => {
    try {
      seedLocalStorage();
      
      toast({
        title: "Test Data Generated",
        description: "Sample data has been loaded into localStorage",
      });
      
      // Reload the page to show the new data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error generating seed data:", error);
      toast({
        title: "Error",
        description: "Failed to generate test data. Please check the console for details.",
        variant: "destructive",
      });
    }
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
