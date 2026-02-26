export interface Dependent {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  relationship: string;
  ssn_last_four: string;
  months_lived_with_you: number;
}

export interface W2Employer {
  id: string;
  employer_name: string;
  wages: string;
  federal_tax_withheld: string;
  state_tax_withheld: string;
}

export interface Ten99Source {
  id: string;
  payer_name: string;
  type: string; // 1099-MISC, 1099-NEC, 1099-INT, 1099-DIV, 1099-R, 1099-G
  amount: string;
}

export interface SelfEmploymentDetails {
  business_name: string;
  business_type: string;
  ein: string;
  gross_income: string;
  total_expenses: string;
}

export interface OtherIncome {
  id: string;
  type: string;
  description: string;
  amount: string;
}

export interface CharitableDonation {
  id: string;
  organization: string;
  amount: string;
  type: string; // cash, property, stock
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  size: number;
  uploadedAt: string;
}

export interface IntakeFormData {
  // Step 1: Personal Info
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  ssn: string;
  date_of_birth: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;

  // Step 2: Filing Status & Dependents
  filing_status: string;
  spouse_first_name: string;
  spouse_last_name: string;
  spouse_ssn: string;
  spouse_dob: string;
  dependents: Dependent[];

  // Step 3: Income Sources
  has_w2: boolean;
  w2_employers: W2Employer[];
  has_1099: boolean;
  ten99_sources: Ten99Source[];
  has_self_employment: boolean;
  self_employment_details: SelfEmploymentDetails;
  has_other_income: boolean;
  other_income_details: OtherIncome[];
  uploaded_documents: UploadedDocument[];

  // Step 4: Deductions
  has_mortgage_interest: boolean;
  mortgage_interest_amount: string;
  has_property_tax: boolean;
  property_tax_amount: string;
  has_medical_expenses: boolean;
  medical_expenses_amount: string;
  has_charitable_donations: boolean;
  charitable_donations_amount: string;
  charitable_donations_details: CharitableDonation[];
  has_student_loan_interest: boolean;
  student_loan_interest_amount: string;
  has_educator_expenses: boolean;
  educator_expenses_amount: string;
  has_home_office: boolean;
  home_office_sqft: string;
  has_retirement_contributions: boolean;
  retirement_contributions_amount: string;
  retirement_account_type: string;
  deduction_preference: string;
  additional_notes: string;

  // Meta
  referral_source: string;
  consent_given: boolean;
}

export const INITIAL_FORM_DATA: IntakeFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  ssn: '',
  date_of_birth: '',
  street_address: '',
  city: '',
  state: '',
  zip_code: '',

  filing_status: '',
  spouse_first_name: '',
  spouse_last_name: '',
  spouse_ssn: '',
  spouse_dob: '',
  dependents: [],

  has_w2: false,
  w2_employers: [],
  has_1099: false,
  ten99_sources: [],
  has_self_employment: false,
  self_employment_details: {
    business_name: '',
    business_type: '',
    ein: '',
    gross_income: '',
    total_expenses: '',
  },
  has_other_income: false,
  other_income_details: [],
  uploaded_documents: [],

  has_mortgage_interest: false,
  mortgage_interest_amount: '',
  has_property_tax: false,
  property_tax_amount: '',
  has_medical_expenses: false,
  medical_expenses_amount: '',
  has_charitable_donations: false,
  charitable_donations_amount: '',
  charitable_donations_details: [],
  has_student_loan_interest: false,
  student_loan_interest_amount: '',
  has_educator_expenses: false,
  educator_expenses_amount: '',
  has_home_office: false,
  home_office_sqft: '',
  has_retirement_contributions: false,
  retirement_contributions_amount: '',
  retirement_account_type: '',
  deduction_preference: 'unsure',
  additional_notes: '',

  referral_source: '',
  consent_given: false,
};

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
];

export const FILING_STATUSES = [
  { value: 'single', label: 'Single' },
  { value: 'married_jointly', label: 'Married Filing Jointly' },
  { value: 'married_separately', label: 'Married Filing Separately' },
  { value: 'head_of_household', label: 'Head of Household' },
  { value: 'qualifying_widow', label: 'Qualifying Surviving Spouse' },
];

export const TEN99_TYPES = [
  '1099-NEC', '1099-MISC', '1099-INT', '1099-DIV', '1099-R', '1099-G', '1099-B', '1099-S', '1099-K', 'Other'
];

export const RELATIONSHIP_TYPES = [
  'Son', 'Daughter', 'Stepchild', 'Foster Child', 'Sibling', 'Parent', 'Grandchild', 'Niece/Nephew', 'Other'
];
