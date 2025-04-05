
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileIcon, Plus, Trash2, Download, FileText, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

// Mock document types
const documentCategories = [
  { id: 'financial', name: 'Financial Statements' },
  { id: 'tax', name: 'Tax Documents' },
  { id: 'compliance', name: 'Compliance' },
  { id: 'correspondence', name: 'Correspondence' },
  { id: 'invoices', name: 'Invoices' },
];

interface ClientDocument {
  id: string;
  name: string;
  description?: string;
  category: string;
  uploadDate: Date;
  filename: string;
  size?: number;
  type?: string;
}

interface ClientNote {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
}

interface ClientDocumentsProps {
  clientId: string;
  clientName: string;
}

export const ClientDocuments: React.FC<ClientDocumentsProps> = ({ clientId, clientName }) => {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');
  const [newNote, setNewNote] = useState('');
  
  // Document form state
  const [documentData, setDocumentData] = useState({
    name: '',
    description: '',
    category: 'financial',
    file: null as File | null,
  });

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocumentData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentData(prev => ({ 
        ...prev, 
        file: e.target.files![0],
        name: prev.name || e.target.files![0].name.split('.')[0]
      }));
    }
  };

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentData.file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    const newDoc: ClientDocument = {
      id: uuidv4(),
      name: documentData.name,
      description: documentData.description,
      category: documentData.category,
      uploadDate: new Date(),
      filename: documentData.file.name,
      size: documentData.file.size,
      type: documentData.file.type,
    };
    
    setDocuments(prev => [...prev, newDoc]);
    setDocumentData({
      name: '',
      description: '',
      category: 'financial',
      file: null,
    });
    setIsUploadDialogOpen(false);
    
    toast({
      title: "Document Uploaded",
      description: `"${newDoc.name}" has been uploaded successfully.`
    });
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.trim()) {
      toast({
        title: "Empty Note",
        description: "Please enter some content for your note.",
        variant: "destructive"
      });
      return;
    }

    const newNoteItem: ClientNote = {
      id: uuidv4(),
      content: newNote,
      createdAt: new Date(),
      createdBy: "Current User", // In a real app, get this from auth context
    };
    
    setNotes(prev => [...prev, newNoteItem]);
    setNewNote('');
    setIsNoteDialogOpen(false);
    
    toast({
      title: "Note Added",
      description: `A new note has been added for ${clientName}.`
    });
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: "Document Deleted",
      description: "The document has been deleted successfully."
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes & Communication
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'documents' ? (
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          ) : (
            <Button onClick={() => setIsNoteDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          )}
        </div>

        <TabsContent value="documents" className="space-y-4">
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {documents.map(doc => (
                <Card key={doc.id} className="overflow-hidden">
                  <div className="flex items-start p-4">
                    <div className="bg-primary/10 p-3 rounded-md mr-4">
                      <FileIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">{doc.filename}</p>
                          {doc.description && (
                            <p className="text-sm mt-1">{doc.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="mr-2">
                          {documentCategories.find(c => c.id === doc.category)?.name || doc.category}
                        </Badge>
                        <span className="mr-2">{formatFileSize(doc.size)}</span>
                        <span>{format(doc.uploadDate, 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/40">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          {notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map(note => (
                <Card key={note.id}>
                  <CardContent className="pt-6">
                    <p className="whitespace-pre-wrap">{note.content}</p>
                    <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                      <span>Added by {note.createdBy}</span>
                      <span>{format(note.createdAt, 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/40">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">No notes added yet</p>
                <Button onClick={() => setIsNoteDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Document Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document for {clientName}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDocumentSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Document Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={documentData.name}
                  onChange={handleDocumentChange}
                  placeholder="e.g., 2023 Income Statement"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={documentData.category}
                  onChange={handleDocumentChange}
                  required
                >
                  {documentCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  name="description"
                  value={documentData.description}
                  onChange={handleDocumentChange}
                  placeholder="Brief description of the document"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Upload</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note or communication record for {clientName}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNoteSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="note">Note Content</Label>
                <textarea
                  id="note"
                  rows={5}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter your note here..."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Note</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
