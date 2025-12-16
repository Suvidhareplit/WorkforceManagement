-- Migration to add 'under_classroom_training' and 'under_field_training' options to training tables
-- Run this SQL to update the ENUM types in your database

-- Add 'under_classroom_training' to classroom_training.crt_feedback ENUM
ALTER TABLE classroom_training 
MODIFY COLUMN crt_feedback ENUM(
    'under_classroom_training',
    'fit', 
    'not_fit_crt_rejection', 
    'early_exit', 
    'fit_need_observation'
) NULL;

-- Add 'under_field_training' and 'fit_need_refresher_training' to field_training.ft_feedback ENUM
ALTER TABLE field_training 
MODIFY COLUMN ft_feedback ENUM(
    'under_field_training',
    'fit', 
    'fit_need_refresher_training',
    'not_fit_ft_rejection',
    'ft_absconding'
) NULL;

-- Verify the changes
DESCRIBE classroom_training;
DESCRIBE field_training;
