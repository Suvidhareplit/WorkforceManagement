export function generateRequestId(
  cityCode: string, 
  roleCode: string, 
  clusterCode: string, 
  sequentialNumber: number
): string {
  const paddedNumber = sequentialNumber.toString().padStart(3, '0');
  return `${cityCode}-${roleCode}-${clusterCode}-${paddedNumber}`;
}

export function generateEmployeeId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `EMP${timestamp}${random}`;
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +91-XXXXX-XXXXX for Indian numbers
  if (cleaned.length === 10) {
    return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  return phone;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePAN(pan: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

export function validateAadhar(aadhar: string): boolean {
  const aadharRegex = /^[0-9]{12}$/;
  return aadharRegex.test(aadhar.replace(/\s/g, ''));
}
