import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { VOLUNTARY_EXIT_REASONS, INVOLUNTARY_EXIT_REASONS } from '@/constants/exitReasons';
import { cn } from '@/lib/utils';

interface InitiateExitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any;
  onSubmit: (data: ExitData) => void;
}

export interface ExitData {
  exitType: 'voluntary' | 'involuntary' | 'absconding';
  exitReason?: string;
  discussionWithEmployee: 'yes' | 'no';
  discussionSummary?: string;
  terminationNoticeDate: Date;
  lastWorkingDay: Date;
  noticePeriodServed: 'yes' | 'no';
  okayToRehire: 'yes' | 'no';
  abscondingLetterSent?: 'yes' | 'no';
  additionalComments?: string;
}

export function InitiateExitDialog({ open, onOpenChange, employee, onSubmit }: InitiateExitDialogProps) {
  const [exitInitiationType, setExitInitiationType] = useState<'employee_resign' | 'company_terminate' | 'absconding'>('employee_resign');
  const [exitType, setExitType] = useState<'voluntary' | 'involuntary' | 'absconding'>('voluntary');
  const [exitReason, setExitReason] = useState<string>('');
  const [discussionWithEmployee, setDiscussionWithEmployee] = useState<'yes' | 'no'>('yes');
  const [discussionSummary, setDiscussionSummary] = useState<string>('');
  const [terminationNoticeDate, setTerminationNoticeDate] = useState<Date>(new Date());
  const [lastWorkingDayType, setLastWorkingDayType] = useState<'original' | 'other'>('original');
  const [lastWorkingDay, setLastWorkingDay] = useState<Date>(addDays(new Date(), 30));
  const [okayToRehire, setOkayToRehire] = useState<'yes' | 'no'>('yes');
  const [abscondingLetterSent, setAbscondingLetterSent] = useState<'yes' | 'no'>('no');
  const [additionalComments, setAdditionalComments] = useState<string>('');

  // Update exit type based on initiation type
  useEffect(() => {
    switch (exitInitiationType) {
      case 'employee_resign':
        setExitType('voluntary');
        break;
      case 'company_terminate':
        setExitType('involuntary');
        break;
      case 'absconding':
        setExitType('absconding');
        break;
    }
    setExitReason(''); // Reset reason when type changes
  }, [exitInitiationType]);

  // Update last working day when type changes
  useEffect(() => {
    if (lastWorkingDayType === 'original') {
      setLastWorkingDay(addDays(new Date(), 30));
    }
  }, [lastWorkingDayType]);

  const handleSubmit = () => {
    const data: ExitData = {
      exitType,
      exitReason: exitType !== 'absconding' ? exitReason : undefined,
      discussionWithEmployee,
      discussionSummary,
      terminationNoticeDate,
      lastWorkingDay,
      noticePeriodServed: lastWorkingDayType === 'original' ? 'yes' : 'no',
      okayToRehire,
      abscondingLetterSent: exitType === 'absconding' ? abscondingLetterSent : undefined,
      additionalComments,
    };
    onSubmit(data);
  };

  const getExitReasons = () => {
    if (exitType === 'voluntary') return VOLUNTARY_EXIT_REASONS;
    if (exitType === 'involuntary') return INVOLUNTARY_EXIT_REASONS;
    return [];
  };

  const getExitTypeLabel = () => {
    switch (exitType) {
      case 'voluntary':
        return 'Voluntary';
      case 'involuntary':
        return 'Involuntary';
      case 'absconding':
        return 'Absconding';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Initiate exit - {employee?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Employee Info Card */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold">
              {employee?.name?.charAt(0).toUpperCase() || 'E'}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">{employee?.name}</h3>
              <p className="text-sm text-gray-600">{employee?.role || employee?.designation}</p>
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Worker type</p>
              <p className="font-medium">{employee?.employmentType || employee?.employment_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Department</p>
              <p className="font-medium">{employee?.departmentName || employee?.department_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Date of joining</p>
              <p className="font-medium">
                {employee?.dateOfJoining || employee?.date_of_joining 
                  ? format(new Date(employee.dateOfJoining || employee.date_of_joining), 'dd MMM yyyy')
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Exit Initiation Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">What is the reason for initiating this exit?</Label>
            <RadioGroup value={exitInitiationType} onValueChange={(value: any) => setExitInitiationType(value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="employee_resign" id="employee_resign" />
                <Label htmlFor="employee_resign" className="font-normal cursor-pointer">
                  Employee wants to resign
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="company_terminate" id="company_terminate" />
                <Label htmlFor="company_terminate" className="font-normal cursor-pointer">
                  Company decides to terminate
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="absconding" id="absconding" />
                <Label htmlFor="absconding" className="font-normal cursor-pointer">
                  Absconding
                </Label>
              </div>
            </RadioGroup>

            {/* Show exit type label */}
            {exitType && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Exit Type:</span> {getExitTypeLabel()}
                </p>
              </div>
            )}
          </div>

          {/* Discussion with Employee */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Did you have discussion with employee regarding this?</Label>
            <RadioGroup value={discussionWithEmployee} onValueChange={(value: any) => setDiscussionWithEmployee(value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="discussion_yes" />
                <Label htmlFor="discussion_yes" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="discussion_no" />
                <Label htmlFor="discussion_no" className="font-normal cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Discussion Summary */}
          <div className="space-y-2">
            <Label htmlFor="discussion_summary" className="text-base font-semibold">Discussion Summary</Label>
            <Textarea
              id="discussion_summary"
              placeholder="Type here"
              value={discussionSummary}
              onChange={(e) => setDiscussionSummary(e.target.value)}
              className="min-h-[100px] text-base"
            />
          </div>

          {/* Exit Reason - for Voluntary and Involuntary */}
          {exitType !== 'absconding' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {exitType === 'voluntary' ? 'Reason for resignation' : 'Reason for termination'}
                </Label>
                <Select value={exitReason} onValueChange={setExitReason}>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Select Reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {getExitReasons().map((reason) => (
                      <SelectItem key={reason} value={reason} className="text-base">
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {exitType === 'voluntary' ? 'Resignation' : 'Termination'} notice date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-base",
                        !terminationNoticeDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {terminationNoticeDate ? format(terminationNoticeDate, 'dd MMM yyyy') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={terminationNoticeDate}
                      onSelect={(date) => date && setTerminationNoticeDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Absconding Letter Sent - for Absconding only */}
          {exitType === 'absconding' && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Absconding letter sent?</Label>
              <RadioGroup value={abscondingLetterSent} onValueChange={(value: any) => setAbscondingLetterSent(value)}>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="yes" id="absconding_yes" />
                  <Label htmlFor="absconding_yes" className="font-normal cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="no" id="absconding_no" />
                  <Label htmlFor="absconding_no" className="font-normal cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Recommended Last Working Day */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Recommended last working day?</Label>
            <RadioGroup value={lastWorkingDayType} onValueChange={(value: any) => setLastWorkingDayType(value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="original" id="original_notice" />
                <Label htmlFor="original_notice" className="font-normal cursor-pointer">
                  Original notice period - {format(addDays(new Date(), 30), 'dd MMM yyyy')} (30 days from today)
                </Label>
              </div>
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="other" id="other_date" className="mt-1" />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="other_date" className="font-normal cursor-pointer">Other:</Label>
                  {lastWorkingDayType === 'other' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal text-base",
                            !lastWorkingDay && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {lastWorkingDay ? format(lastWorkingDay, 'dd MMM yyyy') : <span>Select a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={lastWorkingDay}
                          onSelect={(date) => date && setLastWorkingDay(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Rehire Options */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Mark employee as</Label>
            <RadioGroup value={okayToRehire} onValueChange={(value: any) => setOkayToRehire(value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="rehire_yes" />
                <Label htmlFor="rehire_yes" className="font-normal cursor-pointer">Ok to rehire</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="rehire_no" />
                <Label htmlFor="rehire_no" className="font-normal cursor-pointer">Not okay to rehire</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Info Banner */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-3">
            <InfoIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Submitting this will initiate an approval chain for approving this termination
            </p>
          </div>

          {/* Additional Comments */}
          <div className="space-y-2">
            <Label htmlFor="additional_comments" className="text-base font-semibold">Additional comments</Label>
            <Textarea
              id="additional_comments"
              placeholder="Type here"
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              className="min-h-[100px] text-base"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-base px-6">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-red-500 hover:bg-red-600 text-base px-6">
            Initiate exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
