import { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { getStorage } from '../storage';
const storage = getStorage();

interface BulkCandidateRow {
  name: string;
  phone: string;
  aadharNumber: string;
  email: string;
  designation: string;
  city: string;
  cluster: string;
  qualification: string;
  currentCompany?: string;
  experienceYears?: string;
  currentCtc?: string;
  expectedCtc?: string;
  resumeSource: string;
  sourceName?: string;
}

interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

interface ValidatedRow extends BulkCandidateRow {
  row: number;
  designationId?: number;
  cityId?: number;
  clusterId?: number;
  vendorId?: number;
  recruiterId?: number;
  vendor?: string;
  recruiter?: string;
  referralName?: string;
  errors: ValidationError[];
}

export const validateBulkUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileContent = req.file.buffer.toString();
    
    // Parse CSV
    let records: any[];
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error) {
      return res.status(400).json({ message: 'Invalid CSV format' });
    }

    // Get master data for validation
    const [designations, cities, clusters, vendors, recruiters, hiringRequests] = await Promise.all([
      storage.getDesignations(),
      storage.getCities(),
      storage.getClusters(),
      storage.getVendors(),
      storage.getRecruiters(),
      storage.getHiringRequests({ status: 'open' }),
    ]);

    // Create lookup maps
    const designationMap = new Map(designations.map(d => [d.name.toLowerCase(), d]));
    const cityMap = new Map(cities.map(c => [c.name.toLowerCase(), c]));
    const vendorMap = new Map(vendors.map(v => [v.name.toLowerCase(), v]));
    const recruiterMap = new Map(recruiters.map(r => [r.name.toLowerCase(), r]));
    
    // Group clusters by city
    const clustersByCity = new Map<number, Map<string, any>>();
    clusters.forEach(cluster => {
      if (!clustersByCity.has(cluster.cityId)) {
        clustersByCity.set(cluster.cityId, new Map());
      }
      clustersByCity.get(cluster.cityId)!.set(cluster.name.toLowerCase(), cluster);
    });

    // Create a map of open positions: key = "cityId-clusterId-designationId", value = hiring request
    const openPositionsMap = new Map<string, any>();
    hiringRequests.forEach(request => {
      // Get designation ID from role ID in hiring request
      const designation = designations.find(d => d.roleId === (request.roleId || request.role_id));
      if (designation) {
        const key = `${request.cityId || request.city_id}-${request.clusterId || request.cluster_id}-${designation.id}`;
        openPositionsMap.set(key, request);
      }
    });

    // Valid values
    const validQualifications = ['8th-10th', '11th-12th', 'Graduation', 'B.Tech', 'Diploma', 'ITI'];
    const validResumeSources = ['vendor', 'field_recruiter', 'referral'];

    // Track Aadhar numbers to check for duplicates within the file
    const aadharNumbersInFile = new Map<string, number>();

    // Validate each row
    const validatedRows: ValidatedRow[] = records.map((record, index) => {
      const row: ValidatedRow = {
        row: index + 2, // Account for header row
        name: record.name || '',
        phone: record.phone || '',
        aadharNumber: record.aadharNumber || record.aadhar_number || '',
        email: record.email || '',
        designation: record.designation || '',
        city: record.city || '',
        cluster: record.cluster || '',
        qualification: record.qualification || '',
        currentCompany: record.currentCompany || record.current_company || '',
        experienceYears: record.experienceYears || record.experience_years || '',
        currentCtc: record.currentCtc || record.current_ctc || '',
        expectedCtc: record.expectedCtc || record.expected_ctc || '',
        resumeSource: record.resumeSource || record.resume_source || '',
        sourceName: record.sourceName || record.source_name || '',
        errors: [],
      };

      // Validate required fields
      if (!row.name) {
        row.errors.push({ row: row.row, field: 'name', value: row.name, message: 'Name is required' });
      }

      if (!row.phone || row.phone.length < 10) {
        row.errors.push({ row: row.row, field: 'phone', value: row.phone, message: 'Valid phone number is required' });
      }

      // Validate Aadhar Number (MANDATORY)
      if (!row.aadharNumber) {
        row.errors.push({ row: row.row, field: 'aadharNumber', value: row.aadharNumber, message: 'Aadhar number is required' });
      } else if (!/^\d{12}$/.test(row.aadharNumber)) {
        row.errors.push({ row: row.row, field: 'aadharNumber', value: row.aadharNumber, message: 'Aadhar number must be exactly 12 digits' });
      } else {
        // Check for duplicates within the file
        if (aadharNumbersInFile.has(row.aadharNumber)) {
          row.errors.push({ 
            row: row.row, 
            field: 'aadharNumber', 
            value: row.aadharNumber, 
            message: `Duplicate Aadhar in file (also in row ${aadharNumbersInFile.get(row.aadharNumber)})` 
          });
        } else {
          aadharNumbersInFile.set(row.aadharNumber, row.row);
        }
      }

      if (!row.email || !row.email.includes('@')) {
        row.errors.push({ row: row.row, field: 'email', value: row.email, message: 'Valid email is required' });
      }

      // Validate designation
      const designation = designationMap.get(row.designation.toLowerCase());
      if (!designation) {
        row.errors.push({ row: row.row, field: 'designation', value: row.designation, message: 'Invalid designation. Must match existing designations.' });
      } else {
        row.designationId = designation.id;
      }

      // Validate city
      const city = cityMap.get(row.city.toLowerCase());
      if (!city) {
        row.errors.push({ row: row.row, field: 'city', value: row.city, message: 'Invalid city. Must match existing cities.' });
      } else {
        row.cityId = city.id;

        // Validate cluster (only if city is valid)
        const cityClusterMap = clustersByCity.get(city.id);
        if (cityClusterMap) {
          const cluster = cityClusterMap.get(row.cluster.toLowerCase());
          if (!cluster) {
            row.errors.push({ row: row.row, field: 'cluster', value: row.cluster, message: `Invalid cluster for ${city.name}. Must match existing clusters.` });
          } else {
            row.clusterId = cluster.id;
          }
        }
      }

      // Validate open position (only if city, cluster, and designation are all valid)
      if (row.cityId && row.clusterId && row.designationId) {
        const positionKey = `${row.cityId}-${row.clusterId}-${row.designationId}`;
        const openPosition = openPositionsMap.get(positionKey);
        
        if (!openPosition) {
          row.errors.push({ 
            row: row.row, 
            field: 'position', 
            value: `${row.city} - ${row.cluster} - ${row.designation}`, 
            message: `No open position found for this combination of City, Cluster, and Designation. Please create a hiring request first.` 
          });
        }
      }

      // Validate qualification
      if (!validQualifications.includes(row.qualification)) {
        row.errors.push({ row: row.row, field: 'qualification', value: row.qualification, message: `Invalid qualification. Must be one of: ${validQualifications.join(', ')}` });
      }

      // Validate resume source
      const resumeSource = row.resumeSource.toLowerCase().replace(' ', '_');
      if (!validResumeSources.includes(resumeSource)) {
        row.errors.push({ row: row.row, field: 'resumeSource', value: row.resumeSource, message: `Invalid resume source. Must be one of: vendor, field_recruiter, referral` });
      } else {
        row.resumeSource = resumeSource;

        // Validate source name based on resume source
        if (resumeSource === 'vendor') {
          if (!row.sourceName) {
            row.errors.push({ row: row.row, field: 'sourceName', value: row.sourceName || '', message: 'Vendor name is required when source is vendor' });
          } else {
            const vendor = vendorMap.get(row.sourceName.toLowerCase());
            if (!vendor) {
              row.errors.push({ row: row.row, field: 'sourceName', value: row.sourceName, message: 'Invalid vendor. Must match existing vendors.' });
            } else {
              row.vendorId = vendor.id;
              row.vendor = vendor.name;
            }
          }
        } else if (resumeSource === 'field_recruiter') {
          if (!row.sourceName) {
            row.errors.push({ row: row.row, field: 'sourceName', value: row.sourceName || '', message: 'Recruiter name is required when source is field_recruiter' });
          } else {
            const recruiter = recruiterMap.get(row.sourceName.toLowerCase());
            if (!recruiter) {
              row.errors.push({ row: row.row, field: 'sourceName', value: row.sourceName, message: 'Invalid recruiter. Must match existing recruiters.' });
            } else {
              row.recruiterId = recruiter.id;
              row.recruiter = recruiter.name;
            }
          }
        } else if (resumeSource === 'referral') {
          if (!row.sourceName) {
            row.errors.push({ row: row.row, field: 'sourceName', value: row.sourceName || '', message: 'Referral name is required when source is referral' });
          } else {
            row.referralName = row.sourceName;
          }
        }
      }

      return row;
    });

    res.json({
      totalRows: validatedRows.length,
      validRows: validatedRows.filter(row => row.errors.length === 0).length,
      errorRows: validatedRows.filter(row => row.errors.length > 0).length,
      data: validatedRows,
    });
  } catch (error) {
    console.error('Bulk upload validation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const processBulkUpload = async (req: Request, res: Response) => {
  try {
    const { candidates } = req.body;
    
    if (!candidates || !Array.isArray(candidates)) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    // Debug: log received data
    console.log('Received candidates:', JSON.stringify(candidates, null, 2));

    // Process only valid candidates
    const validCandidates = candidates.filter((c: any) => !c.errors || c.errors.length === 0);
    
    const results = [];
    const errors = [];

    for (const candidate of validCandidates) {
      try {
        // Debug logging
        console.log('Processing candidate full:', candidate);
        console.log('Processing candidate summary:', {
          name: candidate.name,
          resumeSource: candidate.resumeSource,
          sourceName: candidate.sourceName,
          vendor: candidate.vendor,
          recruiter: candidate.recruiter,
          referralName: candidate.referralName
        });
        
        const newCandidate = await storage.createCandidate({
          name: candidate.name,
          phone: candidate.phone,
          aadharNumber: candidate.aadharNumber || candidate.aadhar_number,
          email: candidate.email,
          designation: candidate.designation,
          city: candidate.city,
          cluster: candidate.cluster,
          qualification: candidate.qualification,
          currentCompany: candidate.currentCompany || candidate.current_company,
          experienceYears: candidate.experienceYears || candidate.experience_years,
          currentCtc: candidate.currentCtc || candidate.current_ctc,
          expectedCtc: candidate.expectedCtc || candidate.expected_ctc,
          resumeSource: candidate.resume_source || candidate.resumeSource,
          vendor: candidate.vendor,
          recruiter: candidate.recruiter,
          referralName: candidate.referral_name || candidate.referralName,
        });
        results.push(newCandidate);
      } catch (error) {
        errors.push({
          row: candidate.row,
          message: error instanceof Error ? error.message : 'Failed to create candidate',
        });
      }
    }

    res.json({
      success: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('Bulk upload processing error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};