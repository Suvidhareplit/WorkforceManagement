import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, CheckCircle, XCircle, AlertCircle, UserPlus, Users, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

const candidateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  roleId: z.string().min(1, "Role is required"),
  cityId: z.string().min(1, "City is required"),
  clusterId: z.string().min(1, "Cluster is required"),
  qualification: z.string().min(1, "Qualification is required"),
  resumeSource: z.string().min(1, "Resume source is required"),
  vendorId: z.string().optional(),
  recruiterId: z.string().optional(),
  referralName: z.string().optional(),
});

interface ValidatedRow {
  row: number;
  name: string;
  phone: string;
  email: string;
  role: string;
  city: string;
  cluster: string;
  qualification: string;
  resumeSource: string;
  sourceName?: string;
  vendor?: string;
  recruiter?: string;
  errors: Array<{
    row: number;
    field: string;
    value: string;
    message: string;
  }>;
}

function BulkUploadContent({ roles, cities, clusters, vendors, recruiters, toast }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [validatedData, setValidatedData] = useState<ValidatedRow[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<{
    totalRows: number;
    validRows: number;
    errorRows: number;
  } | null>(null);

  const qualifications = ['8th-10th', '11th-12th', 'Graduation', 'B.Tech', 'Diploma', 'ITI'];
  const resumeSources = ['vendor', 'field_recruiter', 'referral'];
  
  // Debug logging
  console.log('BulkUploadContent - Vendors:', vendors);
  console.log('BulkUploadContent - Recruiters:', recruiters);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setValidatedData([]);
      setSummary(null);
    }
  };

  const handleUpdateRow = (index: number, field: string, value: string) => {
    const updatedData = [...validatedData];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value
    };
    
    // Clear existing errors for this field
    updatedData[index].errors = updatedData[index].errors.filter(e => e.field !== field);
    
    // Re-validate this field
    validateField(updatedData[index], field);
    
    // If city changed, re-validate cluster
    if (field === 'city') {
      updatedData[index].errors = updatedData[index].errors.filter(e => e.field !== 'cluster');
      validateField(updatedData[index], 'cluster');
    }
    
    // If resumeSource changed, clear sourceName and vendor/recruiter
    if (field === 'resumeSource') {
      updatedData[index].sourceName = '';
      updatedData[index].vendor = undefined;
      updatedData[index].recruiter = undefined;
      updatedData[index].errors = updatedData[index].errors.filter(e => e.field !== 'sourceName');
    }
    
    setValidatedData(updatedData);
    
    // Recalculate summary
    const newValidRows = updatedData.filter(row => row.errors.length === 0).length;
    const newErrorRows = updatedData.filter(row => row.errors.length > 0).length;
    setSummary({
      totalRows: updatedData.length,
      validRows: newValidRows,
      errorRows: newErrorRows
    });
  };

  const handleValidate = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiRequest("/api/interviews/bulk-upload/validate", {
        method: "POST",
        body: formData
      });

      console.log('Validation response:', response);

      // Check if response has the expected structure
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Ensure each row has an errors array
      const processedData = response.data.map((row: any) => ({
        ...row,
        errors: row.errors || []
      }));

      setValidatedData(processedData);
      setSummary({
        totalRows: response.totalRows || 0,
        validRows: response.validRows || 0,
        errorRows: response.errorRows || 0,
      });

      if (response.errorRows > 0) {
        toast({
          title: "Validation completed",
          description: `Found ${response.errorRows} row(s) with errors. Please fix them before submitting.`,
          variant: "destructive",
        });
        // Log which rows have errors for debugging
        console.log('Rows with errors:', processedData.filter(row => row.errors.length > 0).map(row => ({
          row: row.row,
          name: row.name,
          errors: row.errors
        })));
      } else {
        toast({
          title: "Validation successful",
          description: `All ${response.totalRows} rows are valid and ready to submit.`,
        });
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to validate file. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };



  const validateField = (row: ValidatedRow, field: string) => {
    const errors = row.errors || [];
    
    switch (field) {
      case 'name':
        if (!row.name || row.name.trim() === '') {
          errors.push({ row: row.row, field: 'name', value: row.name, message: 'Name is required' });
        }
        break;
        
      case 'phone':
        if (!row.phone || !/^\d{10}$/.test(row.phone)) {
          errors.push({ row: row.row, field: 'phone', value: row.phone, message: 'Valid 10-digit phone number is required' });
        }
        break;
        
      case 'email':
        if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
          errors.push({ row: row.row, field: 'email', value: row.email, message: 'Valid email is required' });
        }
        break;
        
      case 'role':
        const role = roles?.find((r: any) => r.name.toLowerCase() === row.role.toLowerCase());
        if (!role) {
          errors.push({ row: row.row, field: 'role', value: row.role, message: 'Invalid role. Must match existing roles.' });
        }
        break;
        
      case 'city':
        const city = cities?.find((c: any) => c.name.toLowerCase() === row.city.toLowerCase());
        if (!city) {
          errors.push({ row: row.row, field: 'city', value: row.city, message: 'Invalid city. Must match existing cities.' });
        }
        break;
        
      case 'cluster':
        const cityId = cities?.find((c: any) => c.name.toLowerCase() === row.city.toLowerCase())?.id;
        const cityCluster = clusters?.find((cl: any) => 
          cl.cityId === cityId && cl.name.toLowerCase() === row.cluster.toLowerCase()
        );
        if (!cityCluster) {
          errors.push({ row: row.row, field: 'cluster', value: row.cluster, message: 'Invalid cluster for selected city' });
        }
        break;
        
      case 'qualification':
        if (!row.qualification || !qualifications.includes(row.qualification)) {
          errors.push({ row: row.row, field: 'qualification', value: row.qualification, message: 'Invalid qualification. Must be one of: ' + qualifications.join(', ') });
        }
        break;
        
      case 'resumeSource':
        if (!row.resumeSource || !resumeSources.includes(row.resumeSource)) {
          errors.push({ row: row.row, field: 'resumeSource', value: row.resumeSource, message: 'Invalid resume source. Must be: vendor, field_recruiter, or referral' });
        }
        break;
        
      case 'sourceName':
        if (row.resumeSource === 'vendor') {
          const vendor = vendors?.find((v: any) => v.name === row.sourceName);
          if (!row.sourceName || !vendor) {
            errors.push({ row: row.row, field: 'sourceName', value: row.sourceName || '', message: 'Vendor name is required when source is vendor' });
          } else {
            row.vendor = row.sourceName;
          }
        } else if (row.resumeSource === 'field_recruiter') {
          const recruiter = recruiters?.find((r: any) => r.name === row.sourceName);
          if (!row.sourceName || !recruiter) {
            errors.push({ row: row.row, field: 'sourceName', value: row.sourceName || '', message: 'Recruiter name is required when source is field_recruiter' });
          } else {
            row.recruiter = row.sourceName;
          }
        } else if (row.resumeSource === 'referral') {
          if (!row.sourceName) {
            errors.push({ row: row.row, field: 'sourceName', value: row.sourceName || '', message: 'Referral name is required when source is referral' });
          } else {
            row.referralName = row.sourceName;
          }
        }
        break;
    }
    
    row.errors = errors;
  };

  const handleSubmit = async () => {
    // Re-validate all rows to ensure IDs are properly set
    const revalidatedData = validatedData.map(row => {
      const newRow = { ...row };
      newRow.errors = [];
      
      // Validate all fields to ensure IDs are set
      ['name', 'phone', 'email', 'role', 'city', 'cluster', 'qualification', 'resumeSource', 'sourceName'].forEach(field => {
        validateField(newRow, field);
      });
      
      return newRow;
    });
    
    const validRows = revalidatedData.filter(row => !row.errors || row.errors.length === 0);
    
    // Debug: log what we're sending
    console.log('Sending candidates:', validRows);
    
    if (validRows.length === 0) {
      toast({
        title: "No valid rows",
        description: "Please fix all errors before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiRequest("/api/interviews/bulk-upload/process", {
        method: "POST",
        body: { candidates: validRows }
      });

      toast({
        title: "Upload successful",
        description: `Successfully created ${response.success} candidates. ${response.failed > 0 ? `Failed: ${response.failed}` : ''}`,
      });

      // Clear data after successful upload
      setFile(null);
      setValidatedData([]);
      setSummary(null);
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/candidates"] });
    } catch (error) {
      toast({
        title: "Submit failed",
        description: "Failed to process candidates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "name,phone,email,role,city,cluster,qualification,resumeSource,sourceName\n" +
      "John Doe,9876543210,john@example.com,Bike Captain,Bangalore,Electronic City,Graduation,vendor,ManpowerCorp\n" +
      "Jane Smith,9876543211,jane@example.com,Quality Control Associate,Mumbai,Andheri,Diploma,field_recruiter,Joydeep\n" +
      "Bob Wilson,9876543212,bob@example.com,Cleaning Associate,Delhi,South Delhi,11th-12th,referral,Employee Name";

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidate_bulk_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFieldError = (row: ValidatedRow, field: string) => {
    return row.errors && row.errors.find(e => e.field === field);
  };

  return (
    <div className="w-full space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Bulk Candidate Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Disclaimer Section */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm space-y-2">
              <p className="font-semibold text-blue-800">Important Instructions:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>CSV file must contain all required columns: name, phone, email, role, city, cluster, qualification, resumeSource, sourceName</li>
                <li>Qualification must be one of: 8th-10th, 11th-12th, Graduation, B.Tech, Diploma, ITI</li>
                <li>Resume source must be: vendor, field_recruiter, or referral</li>
                <li>For vendor/recruiter sources, the source name must match existing vendor/recruiter names exactly</li>
                <li>City, cluster, and role names must match master data exactly (case-insensitive)</li>
                <li>Maximum 1000 rows per upload for optimal performance</li>
                <li>Email must be valid and phone number should be 10 digits</li>
              </ul>
            </AlertDescription>
          </Alert>
          <div className="flex items-center gap-4">
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full max-w-md"
            />
            <Button 
              onClick={handleValidate} 
              disabled={!file || isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Validating..." : "Validate"}
            </Button>
          </div>

          {summary && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Total rows: {summary.totalRows} | 
                Valid: <span className="text-green-600">{summary.validRows}</span> | 
                Errors: <span className="text-red-600">{summary.errorRows}</span>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {validatedData.length > 0 && (
        <Card className="w-full mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Validated Data</CardTitle>
              <Button 
                onClick={handleSubmit}
                disabled={isProcessing || !summary || summary.errorRows > 0}
              >
                {isProcessing ? "Processing..." : `Submit ${summary?.validRows || 0} Valid Rows`}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[1800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[50px]">Row</TableHead>
                    <TableHead className="min-w-[70px]">Status</TableHead>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[120px]">Phone</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[150px]">Role</TableHead>
                    <TableHead className="min-w-[120px]">City</TableHead>
                    <TableHead className="min-w-[150px]">Cluster</TableHead>
                    <TableHead className="min-w-[120px]">Qualification</TableHead>
                    <TableHead className="min-w-[140px]">Resume Source</TableHead>
                    <TableHead className="min-w-[180px]">Source Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validatedData.map((row, index) => (
                    <TableRow key={index} className={row.errors && row.errors.length > 0 ? "bg-red-50" : "bg-green-50"}>
                      <TableCell>{row.row}</TableCell>
                      <TableCell>
                        {row.errors && row.errors.length > 0 ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <Input
                          value={row.name}
                          onChange={(e) => handleUpdateRow(index, 'name', e.target.value)}
                          className={`w-full ${getFieldError(row, 'name') ? "border-red-500" : ""}`}
                        />
                        {getFieldError(row, 'name') && (
                          <div className="text-xs text-red-500 mt-1">{getFieldError(row, 'name')?.message}</div>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <Input
                          value={row.phone}
                          onChange={(e) => handleUpdateRow(index, 'phone', e.target.value)}
                          className={`w-full ${getFieldError(row, 'phone') ? "border-red-500" : ""}`}
                        />
                        {getFieldError(row, 'phone') && (
                          <div className="text-xs text-red-500 mt-1">{getFieldError(row, 'phone')?.message}</div>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[200px]">
                        <Input
                          value={row.email}
                          onChange={(e) => handleUpdateRow(index, 'email', e.target.value)}
                          className={`w-full ${getFieldError(row, 'email') ? "border-red-500" : ""}`}
                        />
                        {getFieldError(row, 'email') && (
                          <div className="text-xs text-red-500 mt-1">{getFieldError(row, 'email')?.message}</div>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <div className="w-full">
                          <Select
                            value={row.role}
                            onValueChange={(value) => handleUpdateRow(index, 'role', value)}
                          >
                            <SelectTrigger className={`w-full ${getFieldError(row, 'role') ? "border-red-500" : ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roles?.map((role: any) => (
                                <SelectItem key={role.id} value={role.name}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {getFieldError(row, 'role') && (
                            <div className="text-xs text-red-500 mt-1">{getFieldError(row, 'role')?.message}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="w-full">
                          <Select
                            value={row.city}
                            onValueChange={(value) => handleUpdateRow(index, 'city', value)}
                          >
                            <SelectTrigger className={`w-full ${getFieldError(row, 'city') ? "border-red-500" : ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {cities?.map((city: any) => (
                                <SelectItem key={city.id} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {getFieldError(row, 'city') && (
                            <div className="text-xs text-red-500 mt-1">{getFieldError(row, 'city')?.message}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <div className="w-full">
                          <Select
                            value={row.cluster}
                            onValueChange={(value) => handleUpdateRow(index, 'cluster', value)}
                          >
                            <SelectTrigger className={`w-full ${getFieldError(row, 'cluster') ? "border-red-500" : ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {clusters
                                ?.filter((cl: any) => cl.cityId === row.cityId)
                                .map((cluster: any) => (
                                  <SelectItem key={cluster.id} value={cluster.name}>
                                    {cluster.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          {getFieldError(row, 'cluster') && (
                            <div className="text-xs text-red-500 mt-1">{getFieldError(row, 'cluster')?.message}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="w-full">
                          <Select
                            value={row.qualification}
                            onValueChange={(value) => handleUpdateRow(index, 'qualification', value)}
                          >
                            <SelectTrigger className={`w-full ${getFieldError(row, 'qualification') ? "border-red-500" : ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {qualifications.map((qual) => (
                                <SelectItem key={qual} value={qual}>
                                  {qual}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {getFieldError(row, 'qualification') && (
                            <div className="text-xs text-red-500 mt-1">{getFieldError(row, 'qualification')?.message}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[140px]">
                        <div className="w-full">
                          <Select
                            value={row.resumeSource}
                            onValueChange={(value) => handleUpdateRow(index, 'resumeSource', value)}
                          >
                            <SelectTrigger className={`w-full ${getFieldError(row, 'resumeSource') ? "border-red-500" : ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vendor">Vendor</SelectItem>
                              <SelectItem value="field_recruiter">Field Recruiter</SelectItem>
                              <SelectItem value="referral">Referral</SelectItem>
                            </SelectContent>
                          </Select>
                          {getFieldError(row, 'resumeSource') && (
                            <div className="text-xs text-red-500 mt-1">{getFieldError(row, 'resumeSource')?.message}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[180px]">
                        <div className="w-full">
                          {row.resumeSource === 'vendor' ? (
                            <Select
                              value={row.sourceName || ''}
                              onValueChange={(value) => handleUpdateRow(index, 'sourceName', value)}
                            >
                              <SelectTrigger className={`w-full ${getFieldError(row, 'sourceName') ? "border-red-500" : ""}`}>
                                <SelectValue placeholder="Select vendor" />
                              </SelectTrigger>
                              <SelectContent>
                                {vendors?.map((vendor: any) => (
                                  <SelectItem key={vendor.id} value={vendor.name}>
                                    {vendor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : row.resumeSource === 'field_recruiter' ? (
                            <Select
                              value={row.sourceName || ''}
                              onValueChange={(value) => handleUpdateRow(index, 'sourceName', value)}
                            >
                              <SelectTrigger className={`w-full ${getFieldError(row, 'sourceName') ? "border-red-500" : ""}`}>
                                <SelectValue placeholder="Select recruiter" />
                              </SelectTrigger>
                              <SelectContent>
                                {recruiters?.map((recruiter: any) => (
                                  <SelectItem key={recruiter.id} value={recruiter.name}>
                                    {recruiter.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={row.sourceName || ''}
                              onChange={(e) => handleUpdateRow(index, 'sourceName', e.target.value)}
                              className={`w-full ${getFieldError(row, 'sourceName') ? "border-red-500" : ""}`}
                            />
                          )}
                          {getFieldError(row, 'sourceName') && (
                            <div className="text-xs text-red-500 mt-1">{getFieldError(row, 'sourceName')?.message}</div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CandidateApplication() {
  const [view, setView] = useState<'form' | 'list'>('form');
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [cityFilter, setCityFilter] = useState("");
  const [clusterFilter, setClusterFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const { toast } = useToast();

  const { data: cities } = useQuery({
    queryKey: ["/api/master-data/city"],
  });

  const { data: clusters } = useQuery({
    queryKey: ["/api/master-data/cluster"],
  });

  const { data: roles } = useQuery({
    queryKey: ["/api/master-data/role"],
  });

  const { data: vendors } = useQuery({
    queryKey: ["/api/master-data/vendor"],
  });

  const { data: recruiters } = useQuery({
    queryKey: ["/api/master-data/recruiter"],
  });

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["/api/interviews/candidates"],
    enabled: view === 'list',
  });

  const form = useForm<z.infer<typeof candidateSchema>>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      roleId: "",
      cityId: "",
      clusterId: "",
      qualification: "",
      resumeSource: "",
      vendorId: "",
      recruiterId: "",
      referralName: "",
    },
  });

  const createCandidateMutation = useMutation({
    mutationFn: async (data: any) => {
      // Find the names based on IDs
      const roleName = roles?.find(r => r.id === parseInt(data.roleId))?.name || '';
      const cityName = cities?.find(c => c.id === parseInt(data.cityId))?.name || '';
      const clusterName = clusters?.find(c => c.id === parseInt(data.clusterId))?.name || '';
      const vendorName = data.vendorId ? vendors?.find(v => v.id === parseInt(data.vendorId))?.name : undefined;
      const recruiterName = data.recruiterId ? recruiters?.find(r => r.id === parseInt(data.recruiterId))?.name : undefined;

      const payload: any = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        role: roleName,
        city: cityName,
        cluster: clusterName,
        qualification: data.qualification,
        resumeSource: data.resumeSource,
      };

      if (vendorName) payload.vendor = vendorName;
      if (recruiterName) payload.recruiter = recruiterName;
      if (data.referralName) payload.referralName = data.referralName;

      return await apiRequest("POST", "/api/interviews/candidates", payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/candidates"] });
      toast({
        title: "Success",
        description: data.message || "Candidate application submitted successfully",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof candidateSchema>) => {
    // Add validation based on resume source
    if (data.resumeSource === "vendor" && !data.vendorId) {
      toast({
        title: "Validation Error",
        description: "Please select a vendor",
        variant: "destructive",
      });
      return;
    }
    if (data.resumeSource === "field_recruiter" && !data.recruiterId) {
      toast({
        title: "Validation Error", 
        description: "Please select a recruiter",
        variant: "destructive",
      });
      return;
    }
    if (data.resumeSource === "referral" && !data.referralName) {
      toast({
        title: "Validation Error",
        description: "Please enter referral name",
        variant: "destructive",
      });
      return;
    }
    
    createCandidateMutation.mutate(data);
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    form.setValue("clusterId", "");
  };

  const handleSourceChange = (source: string) => {
    setSelectedSource(source);
    form.setValue("vendorId", "");
    form.setValue("recruiterId", "");
    form.setValue("referralName", "");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'applied':
        return 'default';
      case 'prescreening':
        return 'secondary';
      case 'technical':
        return 'outline';
      case 'selected':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'offered':
        return 'default';
      case 'joined':
        return 'default';
      default:
        return 'default';
    }
  };

  const handlePushToPrescreening = async () => {
    try {
      // Update all selected candidates to prescreening status
      const updatePromises = selectedCandidates.map(candidateId => 
        apiRequest("PATCH", `/api/interviews/candidates/${candidateId}`, {
          status: 'prescreening'
        })
      );
      
      await Promise.all(updatePromises);
      
      toast({
        title: "Success",
        description: `${selectedCandidates.length} candidates pushed to prescreening`,
      });
      
      // Clear selection and refresh
      setSelectedCandidates([]);
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/candidates"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update candidates",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Candidate Applications</h2>
            <p className="text-slate-600 mt-1">Manage candidate applications and submissions</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={view === 'form' ? 'default' : 'outline'}
              onClick={() => setView('form')}
            >
              Application Form
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              onClick={() => setView('list')}
            >
              View Applications
            </Button>
          </div>
        </div>
      </div>

      {view === 'form' ? (
        <Tabs defaultValue="single" className="w-full">
          <TabsList>
            <TabsTrigger value="single">
              <UserPlus className="mr-2 h-4 w-4" />
              Single Application
            </TabsTrigger>
            <TabsTrigger value="bulk">
              <Users className="mr-2 h-4 w-4" />
              Bulk Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>New Candidate Application</CardTitle>
              </CardHeader>
              <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (as per Aadhar)</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="10-digit phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email ID</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Array.isArray(roles) ? roles : []).map((role: any) => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleCityChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Array.isArray(cities) ? cities : []).map((city: any) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clusterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cluster</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Cluster" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Array.isArray(clusters) ? clusters : [])
                              .filter((cluster: any) => selectedCityId ? cluster.cityId === parseInt(selectedCityId) : true)
                              .map((cluster: any) => (
                                <SelectItem key={cluster.id} value={cluster.id.toString()}>
                                  {cluster.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Qualification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="8th-10th">8th-10th</SelectItem>
                          <SelectItem value="11th-12th">11th-12th</SelectItem>
                          <SelectItem value="Graduation">Graduation</SelectItem>
                          <SelectItem value="B.Tech">B.Tech</SelectItem>
                          <SelectItem value="Diploma">Diploma</SelectItem>
                          <SelectItem value="ITI">ITI</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resumeSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Source</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleSourceChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vendor">Vendor</SelectItem>
                          <SelectItem value="field_recruiter">Field Recruiter</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="direct">Direct Application</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedSource === "vendor" && (
                  <FormField
                    control={form.control}
                    name="vendorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Name</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Vendor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Array.isArray(vendors) ? vendors : []).map((vendor: any) => (
                              <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                {vendor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedSource === "field_recruiter" && (
                  <FormField
                    control={form.control}
                    name="recruiterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Recruiter Name</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Recruiter" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Array.isArray(recruiters) ? recruiters : []).map((recruiter: any) => (
                              <SelectItem key={recruiter.id} value={recruiter.id.toString()}>
                                {recruiter.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedSource === "referral" && (
                  <FormField
                    control={form.control}
                    name="referralName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referral Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of the person who referred" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Reset
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createCandidateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createCandidateMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="bulk" className="w-full">
        <BulkUploadContent 
          roles={roles}
          cities={cities}
          clusters={clusters}
          vendors={vendors}
          recruiters={recruiters}
          toast={toast}
        />
      </TabsContent>
    </Tabs>
  ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="cityFilter">City</Label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger id="cityFilter">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities?.map((city: any) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="clusterFilter">Cluster</Label>
              <Select value={clusterFilter} onValueChange={setClusterFilter}>
                <SelectTrigger id="clusterFilter">
                  <SelectValue placeholder="All Clusters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clusters</SelectItem>
                  {clusters?.filter((cluster: any) => {
                    if (!cityFilter || cityFilter === "all") return true;
                    const selectedCity = cities?.find((city: any) => city.name === cityFilter);
                    return selectedCity && cluster.city_id === selectedCity.id;
                  }).map((cluster: any) => (
                    <SelectItem key={cluster.id} value={cluster.name}>
                      {cluster.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Candidate Applications</CardTitle>
                {selectedCandidates.length > 0 && (
                  <Button 
                    onClick={() => handlePushToPrescreening()}
                    className="flex items-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Push to Prescreening ({selectedCandidates.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={candidates?.length > 0 && selectedCandidates.length === candidates?.filter(c => c.status === 'applied').length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCandidates(candidates?.filter(c => c.status === 'applied').map(c => c.id) || []);
                        } else {
                          setSelectedCandidates([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : candidates?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  candidates?.filter((candidate: any) => {
                    if (cityFilter && cityFilter !== "all" && candidate.city !== cityFilter) return false;
                    if (clusterFilter && clusterFilter !== "all" && candidate.cluster !== clusterFilter) return false;
                    if (dateRange.from && new Date(candidate.createdAt) < new Date(dateRange.from)) return false;
                    if (dateRange.to && new Date(candidate.createdAt) > new Date(dateRange.to)) return false;
                    return true;
                  }).map((candidate: any) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedCandidates.includes(candidate.id)}
                          disabled={candidate.status !== 'applied'}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCandidates([...selectedCandidates, candidate.id]);
                            } else {
                              setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{candidate.applicationId || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.phone}</TableCell>
                      <TableCell>{candidate.role || ''}</TableCell>
                      <TableCell>{candidate.city || ''}</TableCell>
                      <TableCell>{candidate.cluster || ''}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {(() => {
                              if (candidate.vendor) {
                                return 'Vendor';
                              } else if (candidate.recruiter) {
                                return 'Field Recruiter';
                              } else if (candidate.referralName) {
                                return 'Referral';
                              } else {
                                return 'Direct Application';
                              }
                            })()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(() => {
                              if (candidate.vendor) {
                                return candidate.vendor;
                              } else if (candidate.recruiter) {
                                return candidate.recruiter;
                              } else if (candidate.referralName) {
                                return candidate.referralName;
                              } else {
                                return '-';
                              }
                            })()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(candidate.status)}>
                          {candidate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )}
  </div>
  );
}
