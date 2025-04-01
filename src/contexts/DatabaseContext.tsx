
import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'checkbox' 
  | 'select' 
  | 'multiSelect' 
  | 'date' 
  | 'relation' 
  | 'url' 
  | 'email'
  | 'phone'
  | 'currency'
  | 'percent'
  | 'formula'
  | 'attachment';

export interface FieldOption {
  id: string;
  label: string;
  color?: string;
}

export interface TableField {
  id: string;
  name: string;
  type: FieldType;
  options?: FieldOption[]; // For select, multiSelect
  relationTableId?: string; // For relation fields
  relationFieldId?: string; // For relation fields
  formula?: string; // For formula fields
  required?: boolean;
  default?: any;
}

export interface TableRow {
  id: string;
  [key: string]: any; // Dynamic fields based on table structure
}

export interface Table {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  fields: TableField[];
  rows: TableRow[];
}

interface DatabaseContextType {
  tables: Table[];
  activeTableId: string | null;
  activeTable: Table | null;
  setActiveTableId: (id: string | null) => void;
  createTable: (table: Omit<Table, 'id' | 'fields' | 'rows'>) => void;
  updateTable: (id: string, updates: Partial<Omit<Table, 'id'>>) => void;
  deleteTable: (id: string) => void;
  addField: (tableId: string, field: Omit<TableField, 'id'>) => void;
  updateField: (tableId: string, fieldId: string, updates: Partial<Omit<TableField, 'id'>>) => void;
  deleteField: (tableId: string, fieldId: string) => void;
  addRow: (tableId: string, data?: Partial<TableRow>) => void;
  updateRow: (tableId: string, rowId: string, data: Partial<TableRow>) => void;
  deleteRow: (tableId: string, rowId: string) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabaseContext = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>(() => {
    const savedTables = localStorage.getItem('database_tables');
    if (savedTables) {
      try {
        return JSON.parse(savedTables);
      } catch (e) {
        console.error('Failed to parse saved tables', e);
        return [];
      }
    }
    return [];
  });
  
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  
  const activeTable = tables.find(table => table.id === activeTableId) || null;
  
  // Save tables to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('database_tables', JSON.stringify(tables));
  }, [tables]);
  
  const createTable = (tableData: Omit<Table, 'id' | 'fields' | 'rows'>) => {
    const newTable: Table = {
      ...tableData,
      id: uuidv4(),
      fields: [
        {
          id: uuidv4(),
          name: 'Name',
          type: 'text',
          required: true
        }
      ],
      rows: []
    };
    
    setTables(prevTables => [...prevTables, newTable]);
    setActiveTableId(newTable.id);
    toast({
      title: "Table Created",
      description: `Table "${newTable.name}" has been created successfully.`
    });
  };
  
  const updateTable = (id: string, updates: Partial<Omit<Table, 'id'>>) => {
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === id ? { ...table, ...updates } : table
      )
    );
    toast({
      title: "Table Updated",
      description: `Table has been updated successfully.`
    });
  };
  
  const deleteTable = (id: string) => {
    setTables(prevTables => prevTables.filter(table => table.id !== id));
    if (activeTableId === id) {
      setActiveTableId(null);
    }
    toast({
      title: "Table Deleted",
      description: `Table has been deleted successfully.`
    });
  };
  
  const addField = (tableId: string, field: Omit<TableField, 'id'>) => {
    const newField: TableField = {
      ...field,
      id: uuidv4()
    };
    
    setTables(prevTables => 
      prevTables.map(table => {
        if (table.id === tableId) {
          // Ensure each row has the new field with default value and maintains the TableRow type
          const updatedRows = table.rows.map(row => ({
            ...row,
            [newField.id]: newField.default || null
          }));
          
          return {
            ...table,
            fields: [...table.fields, newField],
            rows: updatedRows
          };
        }
        return table;
      })
    );
    toast({
      title: "Field Added",
      description: `Field "${field.name}" has been added successfully.`
    });
  };
  
  const updateField = (tableId: string, fieldId: string, updates: Partial<Omit<TableField, 'id'>>) => {
    setTables(prevTables => 
      prevTables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            fields: table.fields.map(field => 
              field.id === fieldId ? { ...field, ...updates } : field
            )
          };
        }
        return table;
      })
    );
    toast({
      title: "Field Updated",
      description: `Field has been updated successfully.`
    });
  };
  
  const deleteField = (tableId: string, fieldId: string) => {
    setTables(prevTables => 
      prevTables.map(table => {
        if (table.id === tableId) {
          // Don't allow deleting the last remaining field
          if (table.fields.length <= 1) {
            toast({
              variant: "destructive",
              title: "Cannot Delete Field",
              description: "Tables must have at least one field."
            });
            return table;
          }
          
          return {
            ...table,
            fields: table.fields.filter(field => field.id !== fieldId),
            rows: table.rows.map(row => {
              const { [fieldId]: _, ...rest } = row;
              return rest;
            })
          };
        }
        return table;
      })
    );
    toast({
      title: "Field Deleted",
      description: `Field has been deleted successfully.`
    });
  };
  
  const addRow = (tableId: string, data: Partial<TableRow> = {}) => {
    const newRow: TableRow = {
      id: uuidv4(),
      ...data
    };
    
    setTables(prevTables => 
      prevTables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            rows: [...table.rows, newRow]
          };
        }
        return table;
      })
    );
  };
  
  const updateRow = (tableId: string, rowId: string, data: Partial<TableRow>) => {
    setTables(prevTables => 
      prevTables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            rows: table.rows.map(row => 
              row.id === rowId ? { ...row, ...data } : row
            )
          };
        }
        return table;
      })
    );
  };
  
  const deleteRow = (tableId: string, rowId: string) => {
    setTables(prevTables => 
      prevTables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            rows: table.rows.filter(row => row.id !== rowId)
          };
        }
        return table;
      })
    );
  };
  
  return (
    <DatabaseContext.Provider value={{
      tables,
      activeTableId,
      activeTable,
      setActiveTableId,
      createTable,
      updateTable,
      deleteTable,
      addField,
      updateField,
      deleteField,
      addRow,
      updateRow,
      deleteRow
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};
