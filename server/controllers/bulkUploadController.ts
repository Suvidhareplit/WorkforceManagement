import { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { storage } from '../storage-sql.js';

interface BulkCandidateRow {
  name: string;
  phone: string;
  email: string;
  role: string;
  city: string;
  cluster: string;
  qualification: string;
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
  roleId?: number;
  cityId?: number;
  clusterId?: number;
  vendorId?: number;
  recruiterId?: number;
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
    const [roles, cities, clusters, vendors, recruiters] = await Promise.all([
      storage.getRoles(),
      storage.getCities(),
      storage.getClusters(),
      storage.getVendors(),
      storage.getRecruiters(),
    ]);

    // Create lookup maps
    const roleMap = new Map(roles.map(r => [r.name.toLowerCase(), r]));
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

    // Valid values
    const validQualifications = ['8th-10th', '11th-12th', 'Graduation', 'B.Tech', 'Diploma', 'ITI'];
    const validResumeSources = ['vendor', 'field_recruiter', 'referral'];

    // Validate each row
    const validatedRows: ValidatedRow[] = records.map((record, index) => {
      const row: ValidatedRow = {
        row: index + 2, // Account for header row
        name: record.name || '',
        phone: record.phone || '',
        email: record.email || '',
        role: record.role || '',
        city: record.city || '',
        cluster: record.cluster || '',
        qualification: record.qualification || '',
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

      if (!row.email || !row.email.includes('@')) {
        row.errors.push({ row: row.row, field: 'email', value: row.email, message: 'Valid email is required' });
      }

      // Validate role
      const role = roleMap.get(row.role.toLowerCase());
      if (!role) {
        row.errors.push({ row: row.row, field: 'role', value: row.role, message: 'Invalid role. Must match existing roles.' });
      } else {
        row.roleId = role.id;
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
            }
          }
        } else if (resumeSource === 'referral') {
          if (!row.sourceName) {
            row.errors.push({ row: row.row, field: 'sourceName', value: row.sourceName || '', message: 'Referral name is required when source is referral' });
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

    // Process only valid candidates
    const validCandidates = candidates.filter((c: ValidatedRow) => c.errors.length === 0);
    
    const results = [];
    const errors = [];

    for (const candidate of validCandidates) {
      try {
        const newCandidate = await storage.createCandidate({
          name: candidate.name,
          phone: candidate.phone,
          email: candidate.email,
          role: candidate.role,
          city: candidate.city,
          cluster: candidate.cluster,
          qualification: candidate.qualification,
          resumeSource: candidate.resumeSource,
          vendor: candidate.resumeSource === 'vendor' ? candidate.sourceName : null,
          recruiter: candidate.resumeSource === 'field_recruiter' ? candidate.sourceName : null,
          referralName: candidate.resumeSource === 'referral' ? candidate.sourceName : undefined,
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