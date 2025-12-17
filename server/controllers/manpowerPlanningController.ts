import { Request, Response } from 'express';
import { query } from '../config/db';

// Get manpower planning shifts for a centre
const getCentrePlanning = async (req: Request, res: Response) => {
  try {
    const centreId = parseInt(req.params.centreId);
    
    if (!centreId || isNaN(centreId)) {
      return res.status(400).json({ message: "Invalid centre ID" });
    }

    const result = await query(`
      SELECT 
        cms.id,
        cms.centre_id as centreId,
        cms.designation_id as designationId,
        cms.shift_name as shiftName,
        cms.shift_start_time as shiftStartTime,
        cms.shift_end_time as shiftEndTime,
        cms.required_manpower as requiredManpower,
        d.name as designationName,
        d.code as designationCode,
        r.name as roleName,
        sd.name as subDepartmentName,
        cms.updated_by as updatedBy,
        cms.updated_at as updatedAt,
        u.name as updatedByName
      FROM centre_manpower_shifts cms
      JOIN designations d ON cms.designation_id = d.id
      LEFT JOIN roles r ON d.role_id = r.id
      LEFT JOIN sub_departments sd ON d.sub_department_id = sd.id
      LEFT JOIN users u ON cms.updated_by = u.id
      WHERE cms.centre_id = ?
      ORDER BY d.name, cms.shift_start_time
    `, [centreId]);

    res.json(result.rows || []);
  } catch (error) {
    console.error('Get centre planning error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Save manpower planning shifts for a centre
const saveCentrePlanning = async (req: Request, res: Response) => {
  try {
    // Accept both camelCase and snake_case (frontend converts to snake_case)
    const centreId = req.body.centre_id || req.body.centreId;
    const shifts = req.body.shifts;
    // Get user ID from authenticated session
    const updatedBy = (req as any).user?.id || null;

    if (!centreId || !Array.isArray(shifts)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Delete existing shifts for this centre
    await query('DELETE FROM centre_manpower_shifts WHERE centre_id = ?', [centreId]);

    // Insert new shifts
    for (const shift of shifts) {
      // Accept both camelCase and snake_case for shift fields
      const designationId = shift.designation_id || shift.designationId;
      const shiftName = shift.shift_name || shift.shiftName;
      const shiftStartTime = shift.shift_start_time || shift.shiftStartTime;
      const shiftEndTime = shift.shift_end_time || shift.shiftEndTime;
      const requiredManpower = shift.required_manpower ?? shift.requiredManpower ?? 0;
      
      // Save all shifts
      if (designationId && shiftName && shiftStartTime && shiftEndTime) {
        await query(`
          INSERT INTO centre_manpower_shifts 
          (centre_id, designation_id, shift_name, shift_start_time, shift_end_time, required_manpower, updated_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [centreId, designationId, shiftName, shiftStartTime, shiftEndTime, requiredManpower, updatedBy]);
      }
    }

    res.json({ message: "Manpower planning saved successfully" });
  } catch (error) {
    console.error('Save centre planning error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all manpower planning data (for summary/reports)
const getAllPlanning = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        cmp.id,
        cmp.centre_id as centreId,
        cmp.designation_id as designationId,
        cmp.num_shifts as numShifts,
        cmp.employees_per_shift as employeesPerShift,
        ce.name as centreName,
        cl.name as clusterName,
        cl.id as clusterId,
        ci.name as cityName,
        ci.id as cityId,
        d.name as designationName,
        d.code as designationCode
      FROM centre_manpower_planning cmp
      JOIN centres ce ON cmp.centre_id = ce.id
      JOIN clusters cl ON ce.cluster_id = cl.id
      JOIN cities ci ON cl.city_id = ci.id
      JOIN designations d ON cmp.designation_id = d.id
      ORDER BY ci.name, cl.name, ce.name, d.name
    `);

    res.json(result.rows || []);
  } catch (error) {
    console.error('Get all planning error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get cluster summary (total manpower per cluster with shrinkage)
const getClusterSummary = async (req: Request, res: Response) => {
  try {
    const clusterId = parseInt(req.params.clusterId);
    const defaultShrinkagePercent = 15; // Default 15% shrinkage

    // First, get the city for this cluster and fetch shrinkage from workshop_technician_planning
    const cityResult = await query(`
      SELECT cl.city_id, wtp.shrinkage_percent
      FROM clusters cl
      LEFT JOIN workshop_technician_planning wtp ON cl.city_id = wtp.city_id
      WHERE cl.id = ?
    `, [clusterId]);

    // Use city-specific shrinkage if available, otherwise use default
    const cityRow = (cityResult.rows as any[])?.[0];
    const shrinkagePercent = (cityRow?.shrinkage_percent !== null && cityRow?.shrinkage_percent !== undefined)
      ? parseFloat(cityRow.shrinkage_percent)
      : defaultShrinkagePercent;

    const result = await query(`
      SELECT 
        d.id as designationId,
        d.name as designationName,
        r.name as roleName,
        sd.name as subDepartmentName,
        SUM(cmp.num_shifts) as totalShifts,
        SUM(cmp.num_shifts * cmp.employees_per_shift) as baseManpower
      FROM centre_manpower_planning cmp
      JOIN centres ce ON cmp.centre_id = ce.id
      JOIN designations d ON cmp.designation_id = d.id
      LEFT JOIN roles r ON d.role_id = r.id
      LEFT JOIN sub_departments sd ON d.sub_department_id = sd.id
      WHERE ce.cluster_id = ?
      GROUP BY d.id, d.name, r.name, sd.name
      ORDER BY d.name
    `, [clusterId]);

    const summaryWithShrinkage = (result.rows || []).map((row: any) => {
      const baseManpower = parseInt(row.baseManpower) || 0;
      const shrinkageFactor = 1 - (shrinkagePercent / 100);
      // Formula: Base / (1 - Shrinkage %)
      const totalWithShrinkage = shrinkageFactor > 0 ? Math.ceil(baseManpower / shrinkageFactor) : baseManpower;
      return {
        ...row,
        totalShifts: parseInt(row.totalShifts) || 0,
        baseManpower,
        shrinkagePercent,
        totalWithShrinkage
      };
    });

    res.json(summaryWithShrinkage);
  } catch (error) {
    console.error('Get cluster summary error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all workshop technician planning data
const getWorkshopTechnicianPlanning = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        wtp.id,
        wtp.city_id as cityId,
        c.name as cityName,
        wtp.dau,
        wtp.bikes_in_city as bikesInCity,
        wtp.fault_rate_percent as faultRatePercent,
        wtp.per_mechanic_capacity as perMechanicCapacity,
        wtp.shrinkage_percent as shrinkagePercent,
        wtp.use_dau as useDau,
        wtp.use_bic as useBic,
        wtp.updated_by as updatedBy,
        wtp.updated_at as updatedAt,
        u.name as updatedByName
      FROM workshop_technician_planning wtp
      JOIN cities c ON wtp.city_id = c.id
      LEFT JOIN users u ON wtp.updated_by = u.id
      ORDER BY c.name
    `);

    res.json(result.rows || []);
  } catch (error) {
    console.error('Get workshop technician planning error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Save workshop technician planning for a city
const saveWorkshopTechnicianPlanning = async (req: Request, res: Response) => {
  try {
    // Accept both camelCase and snake_case (frontend converts to snake_case)
    const cityId = req.body.city_id ?? req.body.cityId;
    const dau = req.body.dau ?? 0;
    const bikesInCity = req.body.bikes_in_city ?? req.body.bikesInCity ?? 0;
    const faultRatePercent = req.body.fault_rate_percent ?? req.body.faultRatePercent ?? 0;
    const perMechanicCapacity = req.body.per_mechanic_capacity ?? req.body.perMechanicCapacity ?? 0;
    const shrinkagePercent = req.body.shrinkage_percent ?? req.body.shrinkagePercent ?? 0;
    const useDau = req.body.use_dau ?? req.body.useDau ?? false;
    const useBic = req.body.use_bic ?? req.body.useBic ?? true;

    // Get user ID from authenticated session
    const updatedBy = (req as any).user?.id || null;

    if (!cityId) {
      return res.status(400).json({ message: "City ID is required" });
    }

    // Check if entry exists
    const existing = await query('SELECT id FROM workshop_technician_planning WHERE city_id = ?', [cityId]);
    
    if (existing.rows && existing.rows.length > 0) {
      // Update existing
      await query(`
        UPDATE workshop_technician_planning 
        SET dau = ?, bikes_in_city = ?, fault_rate_percent = ?, 
            per_mechanic_capacity = ?, shrinkage_percent = ?,
            use_dau = ?, use_bic = ?, updated_by = ?, updated_at = NOW()
        WHERE city_id = ?
      `, [dau, bikesInCity, faultRatePercent, 
          perMechanicCapacity, shrinkagePercent,
          useDau ? 1 : 0, useBic ? 1 : 0, updatedBy, cityId]);
    } else {
      // Insert new
      await query(`
        INSERT INTO workshop_technician_planning 
        (city_id, dau, bikes_in_city, fault_rate_percent, per_mechanic_capacity, shrinkage_percent, use_dau, use_bic, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [cityId, dau, bikesInCity, faultRatePercent, 
          perMechanicCapacity, shrinkagePercent,
          useDau ? 1 : 0, useBic ? 1 : 0, updatedBy]);
    }

    res.json({ message: "Workshop technician planning saved successfully" });
  } catch (error) {
    console.error('Save workshop technician planning error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete workshop technician planning for a city
const deleteWorkshopTechnicianPlanning = async (req: Request, res: Response) => {
  try {
    const cityId = parseInt(req.params.cityId);
    
    if (!cityId || isNaN(cityId)) {
      return res.status(400).json({ message: "Invalid city ID" });
    }

    await query('DELETE FROM workshop_technician_planning WHERE city_id = ?', [cityId]);
    
    res.json({ message: "Workshop technician planning deleted successfully" });
  } catch (error) {
    console.error('Delete workshop technician planning error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get bikes per employee analysis data
const getBikesPerEmployeeAnalysis = async (req: Request, res: Response) => {
  try {
    // Check if useBic query param is passed (toggle from frontend)
    const useBic = req.query.useBic === 'true';
    
    // Get bikes data from workshop_technician_planning
    // Use bikes_in_city if useBic toggle is true, otherwise use dau
    const bikesResult = await query(`
      SELECT 
        c.id as cityId,
        c.name as cityName,
        COALESCE(wtp.dau, 0) as dau,
        COALESCE(wtp.bikes_in_city, 0) as bikesInCity
      FROM cities c
      LEFT JOIN workshop_technician_planning wtp ON c.id = wtp.city_id
      ORDER BY c.name
    `);

    // Get employee count per city
    const employeesResult = await query(`
      SELECT 
        city,
        COUNT(*) as employeeCount
      FROM employees
      WHERE working_status = 'working'
      GROUP BY city
    `);

    const bikesData = bikesResult.rows || [];
    const employeesData = employeesResult.rows || [];

    // Create a map of city -> employee count
    const employeeMap: Record<string, number> = {};
    employeesData.forEach((e: any) => {
      employeeMap[e.city] = parseInt(e.employeeCount) || 0;
    });

    // Calculate per-city analysis
    const cityAnalysis = bikesData.map((city: any) => {
      const employees = employeeMap[city.cityName] || 0;
      // Use BIC if toggle is on, otherwise use DAU
      const bikes = useBic ? (parseInt(city.bikesInCity) || 0) : (parseInt(city.dau) || 0);
      const ratio = employees > 0 ? (bikes / employees).toFixed(2) : '0.00';
      return {
        cityId: city.cityId,
        cityName: city.cityName,
        bikes,
        employees,
        ratio: parseFloat(ratio)
      };
    }).filter((c: any) => c.bikes > 0 || c.employees > 0); // Only include cities with data

    // Calculate PAN India totals
    const totalBikes = cityAnalysis.reduce((sum: number, c: any) => sum + c.bikes, 0);
    const totalEmployees = cityAnalysis.reduce((sum: number, c: any) => sum + c.employees, 0);
    const panIndiaRatio = totalEmployees > 0 ? (totalBikes / totalEmployees).toFixed(2) : '0.00';

    res.json({
      panIndia: {
        totalBikes,
        totalEmployees,
        ratio: parseFloat(panIndiaRatio)
      },
      cityWise: cityAnalysis
    });
  } catch (error) {
    console.error('Get bikes per employee analysis error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get city-wise manpower analysis with all designations
const getCityManpowerAnalysis = async (req: Request, res: Response) => {
  try {
    const defaultShrinkagePercent = 15;

    // Get all cities
    const citiesResult = await query(`SELECT id, name FROM cities ORDER BY name`);
    const cities = citiesResult.rows || [];

    // Get all designations
    const designationsResult = await query(`
      SELECT d.id, d.name, d.manpower_planning_required as manpowerPlanningRequired,
             r.name as roleName, sd.name as subDepartmentName
      FROM designations d
      LEFT JOIN roles r ON d.role_id = r.id
      LEFT JOIN sub_departments sd ON d.sub_department_id = sd.id
      ORDER BY d.name
    `);
    const designations = designationsResult.rows || [];

    // Get all centre manpower planning aggregated by city and designation
    const planningResult = await query(`
      SELECT 
        c.id as cityId,
        d.id as designationId,
        SUM(cmp.num_shifts * cmp.employees_per_shift) as baseManpower
      FROM centre_manpower_planning cmp
      JOIN centres ce ON cmp.centre_id = ce.id
      JOIN clusters cl ON ce.cluster_id = cl.id
      JOIN cities c ON cl.city_id = c.id
      JOIN designations d ON cmp.designation_id = d.id
      GROUP BY c.id, d.id
    `);
    const planningData = planningResult.rows || [];

    // Create a map of cityId-designationId -> baseManpower
    const planningMap: Record<string, number> = {};
    planningData.forEach((p: any) => {
      planningMap[`${p.cityId}-${p.designationId}`] = parseInt(p.baseManpower) || 0;
    });

    // Get employee headcount by city and designation
    const headcountResult = await query(`
      SELECT 
        city,
        designation,
        COUNT(*) as headcount
      FROM employees
      WHERE working_status = 'working'
      GROUP BY city, designation
    `);
    const headcountData = headcountResult.rows || [];

    // Create a map of cityName-designationName -> headcount
    const headcountMap: Record<string, number> = {};
    headcountData.forEach((h: any) => {
      headcountMap[`${h.city}-${h.designation}`] = parseInt(h.headcount) || 0;
    });

    // Get workshop technician planning data
    const workshopResult = await query(`
      SELECT 
        wtp.city_id as cityId,
        wtp.dau,
        wtp.bikes_in_city as bikesInCity,
        wtp.fault_rate_percent as faultRatePercent,
        wtp.per_mechanic_capacity as perMechanicCapacity,
        wtp.shrinkage_percent as workshopShrinkagePercent,
        wtp.use_dau as useDau,
        wtp.use_bic as useBic
      FROM workshop_technician_planning wtp
    `);
    const workshopData = workshopResult.rows || [];

    // Create maps for workshop technician requirement and city shrinkage
    // Formula: ((DAU × Outflow %) ÷ Per Mechanic Capacity) / (1 - Shrinkage %)
    const workshopMap: Record<number, number> = {};
    const cityShrinkageMap: Record<number, number> = {};
    workshopData.forEach((w: any) => {
      // Use BIC if useBic is set, otherwise use DAU as default
      const baseValue = w.useBic ? (parseInt(w.bikesInCity) || 0) : (parseInt(w.dau) || 0);
      const outflowPercent = parseFloat(w.faultRatePercent) || 8;
      const perMechanicCapacity = parseInt(w.perMechanicCapacity) || 10;
      const cityShrinkage = parseFloat(w.workshopShrinkagePercent) || 15;
      
      // Store city shrinkage for use in shift-wise calculation
      cityShrinkageMap[w.cityId] = cityShrinkage;
      
      const faultyBikes = baseValue * (outflowPercent / 100);
      const baseTechnicians = faultyBikes / perMechanicCapacity;
      const shrinkageFactor = 1 - (cityShrinkage / 100);
      const withShrinkage = shrinkageFactor > 0 ? Math.ceil(baseTechnicians / shrinkageFactor) : Math.ceil(baseTechnicians);
      workshopMap[w.cityId] = withShrinkage;
    });

    // Workshop technician designation names
    const workshopDesignationNames = ['Workshop Technician', 'Senior Workshop Technician', 'Associate Workshop Technician'];

    // Build city-wise analysis
    const cityAnalysis = cities.map((city: any) => {
      // Get workshop requirement for this city (single value for all workshop technicians combined)
      const workshopReq = workshopMap[city.id] || 0;
      // Get city-specific shrinkage from workshop planning, or use default
      const cityShrinkage = cityShrinkageMap[city.id] || defaultShrinkagePercent;
      
      const designationAnalysis = designations.map((designation: any) => {
        const isWorkshopTechnician = workshopDesignationNames.some(wt => 
          designation.name.toLowerCase().includes(wt.toLowerCase())
        );

        let requiredManpower = null;
        let baseManpower = null;
        let isPlanned = false;
        let planningType = 'Shift Based';

        if (isWorkshopTechnician) {
          // Mark as workshop technician - don't set individual required, frontend will combine
          // Only mark as planned if workshop calculation exists
          if (workshopReq > 0) {
            isPlanned = true;
            planningType = 'As per BIC';
          }
          // requiredManpower stays null - will be set at combined level
        } else {
          // Use regular planning with formula: Base / (1 - Shrinkage %)
          const key = `${city.id}-${designation.id}`;
          baseManpower = planningMap[key] || 0;
          if (baseManpower > 0) {
            const shrinkageFactor = 1 - (cityShrinkage / 100);
            requiredManpower = shrinkageFactor > 0 ? Math.ceil(baseManpower / shrinkageFactor) : Math.ceil(baseManpower);
            isPlanned = true;
          }
        }

        // Get current headcount
        const headcountKey = `${city.name}-${designation.name}`;
        const currentHeadcount = headcountMap[headcountKey] || 0;

        // Calculate surplus/deficit (only for non-workshop designations)
        let surplusDeficit = null;
        if (isPlanned && requiredManpower !== null && !isWorkshopTechnician) {
          surplusDeficit = currentHeadcount - requiredManpower;
        }

        return {
          designationId: designation.id,
          designationName: designation.name,
          roleName: designation.roleName,
          subDepartmentName: designation.subDepartmentName,
          isPlanned,
          planningType,
          baseManpower,
          requiredManpower,
          currentHeadcount,
          surplusDeficit,
          shrinkagePercent: isPlanned && !isWorkshopTechnician ? cityShrinkage : null,
          isWorkshopTechnician
        };
      });
      
      // Add workshop requirement as a separate field for the city
      const workshopTechnicianRequired = workshopReq;

      // Calculate totals for the city
      const plannedDesignations = designationAnalysis.filter((d: any) => d.isPlanned);
      const totalRequired = plannedDesignations.reduce((sum: number, d: any) => sum + (d.requiredManpower || 0), 0);
      const totalHeadcount = designationAnalysis.reduce((sum: number, d: any) => sum + d.currentHeadcount, 0);
      const totalSurplusDeficit = plannedDesignations.length > 0 ? totalHeadcount - totalRequired : null;

      return {
        cityId: city.id,
        cityName: city.name,
        designations: designationAnalysis,
        workshopTechnicianRequired: workshopTechnicianRequired,
        totals: {
          requiredManpower: totalRequired + workshopTechnicianRequired,
          currentHeadcount: totalHeadcount,
          surplusDeficit: totalSurplusDeficit
        }
      };
    });

    // Calculate PAN India totals
    const panIndiaTotals = {
      requiredManpower: cityAnalysis.reduce((sum: number, c: any) => sum + c.totals.requiredManpower, 0),
      currentHeadcount: cityAnalysis.reduce((sum: number, c: any) => sum + c.totals.currentHeadcount, 0),
      surplusDeficit: 0
    };
    panIndiaTotals.surplusDeficit = panIndiaTotals.currentHeadcount - panIndiaTotals.requiredManpower;

    // Aggregate designations for PAN India
    const panIndiaDesignations = designations.map((designation: any) => {
      const cityData = cityAnalysis.map((c: any) => 
        c.designations.find((d: any) => d.designationId === designation.id)
      ).filter(Boolean);

      const isPlanned = cityData.some((d: any) => d.isPlanned);
      const totalRequired = cityData.reduce((sum: number, d: any) => sum + (d.requiredManpower || 0), 0);
      const totalHeadcount = cityData.reduce((sum: number, d: any) => sum + d.currentHeadcount, 0);
      const totalBase = cityData.reduce((sum: number, d: any) => sum + (d.baseManpower || 0), 0);

      // Calculate shrinkage based on formula: Required = Base / (1 - Shrinkage%)
      // Rearranging: Shrinkage% = (1 - Base/Required) * 100
      let calculatedShrinkage = null;
      if (isPlanned && totalBase > 0 && totalRequired > 0) {
        calculatedShrinkage = (1 - (totalBase / totalRequired)) * 100;
      }

      return {
        designationId: designation.id,
        designationName: designation.name,
        roleName: designation.roleName,
        subDepartmentName: designation.subDepartmentName,
        isPlanned,
        planningType: cityData[0]?.planningType || 'Shift Based',
        baseManpower: totalBase,
        requiredManpower: isPlanned ? totalRequired : null,
        currentHeadcount: totalHeadcount,
        surplusDeficit: isPlanned ? totalHeadcount - totalRequired : null,
        shrinkagePercent: calculatedShrinkage
      };
    });

    res.json({
      panIndia: {
        cityName: 'PAN India',
        designations: panIndiaDesignations,
        totals: panIndiaTotals
      },
      cities: cityAnalysis
    });
  } catch (error) {
    console.error('Get city manpower analysis error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const manpowerPlanningController = {
  getCentrePlanning,
  saveCentrePlanning,
  getAllPlanning,
  getClusterSummary,
  getWorkshopTechnicianPlanning,
  saveWorkshopTechnicianPlanning,
  deleteWorkshopTechnicianPlanning,
  getBikesPerEmployeeAnalysis,
  getCityManpowerAnalysis
};
