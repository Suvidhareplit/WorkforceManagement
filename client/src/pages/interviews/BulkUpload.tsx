import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

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
    field: string;
    message: string;
  }>;
  roleId?: number;
  cityId?: number;
  clusterId?: number;
  vendorId?: number;
  recruiterId?: number;
}

export default function BulkUpload() {
  const { toast } = useToast();
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

  // Fetch master data
  const { data: roles } = useQuery({ queryKey: ["/api/master-data/role"] });
  const { data: cities } = useQuery({ queryKey: ["/api/master-data/city"] });
  const { data: clusters } = useQuery({ queryKey: ["/api/master-data/cluster"] });
  const { data: vendors } = useQuery({ queryKey: ["/api/master-data/vendor"] });
  const { data: recruiters } = useQuery({ queryKey: ["/api/master-data/recruiter"] });

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
        body: formData,
      });

      setValidatedData(response.data);
      setSummary({
        totalRows: response.totalRows,
        validRows: response.validRows,
        errorRows: response.errorRows,
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
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to validate file. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateRow = (index: number, field: string, value: string) => {
    const updatedData = [...validatedData];
    const row = updatedData[index];
    
    // Update the field
    (row as any)[field] = value;
    
    // Clear the error for this field
    row.errors = row.errors.filter(e => e.field !== field);
    
    // Re-validate the field
    validateField(row, field);
    
    setValidatedData(updatedData);
  };

  const validateField = (row: ValidatedRow, field: string) => {
    const errors = row.errors || [];
    
    switch (field) {
      case 'role':
        const role = roles?.find((r: any) => r.name.toLowerCase() === row.role.toLowerCase());
        if (!role) {
          errors.push({ field: 'role', message: 'Invalid role' });
        } else {
          row.roleId = role.id;
        }
        break;
        
      case 'city':
        const city = cities?.find((c: any) => c.name.toLowerCase() === row.city.toLowerCase());
        if (!city) {
          errors.push({ field: 'city', message: 'Invalid city' });
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
          errors.push({ field: 'cluster', message: 'Invalid cluster for selected city' });
        } else {
          row.clusterId = cityCluster.id;
        }
        break;
        
      case 'qualification':
        if (!qualifications.includes(row.qualification)) {
          errors.push({ field: 'qualification', message: 'Invalid qualification' });
        }
        break;
        
      case 'resumeSource':
        if (!resumeSources.includes(row.resumeSource)) {
          errors.push({ field: 'resumeSource', message: 'Invalid resume source' });
        }
        break;
        
      case 'sourceName':
        if (row.resumeSource === 'vendor') {
          const vendor = vendors?.find((v: any) => v.name.toLowerCase() === row.sourceName?.toLowerCase());
          if (!vendor) {
            errors.push({ field: 'sourceName', message: 'Invalid vendor' });
          } else {
            row.vendorId = vendor.id;
          }
        } else if (row.resumeSource === 'field_recruiter') {
          const recruiter = recruiters?.find((r: any) => r.name.toLowerCase() === row.sourceName?.toLowerCase());
          if (!recruiter) {
            errors.push({ field: 'sourceName', message: 'Invalid recruiter' });
          } else {
            row.recruiterId = recruiter.id;
          }
        }
        break;
    }
    
    row.errors = errors;
  };

  const handleSubmit = async () => {
    const validRows = validatedData.filter(row => row.errors.length === 0);
    
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ candidates: validRows }),
      });

      toast({
        title: "Upload successful",
        description: `Successfully created ${response.success} candidates. ${response.failed > 0 ? `Failed: ${response.failed}` : ''}`,
      });

      // Clear data after successful upload
      setFile(null);
      setValidatedData([]);
      setSummary(null);
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
      "Jane Smith,9876543211,jane@example.com,Quality Control Associate,Mumbai,Andheri,Diploma,field_recruiter,John Recruiter\n" +
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
    return row.errors.find(e => e.field === field);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Candidate Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                disabled={isProcessing || summary?.errorRows > 0}
              >
                {isProcessing ? "Processing..." : `Submit ${summary?.validRows} Valid Rows`}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Status</TableHead>
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
                    <TableRow key={index} className={row.errors.length > 0 ? "bg-red-50" : "bg-green-50"}>
                      <TableCell>{row.row}</TableCell>
                      <TableCell>
                        {row.errors.length > 0 ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === index ? (
                          <Input
                            value={row.name}
                            onChange={(e) => handleUpdateRow(index, 'name', e.target.value)}
                            onBlur={() => setEditingRow(null)}
                            className={getFieldError(row, 'name') ? "border-red-500" : ""}
                          />
                        ) : (
                          <div onClick={() => setEditingRow(index)} className="cursor-pointer">
                            {row.name}
                            {getFieldError(row, 'name') && (
                              <div className="text-xs text-red-500">{getFieldError(row, 'name')?.message}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === index ? (
                          <Input
                            value={row.phone}
                            onChange={(e) => handleUpdateRow(index, 'phone', e.target.value)}
                            onBlur={() => setEditingRow(null)}
                            className={getFieldError(row, 'phone') ? "border-red-500" : ""}
                          />
                        ) : (
                          <div onClick={() => setEditingRow(index)} className="cursor-pointer">
                            {row.phone}
                            {getFieldError(row, 'phone') && (
                              <div className="text-xs text-red-500">{getFieldError(row, 'phone')?.message}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === index ? (
                          <Input
                            value={row.email}
                            onChange={(e) => handleUpdateRow(index, 'email', e.target.value)}
                            onBlur={() => setEditingRow(null)}
                            className={getFieldError(row, 'email') ? "border-red-500" : ""}
                          />
                        ) : (
                          <div onClick={() => setEditingRow(index)} className="cursor-pointer">
                            {row.email}
                            {getFieldError(row, 'email') && (
                              <div className="text-xs text-red-500">{getFieldError(row, 'email')?.message}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === index ? (
                          <Select
                            value={row.role}
                            onValueChange={(value) => handleUpdateRow(index, 'role', value)}
                          >
                            <SelectTrigger className={getFieldError(row, 'role') ? "border-red-500" : ""}>
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
                        ) : (
                          <div onClick={() => setEditingRow(index)} className="cursor-pointer">
                            {row.role}
                            {getFieldError(row, 'role') && (
                              <div className="text-xs text-red-500">{getFieldError(row, 'role')?.message}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === index ? (
                          <Select
                            value={row.city}
                            onValueChange={(value) => handleUpdateRow(index, 'city', value)}
                          >
                            <SelectTrigger className={getFieldError(row, 'city') ? "border-red-500" : ""}>
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
                        ) : (
                          <div onClick={() => setEditingRow(index)} className="cursor-pointer">
                            {row.city}
                            {getFieldError(row, 'city') && (
                              <div className="text-xs text-red-500">{getFieldError(row, 'city')?.message}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === index ? (
                          <Select
                            value={row.cluster}
                            onValueChange={(value) => handleUpdateRow(index, 'cluster', value)}
                          >
                            <SelectTrigger className={getFieldError(row, 'cluster') ? "border-red-500" : ""}>
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
                        ) : (
                          <div onClick={() => setEditingRow(index)} className="cursor-pointer">
                            {row.cluster}
                            {getFieldError(row, 'cluster') && (
                              <div className="text-xs text-red-500">{getFieldError(row, 'cluster')?.message}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === index ? (
                          <Select
                            value={row.qualification}
                            onValueChange={(value) => handleUpdateRow(index, 'qualification', value)}
                          >
                            <SelectTrigger className={getFieldError(row, 'qualification') ? "border-red-500" : ""}>
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
                        ) : (
                          <div onClick={() => setEditingRow(index)} className="cursor-pointer">
                            {row.qualification}
                            {getFieldError(row, 'qualification') && (
                              <div className="text-xs text-red-500">{getFieldError(row, 'qualification')?.message}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === index ? (
                          <Select
                            value={row.resumeSource}
                            onValueChange={(value) => handleUpdateRow(index, 'resumeSource', value)}
                          >
                            <SelectTrigger className={getFieldError(row, 'resumeSource') ? "border-red-500" : ""}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vendor">Vendor</SelectItem>
                              <SelectItem value="field_recruiter">Field Recruiter</SelectItem>
                              <SelectItem value="referral">Referral</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div onClick={() => setEditingRow(index)} className="cursor-pointer">
                            {row.resumeSource}
                            {getFieldError(row, 'resumeSource') && (
                              <div className="text-xs text-red-500">{getFieldError(row, 'resumeSource')?.message}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === index ? (
                          row.resumeSource === 'vendor' ? (
                            <Select
                              value={row.sourceName || ''}
                              onValueChange={(value) => handleUpdateRow(index, 'sourceName', value)}
                            >
                              <SelectTrigger className={getFieldError(row, 'sourceName') ? "border-red-500" : ""}>
                                <SelectValue />
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
                              <SelectTrigger className={getFieldError(row, 'sourceName') ? "border-red-500" : ""}>
                                <SelectValue />
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
                              onBlur={() => setEditingRow(null)}
                              className={getFieldError(row, 'sourceName') ? "border-red-500" : ""}
                            />
                          )
                        ) : (
                          <div onClick={() => setEditingRow(index)} className="cursor-pointer">
                            {row.sourceName}
                            {getFieldError(row, 'sourceName') && (
                              <div className="text-xs text-red-500">{getFieldError(row, 'sourceName')?.message}</div>
                            )}
                          </div>
                        )}
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