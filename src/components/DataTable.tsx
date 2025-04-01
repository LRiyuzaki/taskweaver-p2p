
import React, { useState } from 'react';
import { useDatabaseContext, TableField, FieldType } from '@/contexts/DatabaseContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddFieldDialog } from './AddFieldDialog';
import { Plus, MoreHorizontal, Check, X, Edit2, Trash2, FilePlus, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

export const DataTable: React.FC = () => {
  const { 
    activeTable, 
    addRow, 
    updateRow, 
    deleteRow, 
    deleteField 
  } = useDatabaseContext();
  
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{rowId: string, fieldId: string} | null>(null);
  const [cellValues, setCellValues] = useState<{[key: string]: any}>({});
  
  if (!activeTable) return null;
  
  const handleAddRow = () => {
    addRow(activeTable.id);
  };
  
  const startEditing = (rowId: string, fieldId: string, value: any) => {
    setEditingCell({ rowId, fieldId });
    setCellValues({ [rowId+fieldId]: value });
  };
  
  const handleCellValueChange = (value: any) => {
    if (editingCell) {
      setCellValues({ [editingCell.rowId+editingCell.fieldId]: value });
    }
  };
  
  const saveCell = () => {
    if (editingCell) {
      const { rowId, fieldId } = editingCell;
      const value = cellValues[rowId+fieldId];
      updateRow(activeTable.id, rowId, { [fieldId]: value });
      setEditingCell(null);
    }
  };
  
  const cancelEditing = () => {
    setEditingCell(null);
    setCellValues({});
  };
  
  const renderCellContent = (field: TableField, row: any) => {
    const isEditing = editingCell && editingCell.rowId === row.id && editingCell.fieldId === field.id;
    const value = isEditing ? cellValues[row.id+field.id] : row[field.id];
    
    if (isEditing) {
      switch (field.type) {
        case 'text':
        case 'url':
        case 'email':
        case 'phone':
          return (
            <div className="flex items-center">
              <Input
                value={value || ''}
                onChange={(e) => handleCellValueChange(e.target.value)}
                autoFocus
                className="h-8"
              />
              <div className="flex ml-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={saveCell}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={cancelEditing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        
        case 'number':
        case 'currency':
        case 'percent':
          return (
            <div className="flex items-center">
              <Input
                type="number"
                value={value || ''}
                onChange={(e) => handleCellValueChange(parseFloat(e.target.value))}
                autoFocus
                className="h-8"
              />
              <div className="flex ml-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={saveCell}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={cancelEditing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
          
        case 'select':
          return (
            <div className="flex items-center">
              <Select 
                value={value || ''} 
                onValueChange={handleCellValueChange}
              >
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex ml-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={saveCell}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={cancelEditing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
          
        case 'checkbox':
          return (
            <div className="flex items-center">
              <Checkbox
                checked={value || false}
                onCheckedChange={(checked) => {
                  handleCellValueChange(checked);
                  updateRow(activeTable.id, row.id, { [field.id]: checked });
                  setEditingCell(null);
                }}
              />
            </div>
          );
          
        default:
          return null;
      }
    } else {
      switch (field.type) {
        case 'text':
        case 'formula':
          return value || '';
          
        case 'number':
          return value !== undefined && value !== null ? value : '';
          
        case 'checkbox':
          return (
            <Checkbox
              checked={value || false}
              onCheckedChange={(checked) => {
                updateRow(activeTable.id, row.id, { [field.id]: checked });
              }}
            />
          );
          
        case 'select':
          if (!value) return '';
          const option = field.options?.find(opt => opt.id === value);
          return option ? (
            <div 
              className="px-2 py-0.5 text-xs rounded-full text-center inline-block"
              style={{ 
                backgroundColor: option.color ? `${option.color}20` : '#eee',
                color: option.color || '#333'
              }}
            >
              {option.label}
            </div>
          ) : '';
          
        case 'currency':
          return value !== undefined && value !== null 
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
            : '';
          
        case 'percent':
          return value !== undefined && value !== null 
            ? `${value}%`
            : '';
            
        case 'date':
          return value ? format(new Date(value), 'MMM d, yyyy') : '';
          
        case 'url':
          return value ? (
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:underline"
            >
              {new URL(value).hostname}
            </a>
          ) : '';
          
        case 'email':
          return value ? (
            <a 
              href={`mailto:${value}`} 
              className="text-blue-500 hover:underline"
            >
              {value}
            </a>
          ) : '';
          
        default:
          return value || '';
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{activeTable.name}</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsAddFieldDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Field
          </Button>
          <Button 
            onClick={handleAddRow}
            className="flex items-center gap-1"
          >
            <FilePlus className="h-4 w-4" />
            Add Row
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {activeTable.fields.map((field) => (
                <TableHead key={field.id} className="relative">
                  <div className="flex items-center gap-2">
                    <span>{field.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit2 className="mr-2 h-4 w-4" />
                          <span>Edit Field</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive cursor-pointer"
                          onClick={() => deleteField(activeTable.id, field.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Field</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeTable.rows.length > 0 ? (
              activeTable.rows.map((row) => (
                <TableRow key={row.id}>
                  {activeTable.fields.map((field) => (
                    <TableCell 
                      key={field.id}
                      onClick={() => {
                        if (field.type !== 'formula' && field.type !== 'checkbox') {
                          startEditing(row.id, field.id, row[field.id]);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {renderCellContent(field, row)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer"
                          onClick={() => deleteRow(activeTable.id, row.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Row</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={activeTable.fields.length + 1} 
                  className="h-24 text-center"
                >
                  No rows
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <AddFieldDialog 
        open={isAddFieldDialogOpen} 
        onOpenChange={setIsAddFieldDialogOpen} 
        tableId={activeTable.id}
      />
    </div>
  );
};
