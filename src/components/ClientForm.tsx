import React, { useState, useEffect } from 'react';
import { Client, ClientFormData } from '@/types/client';
import { useClientContext } from '@/contexts/ClientContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: ClientFormData) => void;
}

// Function to ensure address is in the correct format
const formatAddress = (address: string | { registered: string; business?: string }) => {
  if (typeof address === 'string') {
    return { registered: address, business: '' };
  }
  return address;
};

export const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit }) => {
  const { getAvailableServiceNames } = useClientContext();
  
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    company: '',
    contactPerson: '',
    phone: '',
    requiredServices: {},
    entityType: 'Company',
    gstin: '',
    pan: '',
    tan: '',
    cin: '',
    llpin: '',
    bankAccounts: [],
    gstRegistrationDate: undefined,
    incorporationDate: undefined,
    financialYearEnd: 'March',
    address: {
      registered: '',
      business: ''
    },
    isGSTRegistered: false,
    isMSME: false,
    msmeNumber: '',
    isIECHolder: false,
    iecNumber: '',
    statutoryDueDates: {
      gstReturn: 20,
      tdsReturn: 7
    }
  });

  // Get available service names
  const availableServices = getAvailableServiceNames();

  // Initialize form with client data if provided
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        company: client.company || '',
        contactPerson: client.contactPerson || '',
        phone: client.phone || '',
        requiredServices: { ...client.requiredServices },
        entityType: client.entityType,
        gstin: client.gstin || '',
        pan: client.pan || '',
        address: formatAddress(client.address || { registered: '', business: '' }),
        startDate: client.startDate ? new Date(client.startDate) : new Date(),
      });
    } else {
      // Initialize requiredServices for new client
      const initialRequiredServices: Record<string, boolean> = {};
      availableServices.forEach(service => {
        initialRequiredServices[service] = false;
      });
      
      setFormData(prev => ({
        ...prev,
        requiredServices: initialRequiredServices
      }));
    }
  }, [client, availableServices]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string) => (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [name]: date || new Date() }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (serviceName: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requiredServices: {
        ...prev.requiredServices,
        [serviceName]: checked
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Client Name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company/Firm Name <span className="text-destructive">*</span></Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entityType">Entity Type <span className="text-destructive">*</span></Label>
            <Select
              value={formData.entityType}
              onValueChange={(value) => handleSelectChange('entityType')(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                <SelectItem value="Company">Company</SelectItem>
                <SelectItem value="LLP">LLP</SelectItem>
                <SelectItem value="Partnership">Partnership</SelectItem>
                <SelectItem value="Trust">Trust</SelectItem>
                <SelectItem value="HUF">HUF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Statutory Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Statutory Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pan">PAN</Label>
            <Input
              id="pan"
              name="pan"
              value={formData.pan}
              onChange={handleChange}
              placeholder="ABCDE1234F"
              className="uppercase"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="gstin">GSTIN</Label>
              <Checkbox 
                id="isGSTRegistered"
                checked={formData.isGSTRegistered}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({
                    ...prev,
                    isGSTRegistered: checked === true
                  }));
                }}
              />
              <Label htmlFor="isGSTRegistered" className="text-sm">GST Registered</Label>
            </div>
            <Input
              id="gstin"
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              placeholder="27ABCDE1234F1Z5"
              className="uppercase"
              disabled={!formData.isGSTRegistered}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tan">TAN</Label>
            <Input
              id="tan"
              name="tan"
              value={formData.tan}
              onChange={handleChange}
              placeholder="DELE12345F"
              className="uppercase"
            />
          </div>
        </div>

        {formData.entityType === 'Company' && (
          <div className="space-y-2">
            <Label htmlFor="cin">CIN (Company Identification Number)</Label>
            <Input
              id="cin"
              name="cin"
              value={formData.cin}
              onChange={handleChange}
              placeholder="L12345MH2023PLC123456"
              className="uppercase"
            />
          </div>
        )}

        {formData.entityType === 'LLP' && (
          <div className="space-y-2">
            <Label htmlFor="llpin">LLPIN</Label>
            <Input
              id="llpin"
              name="llpin"
              value={formData.llpin}
              onChange={handleChange}
              placeholder="AAA-1234"
              className="uppercase"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Financial Year End</Label>
            <Select
              value={formData.financialYearEnd}
              onValueChange={(value) => handleSelectChange('financialYearEnd')(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select financial year end" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="March">March</SelectItem>
                <SelectItem value="December">December</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Incorporation/Registration Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !formData.incorporationDate && "text-muted-foreground"
                  )}
                >
                  {formData.incorporationDate ? (
                    format(formData.incorporationDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.incorporationDate}
                  onSelect={(date) => handleDateChange('incorporationDate')(date)}
                  disabled={(date) =>
                    date > new Date() || date < new Date('1900-01-01')
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address Information</h3>
        <div className="space-y-2">
          <Label htmlFor="registeredAddress">Registered Address <span className="text-destructive">*</span></Label>
          <Textarea
            id="registeredAddress"
            name="address.registered"
            value={formData.address?.registered}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                address: {
                  ...prev.address,
                  registered: e.target.value
                }
              }));
            }}
            required
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessAddress">Business Address (if different)</Label>
          <Textarea
            id="businessAddress"
            name="address.business"
            value={formData.address?.business}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                address: {
                  ...prev.address,
                  business: e.target.value
                }
              }));
            }}
            rows={3}
          />
        </div>
      </div>

      {/* Bank Account Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Bank Accounts</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                bankAccounts: [
                  ...(prev.bankAccounts || []),
                  { accountNumber: '', ifscCode: '', bankName: '', branch: '' }
                ]
              }));
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Account
          </Button>
        </div>

        {formData.bankAccounts?.map((account, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                value={account.accountNumber}
                onChange={(e) => {
                  const newAccounts = [...(formData.bankAccounts || [])];
                  newAccounts[index] = { ...account, accountNumber: e.target.value };
                  setFormData(prev => ({ ...prev, bankAccounts: newAccounts }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>IFSC Code</Label>
              <Input
                value={account.ifscCode}
                onChange={(e) => {
                  const newAccounts = [...(formData.bankAccounts || [])];
                  newAccounts[index] = { ...account, ifscCode: e.target.value.toUpperCase() };
                  setFormData(prev => ({ ...prev, bankAccounts: newAccounts }));
                }}
                className="uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                value={account.bankName}
                onChange={(e) => {
                  const newAccounts = [...(formData.bankAccounts || [])];
                  newAccounts[index] = { ...account, bankName: e.target.value };
                  setFormData(prev => ({ ...prev, bankAccounts: newAccounts }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Branch</Label>
              <Input
                value={account.branch}
                onChange={(e) => {
                  const newAccounts = [...(formData.bankAccounts || [])];
                  newAccounts[index] = { ...account, branch: e.target.value };
                  setFormData(prev => ({ ...prev, bankAccounts: newAccounts }));
                }}
              />
            </div>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="md:col-span-2"
              onClick={() => {
                const newAccounts = formData.bankAccounts?.filter((_, i) => i !== index);
                setFormData(prev => ({ ...prev, bankAccounts: newAccounts }));
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove Account
            </Button>
          </div>
        ))}
      </div>

      {/* Additional Registrations Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Registrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>MSME Registration</Label>
              <Checkbox 
                id="isMSME"
                checked={formData.isMSME}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({
                    ...prev,
                    isMSME: checked === true
                  }));
                }}
              />
            </div>
            {formData.isMSME && (
              <Input
                name="msmeNumber"
                value={formData.msmeNumber}
                onChange={handleChange}
                placeholder="MSME Registration Number"
              />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>IEC Registration</Label>
              <Checkbox 
                id="isIECHolder"
                checked={formData.isIECHolder}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({
                    ...prev,
                    isIECHolder: checked === true
                  }));
                }}
              />
            </div>
            {formData.isIECHolder && (
              <Input
                name="iecNumber"
                value={formData.iecNumber}
                onChange={handleChange}
                placeholder="IEC Number"
              />
            )}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Required Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableServices.map(serviceName => (
            <div key={serviceName} className="flex items-center space-x-2">
              <Checkbox 
                id={`service-${serviceName}`}
                checked={formData.requiredServices[serviceName] || false}
                onCheckedChange={(checked) => {
                  handleServiceChange(serviceName, checked === true);
                }}
              />
              <Label 
                htmlFor={`service-${serviceName}`}
                className="font-normal cursor-pointer"
              >
                {serviceName}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Due Dates Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Statutory Due Dates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>GST Return Due Date</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={formData.statutoryDueDates?.gstReturn}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  statutoryDueDates: {
                    ...prev.statutoryDueDates,
                    gstReturn: parseInt(e.target.value)
                  }
                }));
              }}
              placeholder="Day of month (1-31)"
            />
          </div>

          <div className="space-y-2">
            <Label>TDS Return Due Date</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={formData.statutoryDueDates?.tdsReturn}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  statutoryDueDates: {
                    ...prev.statutoryDueDates,
                    tdsReturn: parseInt(e.target.value)
                  }
                }));
              }}
              placeholder="Day of month (1-31)"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          {client ? 'Update Client' : 'Add Client'}
        </Button>
      </div>
    </form>
  );
};
