
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDatabaseContext, FieldType } from '@/contexts/DatabaseContext';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { XCircle, PlusCircle } from 'lucide-react';

interface AddFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
}

export const AddFieldDialog: React.FC<AddFieldDialogProps> = ({
  open,
  onOpenChange,
  tableId,
}) => {
  const { addField, tables } = useDatabaseContext();
  
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [required, setRequired] = useState(false);
  const [selectOptions, setSelectOptions] = useState<Array<{ id: string; label: string; color: string }>>([]);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionColor, setNewOptionColor] = useState('#6366f1');
  const [relationTableId, setRelationTableId] = useState('');
  
  const resetForm = () => {
    setFieldName('');
    setFieldType('text');
    setRequired(false);
    setSelectOptions([]);
    setNewOptionLabel('');
    setNewOptionColor('#6366f1');
    setRelationTableId('');
  };
  
  const handleAddOption = () => {
    if (newOptionLabel.trim() === '') return;
    
    setSelectOptions([
      ...selectOptions,
      {
        id: uuidv4(),
        label: newOptionLabel,
        color: newOptionColor,
      },
    ]);
    
    setNewOptionLabel('');
  };
  
  const handleRemoveOption = (id: string) => {
    setSelectOptions(selectOptions.filter(option => option.id !== id));
  };
  
  const handleSubmit = () => {
    if (!fieldName.trim()) return;
    
    const fieldData = {
      name: fieldName,
      type: fieldType,
      required,
    };
    
    // Add field-specific properties
    const additionalProps: any = {};
    
    if (fieldType === 'select' || fieldType === 'multiSelect') {
      additionalProps.options = selectOptions;
    }
    
    if (fieldType === 'relation' && relationTableId) {
      additionalProps.relationTableId = relationTableId;
    }
    
    addField(tableId, { ...fieldData, ...additionalProps });
    resetForm();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Field</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="field-name">Field Name</Label>
            <Input
              id="field-name"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="Enter field name"
              autoFocus
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="field-type">Field Type</Label>
            <Select value={fieldType} onValueChange={(value) => setFieldType(value as FieldType)}>
              <SelectTrigger id="field-type">
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Basic</SelectLabel>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Selection</SelectLabel>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="multiSelect">Multi Select</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Special</SelectLabel>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="percent">Percent</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="relation">Relation</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {(fieldType === 'select' || fieldType === 'multiSelect') && (
            <div className="space-y-3">
              <Label>Options</Label>
              
              <div className="flex flex-wrap gap-2">
                {selectOptions.map((option) => (
                  <Badge 
                    key={option.id} 
                    variant="outline"
                    style={{ backgroundColor: `${option.color}20`, borderColor: option.color }}
                  >
                    {option.label}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1"
                      onClick={() => handleRemoveOption(option.id)}
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  placeholder="Option label"
                />
                <Input
                  type="color"
                  value={newOptionColor}
                  onChange={(e) => setNewOptionColor(e.target.value)}
                  className="w-10 p-1 h-10"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddOption}
                  disabled={!newOptionLabel.trim()}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {fieldType === 'relation' && (
            <div className="grid gap-2">
              <Label htmlFor="relation-table">Related Table</Label>
              <Select value={relationTableId} onValueChange={setRelationTableId}>
                <SelectTrigger id="relation-table">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables
                    .filter(table => table.id !== tableId)
                    .map(table => (
                      <SelectItem key={table.id} value={table.id}>
                        {table.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={required}
              onCheckedChange={setRequired}
            />
            <Label htmlFor="required">Required field</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!fieldName.trim()}>
            Add Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
