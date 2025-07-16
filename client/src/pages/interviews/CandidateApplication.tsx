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
import { Upload, Download, CheckCircle, XCircle, AlertCircle, UserPlus, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  errors: Array<{
    row: number;
    field: string;
    value: string;
    message: string;
  }>;
  roleId?: number;
  cityId?: number;
  clusterId?: number;
  vendorId?: number;
  recruiterId?: number;
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
    
    setValidatedData(updatedData);
    
    // Recalculate summary
    const newValidRows = updatedData.filter(row => row.errors.length === 0).length;
    const newErrorRows = updatedData.filter(row => row.errors.length > 0).length;
    setSummary({
      totalRows: updatedData.length,
      validRows: newValidRows,
      errorRows: newErrorRows
    });
    
    // Log to debug vendor/recruiter data
    if (field === 'resumeSource') {
      console.log('Resume source changed to:', value);
      console.log('Available vendors:', vendors);
      console.log('Available recruiters:', recruiters);
    }
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
      case 'role':
        const role = roles?.find((r: any) => r.name.toLowerCase() === row.role.toLowerCase());
        if (!role) {
          errors.push({ row: row.row, field: 'role', value: row.role, message: 'Invalid role' });
        } else {
          row.roleId = role.id;
        }
        break;
        
      case 'city':
        const city = cities?.find((c: any) => c.name.toLowerCase() === row.city.toLowerCase());
        if (!city) {
          errors.push({ row: row.row, field: 'city', value: row.city, message: 'Invalid city' });
        } else {
          row.cityId = city.id;
        }
        break;
        
      case 'cluster':
        const cityId = row.cityId || cities?.find((c: any) => c.name.toLowerCase() === row.city.toLowerCase())?.id;
        const cityCluster = clusters?.find((cl: any) => 
          cl.cityId === cityId && cl.name.toLowerCase() === row.cluster.toLowerCase()
        );
        if (!cityCluster) {
          errors.push({ row: row.row, field: 'cluster', value: row.cluster, message: 'Invalid cluster for selected city' });
        } else {
          row.clusterId = cityCluster.id;
        }
        break;
        
      case 'qualification':
        if (!qualifications.includes(row.qualification)) {
          errors.push({ row: row.row, field: 'qualification', value: row.qualification, message: 'Invalid qualification' });
        }
        break;
        
      case 'resumeSource':
        if (!resumeSources.includes(row.resumeSource)) {
          errors.push({ row: row.row, field: 'resumeSource', value: row.resumeSource, message: 'Invalid resume source' });
        }
        break;
        
      case 'sourceName':
        if (row.resumeSource === 'vendor') {
          const vendor = vendors?.find((v: any) => v.name.toLowerCase() === row.sourceName?.toLowerCase());
          if (!vendor) {
            errors.push({ row: row.row, field: 'sourceName', value: row.sourceName || '', message: 'Invalid vendor' });
          } else {
            row.vendorId = vendor.id;
          }
        } else if (row.resumeSource === 'field_recruiter') {
          const recruiter = recruiters?.find((r: any) => r.name.toLowerCase() === row.sourceName?.toLowerCase());
          if (!recruiter) {
            errors.push({ row: row.row, field: 'sourceName', value: row.sourceName || '', message: 'Invalid recruiter' });
          } else {
            row.recruiterId = recruiter.id;
          }
        }
        break;
    }
    
    row.errors = errors;
  };

  const handleSubmit = async () => {
    const validRows = validatedData.filter(row => row.errors && row.errors.length === 0);
    
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
    <div className="space-y-6">
      <Card>
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
              className="max-w-sm"
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
        <Card>
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
            <div className="w-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Row</TableHead>
                    <TableHead className="w-16">Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Cluster</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Resume Source</TableHead>
                    <TableHead>Source Name</TableHead>
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
                      <TableCell>
                        <Input
                          value={row.name}
                          onChange={(e) => handleUpdateRow(index, 'name', e.target.value)}
                          className={`w-full ${getFieldError(row, 'name') ? "border-red-500" : ""}`}
                        />
                        {getFieldError(row, 'name') && (
                          <div className="text-xs text-red-500 mt-1">{getFieldError(row, 'name')?.message}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.phone}
                          onChange={(e) => handleUpdateRow(index, 'phone', e.target.value)}
                          className={`w-full ${getFieldError(row, 'phone') ? "border-red-500" : ""}`}
                        />
                        {getFieldError(row, 'phone') && (
                          <div className="text-xs text-red-500 mt-1">{getFieldError(row, 'phone')?.message}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.email}
                          onChange={(e) => handleUpdateRow(index, 'email', e.target.value)}
                          className={`w-full ${getFieldError(row, 'email') ? "border-red-500" : ""}`}
                        />
                        {getFieldError(row, 'email') && (
                          <div className="text-xs text-red-500 mt-1">{getFieldError(row, 'email')?.message}</div>
                        )}
                      </TableCell>
                      <TableCell>
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
                      <TableCell>
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
                      <TableCell>
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
                      <TableCell>
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
                      <TableCell>
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
                      <TableCell>
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
      const payload: any = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        roleId: parseInt(data.roleId),
        cityId: parseInt(data.cityId),
        clusterId: parseInt(data.clusterId),
        qualification: data.qualification,
        resumeSource: data.resumeSource,
      };

      if (data.vendorId) payload.vendorId = parseInt(data.vendorId);
      if (data.recruiterId) payload.recruiterId = parseInt(data.recruiterId);
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
        <Tabs defaultValue="single" className="max-w-5xl">
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
                          <SelectItem value="8th - 10th">8th - 10th</SelectItem>
                          <SelectItem value="11th - 12th">11th - 12th</SelectItem>
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
      
      <TabsContent value="bulk">
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
        <Card>
          <CardHeader>
            <CardTitle>All Candidate Applications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : candidates?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  candidates?.map((candidate: any) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="font-mono text-sm">{candidate.applicationId || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.phone}</TableCell>
                      <TableCell>{candidate.roleName || candidate.role?.name}</TableCell>
                      <TableCell>{candidate.cityName || candidate.city?.name}</TableCell>
                      <TableCell>{candidate.clusterName || candidate.cluster?.name}</TableCell>
                      <TableCell className="capitalize">
                        {candidate.resumeSource?.replace('_', ' ') || candidate.sourcingChannel?.replace('_', ' ')}
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
      )}
    </div>
  );
}
