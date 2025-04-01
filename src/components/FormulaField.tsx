
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FormulaFieldProps {
  label: string;
  formula: string;
  onFormulaChange: (formula: string) => void;
  value: string;
  dependencies?: Record<string, number | string>;
}

export const FormulaField: React.FC<FormulaFieldProps> = ({
  label,
  formula,
  onFormulaChange,
  value,
  dependencies = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(formula);
  const [error, setError] = useState<string | null>(null);

  // Simplified formula evaluation
  const evaluateFormula = (formulaStr: string, deps: Record<string, number | string>): string => {
    try {
      // Replace variables with their values
      let evalStr = formulaStr;
      
      // Replace all variable occurrences with their values
      Object.entries(deps).forEach(([key, val]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        evalStr = evalStr.replace(regex, typeof val === 'number' ? val.toString() : `"${val}"`);
      });
      
      // Basic sanity check for invalid characters
      if (/[;\\]/.test(evalStr)) {
        throw new Error("Invalid characters in formula");
      }

      // Simple mathematical operations only
      if (!/^[0-9+\-*/()., "<>=&|!%\s"]*$/.test(evalStr)) {
        throw new Error("Formula contains invalid operators");
      }

      // Only evaluate if it's a simple mathematical formula
      const result = Function(`"use strict"; return (${evalStr})`)();
      return result.toString();
    } catch (e) {
      setError(`Formula error: ${e instanceof Error ? e.message : 'Unknown error'}`);
      return "Error";
    }
  };

  useEffect(() => {
    // Only evaluate if there's a formula
    if (formula && Object.keys(dependencies).length > 0) {
      try {
        evaluateFormula(formula, dependencies);
        setError(null);
      } catch (e) {
        setError(`Formula error: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
  }, [formula, dependencies]);

  const handleSave = () => {
    onFormulaChange(editValue);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Badge 
          variant="outline" 
          className="cursor-pointer flex items-center gap-1"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Calculator className="h-3 w-3" />
          Formula
        </Badge>
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Enter formula, e.g. {taskCount} * 2"
          />
          <div className="text-xs text-muted-foreground">
            Use {"{variableName}"} syntax to reference other fields
          </div>
          <div className="flex justify-end gap-2">
            <button 
              className="text-xs text-blue-600 hover:underline" 
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button 
              className="text-xs text-blue-600 hover:underline" 
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="p-2 bg-muted/40 rounded border text-sm">
            {value || "Result will appear here"}
          </div>
          {error && <div className="text-xs text-destructive mt-1">{error}</div>}
          <div className="text-xs text-muted-foreground mt-1">
            Formula: {formula || "None"}
          </div>
        </div>
      )}
    </div>
  );
};
