-- Migration to add Group DOJ and Designation columns to onboarding table
-- These fields will capture migration details for employees transferred from vendors/other entities

-- Add Group DOJ columns to onboarding table
ALTER TABLE onboarding 
ADD COLUMN group_doj DATE NULL COMMENT 'Original DOJ with previous entity for migrated employees',
ADD COLUMN group_doj_reason ENUM('absorption_from_vendor', 'entity_transfer') NULL COMMENT 'Reason for Group DOJ - absorption from vendor or entity transfer',
ADD COLUMN group_doj_vendor_name VARCHAR(255) NULL COMMENT 'Vendor name if group_doj_reason is absorption_from_vendor',
ADD COLUMN designation VARCHAR(255) NULL COMMENT 'Employee designation';

-- Add indexes for better performance
ALTER TABLE onboarding ADD INDEX idx_onboarding_group_doj (group_doj);
ALTER TABLE onboarding ADD INDEX idx_onboarding_group_doj_reason (group_doj_reason);
ALTER TABLE onboarding ADD INDEX idx_onboarding_designation (designation(100));
