--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: candidate_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.candidate_status AS ENUM (
    'applied',
    'prescreening',
    'technical',
    'selected',
    'rejected',
    'offered',
    'joined'
);


ALTER TYPE public.candidate_status OWNER TO neondb_owner;

--
-- Name: employee_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.employee_status AS ENUM (
    'active',
    'inactive',
    'terminated',
    'resigned'
);


ALTER TYPE public.employee_status OWNER TO neondb_owner;

--
-- Name: exit_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.exit_type AS ENUM (
    'voluntary',
    'termination',
    'absconding'
);


ALTER TYPE public.exit_type OWNER TO neondb_owner;

--
-- Name: priority; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.priority AS ENUM (
    'P0',
    'P1',
    'P2',
    'P3'
);


ALTER TYPE public.priority OWNER TO neondb_owner;

--
-- Name: request_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.request_status AS ENUM (
    'open',
    'closed',
    'called_off'
);


ALTER TYPE public.request_status OWNER TO neondb_owner;

--
-- Name: request_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.request_type AS ENUM (
    'replacement',
    'fresh'
);


ALTER TYPE public.request_type OWNER TO neondb_owner;

--
-- Name: training_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.training_status AS ENUM (
    'assigned',
    'in_progress',
    'completed',
    'dropped_out'
);


ALTER TYPE public.training_status OWNER TO neondb_owner;

--
-- Name: training_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.training_type AS ENUM (
    'induction',
    'classroom',
    'field'
);


ALTER TYPE public.training_type OWNER TO neondb_owner;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'hr',
    'recruiter',
    'manager',
    'trainer'
);


ALTER TYPE public.user_role OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: candidates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.candidates (
    id integer NOT NULL,
    name text NOT NULL,
    phone character varying(10) NOT NULL,
    email text,
    role_id integer NOT NULL,
    city_id integer NOT NULL,
    cluster_id integer NOT NULL,
    qualification text,
    resume_source text,
    vendor_id integer,
    recruiter_id integer,
    referral_name text,
    status public.candidate_status DEFAULT 'applied'::public.candidate_status,
    prescreening_approved boolean,
    prescreening_notes text,
    screening_score numeric,
    benchmark_met boolean,
    technical_status text,
    technical_notes text,
    date_of_joining timestamp without time zone,
    gross_salary numeric,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.candidates OWNER TO neondb_owner;

--
-- Name: candidates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.candidates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidates_id_seq OWNER TO neondb_owner;

--
-- Name: candidates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.candidates_id_seq OWNED BY public.candidates.id;


--
-- Name: cities; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cities (
    id integer NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cities OWNER TO neondb_owner;

--
-- Name: cities_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.cities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cities_id_seq OWNER TO neondb_owner;

--
-- Name: cities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.cities_id_seq OWNED BY public.cities.id;


--
-- Name: clusters; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.clusters (
    id integer NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    city_id integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.clusters OWNER TO neondb_owner;

--
-- Name: clusters_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.clusters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clusters_id_seq OWNER TO neondb_owner;

--
-- Name: clusters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.clusters_id_seq OWNED BY public.clusters.id;


--
-- Name: employee_actions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.employee_actions (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    action_type text NOT NULL,
    description text,
    requested_by integer NOT NULL,
    approved_by integer,
    status text DEFAULT 'pending'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.employee_actions OWNER TO neondb_owner;

--
-- Name: employee_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.employee_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_actions_id_seq OWNER TO neondb_owner;

--
-- Name: employee_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.employee_actions_id_seq OWNED BY public.employee_actions.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    candidate_id integer,
    employee_id text NOT NULL,
    personal_details text,
    contact_details text,
    employment_details text,
    govt_ids text,
    bank_details text,
    documents text,
    status public.employee_status DEFAULT 'active'::public.employee_status,
    join_date timestamp without time zone,
    exit_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.employees OWNER TO neondb_owner;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO neondb_owner;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: exit_records; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.exit_records (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    exit_type public.exit_type NOT NULL,
    exit_date timestamp without time zone NOT NULL,
    reason text,
    exit_interview text,
    final_settlement numeric,
    handover_completed boolean DEFAULT false,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.exit_records OWNER TO neondb_owner;

--
-- Name: exit_records_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.exit_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exit_records_id_seq OWNER TO neondb_owner;

--
-- Name: exit_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.exit_records_id_seq OWNED BY public.exit_records.id;


--
-- Name: hiring_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.hiring_requests (
    id integer NOT NULL,
    request_id text NOT NULL,
    city_id integer NOT NULL,
    cluster_id integer NOT NULL,
    role_id integer NOT NULL,
    number_of_positions integer NOT NULL,
    priority public.priority NOT NULL,
    request_type public.request_type NOT NULL,
    status public.request_status DEFAULT 'open'::public.request_status,
    notes text,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.hiring_requests OWNER TO neondb_owner;

--
-- Name: hiring_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.hiring_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hiring_requests_id_seq OWNER TO neondb_owner;

--
-- Name: hiring_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.hiring_requests_id_seq OWNED BY public.hiring_requests.id;


--
-- Name: recruiter_incentives; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.recruiter_incentives (
    id integer NOT NULL,
    recruiter_id integer NOT NULL,
    candidate_id integer NOT NULL,
    incentive_amount numeric NOT NULL,
    calculated_date timestamp without time zone NOT NULL,
    payment_status text DEFAULT 'pending'::text,
    payment_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.recruiter_incentives OWNER TO neondb_owner;

--
-- Name: recruiter_incentives_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.recruiter_incentives_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recruiter_incentives_id_seq OWNER TO neondb_owner;

--
-- Name: recruiter_incentives_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.recruiter_incentives_id_seq OWNED BY public.recruiter_incentives.id;


--
-- Name: recruiters; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.recruiters (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone character varying(10),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    city_id integer NOT NULL
);


ALTER TABLE public.recruiters OWNER TO neondb_owner;

--
-- Name: recruiters_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.recruiters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recruiters_id_seq OWNER TO neondb_owner;

--
-- Name: recruiters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.recruiters_id_seq OWNED BY public.recruiters.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    job_description_file text
);


ALTER TABLE public.roles OWNER TO neondb_owner;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO neondb_owner;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: training_attendance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.training_attendance (
    id integer NOT NULL,
    training_session_id integer NOT NULL,
    date timestamp without time zone NOT NULL,
    present boolean DEFAULT false,
    notes text,
    marked_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.training_attendance OWNER TO neondb_owner;

--
-- Name: training_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.training_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.training_attendance_id_seq OWNER TO neondb_owner;

--
-- Name: training_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.training_attendance_id_seq OWNED BY public.training_attendance.id;


--
-- Name: training_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.training_sessions (
    id integer NOT NULL,
    candidate_id integer NOT NULL,
    training_type public.training_type NOT NULL,
    status public.training_status DEFAULT 'assigned'::public.training_status,
    trainer_id integer,
    manager_id integer,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    duration integer,
    attendance_marked boolean DEFAULT false,
    fit_status text,
    comments text,
    dropout_reason text,
    fte_confirmed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.training_sessions OWNER TO neondb_owner;

--
-- Name: training_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.training_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.training_sessions_id_seq OWNER TO neondb_owner;

--
-- Name: training_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.training_sessions_id_seq OWNED BY public.training_sessions.id;


--
-- Name: user_audit_trail; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_audit_trail (
    id integer NOT NULL,
    user_id integer NOT NULL,
    action text NOT NULL,
    changed_by integer NOT NULL,
    old_values json,
    new_values json,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_audit_trail OWNER TO neondb_owner;

--
-- Name: user_audit_trail_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_audit_trail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_audit_trail_id_seq OWNER TO neondb_owner;

--
-- Name: user_audit_trail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_audit_trail_id_seq OWNED BY public.user_audit_trail.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    phone character varying(10) NOT NULL,
    email text NOT NULL,
    user_id integer NOT NULL,
    role text NOT NULL,
    manager_id integer,
    city_id integer,
    cluster_id integer,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'hr'::text, 'recruiter'::text, 'manager'::text, 'trainer'::text])))
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vendor_city_contacts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendor_city_contacts (
    id integer NOT NULL,
    vendor_id integer NOT NULL,
    city_id integer NOT NULL,
    spoc_name text NOT NULL,
    spoc_email text NOT NULL,
    spoc_phone character varying(10),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vendor_city_contacts OWNER TO neondb_owner;

--
-- Name: vendor_city_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vendor_city_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendor_city_contacts_id_seq OWNER TO neondb_owner;

--
-- Name: vendor_city_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vendor_city_contacts_id_seq OWNED BY public.vendor_city_contacts.id;


--
-- Name: vendor_invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendor_invoices (
    id integer NOT NULL,
    vendor_id integer NOT NULL,
    candidate_id integer NOT NULL,
    sourcing_fee numeric NOT NULL,
    invoice_date timestamp without time zone NOT NULL,
    payment_status text DEFAULT 'pending'::text,
    payment_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vendor_invoices OWNER TO neondb_owner;

--
-- Name: vendor_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vendor_invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendor_invoices_id_seq OWNER TO neondb_owner;

--
-- Name: vendor_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vendor_invoices_id_seq OWNED BY public.vendor_invoices.id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone character varying(10),
    contact_person text,
    commercial_terms text,
    replacement_period integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    management_fees numeric(5,2),
    sourcing_fee numeric(5,2),
    replacement_days integer,
    delivery_lead_name text,
    delivery_lead_email text,
    delivery_lead_phone character varying(10),
    city_recruitment_spoc_name text,
    city_recruitment_spoc_email text,
    city_recruitment_spoc_phone character varying(10),
    business_head_name text,
    business_head_email text,
    business_head_phone character varying(10),
    payroll_spoc_name text,
    payroll_spoc_email text,
    payroll_spoc_phone character varying(10)
);


ALTER TABLE public.vendors OWNER TO neondb_owner;

--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_id_seq OWNER TO neondb_owner;

--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: candidates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.candidates ALTER COLUMN id SET DEFAULT nextval('public.candidates_id_seq'::regclass);


--
-- Name: cities id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cities ALTER COLUMN id SET DEFAULT nextval('public.cities_id_seq'::regclass);


--
-- Name: clusters id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clusters ALTER COLUMN id SET DEFAULT nextval('public.clusters_id_seq'::regclass);


--
-- Name: employee_actions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_actions ALTER COLUMN id SET DEFAULT nextval('public.employee_actions_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: exit_records id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.exit_records ALTER COLUMN id SET DEFAULT nextval('public.exit_records_id_seq'::regclass);


--
-- Name: hiring_requests id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hiring_requests ALTER COLUMN id SET DEFAULT nextval('public.hiring_requests_id_seq'::regclass);


--
-- Name: recruiter_incentives id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recruiter_incentives ALTER COLUMN id SET DEFAULT nextval('public.recruiter_incentives_id_seq'::regclass);


--
-- Name: recruiters id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recruiters ALTER COLUMN id SET DEFAULT nextval('public.recruiters_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: training_attendance id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_attendance ALTER COLUMN id SET DEFAULT nextval('public.training_attendance_id_seq'::regclass);


--
-- Name: training_sessions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_sessions ALTER COLUMN id SET DEFAULT nextval('public.training_sessions_id_seq'::regclass);


--
-- Name: user_audit_trail id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_audit_trail ALTER COLUMN id SET DEFAULT nextval('public.user_audit_trail_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vendor_city_contacts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_city_contacts ALTER COLUMN id SET DEFAULT nextval('public.vendor_city_contacts_id_seq'::regclass);


--
-- Name: vendor_invoices id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_invoices ALTER COLUMN id SET DEFAULT nextval('public.vendor_invoices_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.candidates (id, name, phone, email, role_id, city_id, cluster_id, qualification, resume_source, vendor_id, recruiter_id, referral_name, status, prescreening_approved, prescreening_notes, screening_score, benchmark_met, technical_status, technical_notes, date_of_joining, gross_salary, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cities (id, name, code, is_active, created_at) FROM stdin;
6	Hyderabad	HYD	t	2025-07-12 11:03:35.283377
3	Bangalore	BLR	t	2025-07-10 17:47:29.325831
2	Delhi	DEL	t	2025-07-10 17:47:29.286833
8	Pune	PYN	t	2025-07-14 09:40:22.266865
1	Mumbai	BOM	t	2025-07-10 17:47:29.233343
\.


--
-- Data for Name: clusters; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.clusters (id, name, code, city_id, is_active, created_at) FROM stdin;
4	Noida	NOI	2	t	2025-07-10 17:47:29.553915
7	Koramangala	KOR	3	t	2025-07-10 17:47:29.599538
10	Cyberabad	CYD	6	t	2025-07-12 11:14:06.668389
1	Andheri	ARI	1	t	2025-07-10 17:47:29.376595
2	Bandra	BKC	1	t	2025-07-10 17:47:29.490859
6	Dwarka	DWK	2	t	2025-07-10 17:47:29.555929
9	Electronic City	E-City	3	t	2025-07-10 17:47:29.600925
5	Gurgaon	GGN	2	t	2025-07-10 17:47:29.555041
3	Thane	THN	1	t	2025-07-10 17:47:29.507372
8	Whitefield	WF	3	t	2025-07-10 17:47:29.600596
11	Indiranagar	IND	3	t	2025-07-14 18:08:53.671132
12	Central Bangalore Division	CBD	3	t	2025-07-14 18:09:38.717981
13	Hebbal	HBL	3	t	2025-07-14 18:09:54.864582
14	Yelahanka	YEL	3	t	2025-07-14 18:10:08.033305
15	Jayanagar	JYN	3	t	2025-07-14 18:10:30.150864
16	Outer Ring Road	ORR	3	t	2025-07-14 18:11:19.907463
17	Chembur	CHM	1	t	2025-07-14 18:12:55.390587
18	South Bombay	SOBO	1	t	2025-07-14 18:13:14.225181
19	Powai	PWI	1	t	2025-07-14 18:13:48.169625
20	Malad	MLD	1	t	2025-07-14 18:14:00.372253
21	Navi Mumbai	NM	1	t	2025-07-14 18:14:10.407141
22	South Delhi	SD	2	t	2025-07-14 18:14:55.705109
23	North Delhi	ND	2	t	2025-07-14 18:15:07.501061
24	Central Delhi	CD	2	t	2025-07-14 18:15:27.903756
25	Ghaziabadh	GZD	2	t	2025-07-14 18:15:52.188384
26	Laxminagar	LXM	2	t	2025-07-14 18:16:25.011505
27	Faridabad	FRD	2	t	2025-07-14 18:16:37.564747
\.


--
-- Data for Name: employee_actions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employee_actions (id, employee_id, action_type, description, requested_by, approved_by, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employees (id, candidate_id, employee_id, personal_details, contact_details, employment_details, govt_ids, bank_details, documents, status, join_date, exit_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: exit_records; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.exit_records (id, employee_id, exit_type, exit_date, reason, exit_interview, final_settlement, handover_completed, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: hiring_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.hiring_requests (id, request_id, city_id, cluster_id, role_id, number_of_positions, priority, request_type, status, notes, created_by, created_at, updated_at) FROM stdin;
1	BLR-CA-E-City-001	3	9	7	1	P1	fresh	open		1	2025-07-15 13:41:46.845115	2025-07-15 13:41:46.845115
2	DEL-WA-CD-001	2	24	15	1	P1	fresh	open	ff	1	2025-07-15 13:56:48.018847	2025-07-15 13:56:48.018847
3	DEL-WA-CD-002	2	24	15	1	P1	fresh	open	ff	1	2025-07-15 13:56:48.077316	2025-07-15 13:56:48.077316
4	DEL-WA-CD-003	2	24	15	1	P1	fresh	open	ff	1	2025-07-15 13:56:48.115773	2025-07-15 13:56:48.115773
5	BLR-MC-E-City-001	3	9	9	1	P1	fresh	open	...	1	2025-07-15 13:58:10.050858	2025-07-15 13:58:10.050858
6	BLR-MC-E-City-002	3	9	9	1	P1	fresh	open	...	1	2025-07-15 13:58:10.09801	2025-07-15 13:58:10.09801
7	BLR-MC-E-City-003	3	9	9	1	P1	fresh	open	...	1	2025-07-15 13:58:10.13815	2025-07-15 13:58:10.13815
8	BLR-MC-E-City-004	3	9	9	1	P1	fresh	closed	...	1	2025-07-15 13:58:10.177965	2025-07-15 13:59:04.264
9	HYD-MC-CYD-001	6	10	9	1	P1	replacement	open		1	2025-07-16 10:47:57.800866	2025-07-16 10:47:57.800866
10	HYD-MC-CYD-002	6	10	9	1	P1	replacement	open		1	2025-07-16 10:47:57.851593	2025-07-16 10:47:57.851593
11	HYD-MC-CYD-003	6	10	9	1	P1	replacement	open		1	2025-07-16 10:47:57.890503	2025-07-16 10:47:57.890503
12	BOM-BF-MLD-001	1	20	20	1	P1	replacement	open		1	2025-07-16 11:13:24.891468	2025-07-16 11:13:24.891468
13	BOM-BF-MLD-002	1	20	20	1	P1	replacement	open		1	2025-07-16 11:13:24.952957	2025-07-16 11:13:24.952957
14	BOM-MC-NM-001	1	21	9	1	P2	replacement	open		1	2025-07-16 11:13:44.064525	2025-07-16 11:13:44.064525
15	BOM-MC-NM-002	1	21	9	1	P2	replacement	open		1	2025-07-16 11:13:44.109321	2025-07-16 11:13:44.109321
16	BOM-MC-NM-003	1	21	9	1	P2	replacement	open		1	2025-07-16 11:13:44.146777	2025-07-16 11:13:44.146777
17	BOM-MC-NM-004	1	21	9	1	P2	replacement	open		1	2025-07-16 11:13:44.1841	2025-07-16 11:13:44.1841
18	BOM-MC-NM-005	1	21	9	1	P2	replacement	open		1	2025-07-16 11:13:44.221915	2025-07-16 11:13:44.221915
\.


--
-- Data for Name: recruiter_incentives; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.recruiter_incentives (id, recruiter_id, candidate_id, incentive_amount, calculated_date, payment_status, payment_date, created_at) FROM stdin;
\.


--
-- Data for Name: recruiters; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.recruiters (id, name, email, phone, is_active, created_at, city_id) FROM stdin;
2	Sneha Gupta	sneha.gupta@company.com	9876543213	t	2025-07-10 17:48:42.851344	3
1	Joydeep	Joydeep.baidyaYz@gmail.com	9876543212	t	2025-07-10 17:48:42.851344	3
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.roles (id, name, code, description, is_active, created_at, job_description_file) FROM stdin;
7	Cleaning Associate	CA	Pre and Post repair Bike wash	t	2025-07-10 17:48:40.401701	\N
6	Mobile Quality Control Associate	MQC	Audit and verify the accuracy of fault marking and minor repairs across Yulu Centres.	t	2025-07-10 17:48:40.401701	\N
5	Quality Control Associate	QCA	Conducts assessments and quality checks on bikes and tools; ensures high repair standards.	t	2025-07-10 17:48:40.401701	\N
4	Bike Captain	BC	Ensures quality and availability of the bike fleet through assessments, minor repairs, and battery audits.	t	2025-07-10 17:48:40.401701	\N
8	Workshop Incharge	WI		t	2025-07-15 11:42:28.151717	\N
9	Mechanic	MC		t	2025-07-15 11:50:27.728205	\N
10	Operator	OPR		t	2025-07-15 11:50:37.354893	\N
11	Pilot	PL		t	2025-07-15 11:50:47.441954	\N
12	Sales Associate	SA		t	2025-07-15 11:52:15.214106	\N
13	Marshal	ML		t	2025-07-15 11:52:31.742304	\N
14	Battery PDI Technician	BPT		t	2025-07-15 11:52:47.711759	\N
15	Warehouse Associate	WA		t	2025-07-15 11:52:57.281876	\N
16	Zone Screener	ZS		t	2025-07-15 11:53:05.611471	\N
17	Cluster Executive	CE		t	2025-07-15 11:53:36.713026	\N
18	Inventory Associate	IA		t	2025-07-15 11:53:51.91395	\N
19	Refurb Mechanic	RM		t	2025-07-15 11:54:04.247999	\N
20	Bike fitter	BF		t	2025-07-15 11:55:33.339587	\N
\.


--
-- Data for Name: training_attendance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.training_attendance (id, training_session_id, date, present, notes, marked_by, created_at) FROM stdin;
\.


--
-- Data for Name: training_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.training_sessions (id, candidate_id, training_type, status, trainer_id, manager_id, start_date, end_date, duration, attendance_marked, fit_status, comments, dropout_reason, fte_confirmed, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_audit_trail; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_audit_trail (id, user_id, action, changed_by, old_values, new_values, "timestamp") FROM stdin;
1	1	deactivated_city	1	\N	\N	2025-07-12 11:31:02.239466
2	1	deactivated_city	1	\N	\N	2025-07-14 10:12:17.218095
3	1	activated_city	1	\N	\N	2025-07-14 18:05:14.740309
4	1	activated_city	1	\N	\N	2025-07-14 18:05:17.005411
5	1	updated_city	1	\N	\N	2025-07-14 18:05:29.173487
6	1	updated_city	1	\N	\N	2025-07-14 18:05:47.511179
7	1	updated_cluster	1	\N	\N	2025-07-14 18:06:32.76091
8	1	updated_cluster	1	\N	\N	2025-07-14 18:07:04.01065
9	1	updated_cluster	1	\N	\N	2025-07-14 18:07:19.219712
10	1	updated_cluster	1	\N	\N	2025-07-14 18:07:41.49373
11	1	updated_cluster	1	\N	\N	2025-07-14 18:07:54.033116
12	1	updated_cluster	1	\N	\N	2025-07-14 18:08:06.811662
13	1	updated_cluster	1	\N	\N	2025-07-14 18:08:17.635614
14	1	updated_cluster	1	\N	\N	2025-07-14 18:16:03.660939
15	1	updated_role	1	\N	\N	2025-07-14 18:17:33.087915
16	1	updated_role	1	\N	\N	2025-07-14 18:17:57.717316
17	1	updated_role	1	\N	\N	2025-07-14 18:26:48.592296
18	1	updated_role	1	\N	\N	2025-07-14 18:28:17.490133
19	1	updated_role	1	\N	\N	2025-07-14 18:30:33.508527
20	1	updated_role	1	\N	\N	2025-07-14 18:40:47.973558
21	1	updated_recruiter	1	\N	\N	2025-07-16 10:47:11.643689
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, name, phone, email, user_id, role, manager_id, city_id, cluster_id, password, created_at, updated_at) FROM stdin;
1	Administrator	1234567890	admin@company.com	1	admin	\N	\N	\N	$2b$10$5N.8FftoL1UrslbCYbG0P.L1pcX03W2c5uibHSRj0ipwQwt4jZsri	2025-07-12 10:23:09.467012	2025-07-12 10:23:09.467012
2	John Doe	1234567891	john.doe@company.com	2	hr	\N	\N	\N	$2b$10$EfE5HTgNyHRLkMOsMtEvKuWKHZRiZ/Q1BWf9hvyMONJ5wdJeEsVtO	2025-07-12 10:23:09.467012	2025-07-12 10:23:09.467012
3	Test Manager	1234567892	manager@company.com	3	manager	\N	1	1	$2b$10$ZsdflrYGfkwOpTjAS/cf5.ONqZugapYsn.7GFeGztK.Bu4DLaZkFe	2025-07-12 10:23:09.467012	2025-07-12 10:23:09.467012
\.


--
-- Data for Name: vendor_city_contacts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vendor_city_contacts (id, vendor_id, city_id, spoc_name, spoc_email, spoc_phone, created_at) FROM stdin;
1	6	3	Bangalore Lead - Vinay Krishna	vinay.bangalore@elitestaffing.com	7654321102	2025-07-16 10:42:12.363585
3	7	1	Mumbai Lead - Akash Patil	akash.mumbai@elitestaffing.com	7654321104	2025-07-16 10:42:31.562482
4	7	2	Delhi Lead - Neha Agarwal	neha.delhi@elitestaffing.com	7654321103	2025-07-16 10:42:31.602523
5	7	3	Bangalore Lead - Vinay Krishna	vinay.bangalore@elitestaffing.com	7654321102	2025-07-16 10:42:31.641041
6	8	1	Mumbai Test SPOC - Complete Name	mumbai.test@testvendor.com	6543210991	2025-07-16 10:43:36.558125
7	8	2	Delhi Test SPOC - Complete Name	delhi.test@testvendor.com	6543210992	2025-07-16 10:43:36.597309
8	8	3	Bangalore Test SPOC - Complete Name	bangalore.test@testvendor.com	6543210993	2025-07-16 10:43:36.635251
9	8	6	Hyderabad Test SPOC - Complete Name	hyderabad.test@testvendor.com	6543210994	2025-07-16 10:43:36.673551
\.


--
-- Data for Name: vendor_invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vendor_invoices (id, vendor_id, candidate_id, sourcing_fee, invoice_date, payment_status, payment_date, created_at) FROM stdin;
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vendors (id, name, email, phone, contact_person, commercial_terms, replacement_period, is_active, created_at, management_fees, sourcing_fee, replacement_days, delivery_lead_name, delivery_lead_email, delivery_lead_phone, city_recruitment_spoc_name, city_recruitment_spoc_email, city_recruitment_spoc_phone, business_head_name, business_head_email, business_head_phone, payroll_spoc_name, payroll_spoc_email, payroll_spoc_phone) FROM stdin;
1	ManpowerCorp	rajesh@manpowercorp.com	9876543210	Rajesh Kumar	\N	\N	t	2025-07-10 17:48:41.86944	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2	StaffingSolutions	priya@staffingsol.com	9876543211	Priya Sharma	\N	\N	t	2025-07-10 17:48:41.86944	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3	TechStaff Solutions	contact@techstaff.com	9876543210	Rajesh Kumar	Standard terms with 30-day payment cycle	\N	t	2025-07-16 10:39:13.509	8.50	12.00	90	Priya Sharma	priya@techstaff.com	9876543211	\N	\N	\N	Amit Verma	amit@techstaff.com	9876543212	Sunita Gupta	sunita@techstaff.com	9876543213
4	WorkForce Pro Solutions	info@workforcepro.com	8765432109	Deepak Sharma	Competitive rates with flexible payment terms	\N	t	2025-07-16 10:40:50.364	7.50	10.00	60	Kavita Singh	kavita@workforcepro.com	8765432110	\N	\N	\N	Rajesh Gupta	rajesh@workforcepro.com	8765432111	Anita Joshi	anita@workforcepro.com	8765432112
5	Elite Staffing Solutions	contact@elitestaffing.com	7654321098	Ravi Mehta	Premium service with dedicated account management	\N	t	2025-07-16 10:41:47.394	9.00	15.00	45	Sanjay Kumar	sanjay@elitestaffing.com	7654321099	\N	\N	\N	Pooja Sharma	pooja@elitestaffing.com	7654321100	Ramesh Iyer	ramesh@elitestaffing.com	7654321101
6	Elite Staffing Solutions	contact@elitestaffing.com	7654321098	Ravi Mehta	Premium service with dedicated account management	\N	t	2025-07-16 10:42:12.294	9.00	15.00	45	Sanjay Kumar	sanjay@elitestaffing.com	7654321099	\N	\N	\N	Pooja Sharma	pooja@elitestaffing.com	7654321100	Ramesh Iyer	ramesh@elitestaffing.com	7654321101
7	Elite Staffing Solutions	contact@elitestaffing.com	7654321098	Ravi Mehta	Premium service with dedicated account management	\N	t	2025-07-16 10:42:31.375	9.00	15.00	45	Sanjay Kumar	sanjay@elitestaffing.com	7654321099	\N	\N	\N	Pooja Sharma	pooja@elitestaffing.com	7654321100	Ramesh Iyer	ramesh@elitestaffing.com	7654321101
8	COMPLETE Test Vendor Ltd	complete@testvendor.com	6543210987	Complete Test Manager	Comprehensive test terms with all fields populated	\N	t	2025-07-16 10:43:36.494	12.50	18.00	120	Test Delivery Lead	delivery@testvendor.com	6543210988	\N	\N	\N	Test Business Head	business@testvendor.com	6543210989	Test Payroll SPOC	payroll@testvendor.com	6543210990
\.


--
-- Name: candidates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.candidates_id_seq', 1, false);


--
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.cities_id_seq', 8, true);


--
-- Name: clusters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.clusters_id_seq', 27, true);


--
-- Name: employee_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.employee_actions_id_seq', 1, false);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.employees_id_seq', 1, false);


--
-- Name: exit_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.exit_records_id_seq', 1, false);


--
-- Name: hiring_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.hiring_requests_id_seq', 18, true);


--
-- Name: recruiter_incentives_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.recruiter_incentives_id_seq', 1, false);


--
-- Name: recruiters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.recruiters_id_seq', 2, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.roles_id_seq', 20, true);


--
-- Name: training_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.training_attendance_id_seq', 1, false);


--
-- Name: training_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.training_sessions_id_seq', 1, false);


--
-- Name: user_audit_trail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_audit_trail_id_seq', 21, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: vendor_city_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.vendor_city_contacts_id_seq', 9, true);


--
-- Name: vendor_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.vendor_invoices_id_seq', 1, false);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.vendors_id_seq', 8, true);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: cities cities_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_code_unique UNIQUE (code);


--
-- Name: cities cities_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_name_unique UNIQUE (name);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: clusters clusters_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clusters
    ADD CONSTRAINT clusters_pkey PRIMARY KEY (id);


--
-- Name: employee_actions employee_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_actions
    ADD CONSTRAINT employee_actions_pkey PRIMARY KEY (id);


--
-- Name: employees employees_employee_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_id_unique UNIQUE (employee_id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: exit_records exit_records_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.exit_records
    ADD CONSTRAINT exit_records_pkey PRIMARY KEY (id);


--
-- Name: hiring_requests hiring_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hiring_requests
    ADD CONSTRAINT hiring_requests_pkey PRIMARY KEY (id);


--
-- Name: hiring_requests hiring_requests_request_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hiring_requests
    ADD CONSTRAINT hiring_requests_request_id_unique UNIQUE (request_id);


--
-- Name: recruiter_incentives recruiter_incentives_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recruiter_incentives
    ADD CONSTRAINT recruiter_incentives_pkey PRIMARY KEY (id);


--
-- Name: recruiters recruiters_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recruiters
    ADD CONSTRAINT recruiters_pkey PRIMARY KEY (id);


--
-- Name: roles roles_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_code_unique UNIQUE (code);


--
-- Name: roles roles_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_unique UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: training_attendance training_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_attendance
    ADD CONSTRAINT training_attendance_pkey PRIMARY KEY (id);


--
-- Name: training_sessions training_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT training_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_audit_trail user_audit_trail_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_audit_trail
    ADD CONSTRAINT user_audit_trail_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_id_key UNIQUE (user_id);


--
-- Name: vendor_city_contacts vendor_city_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_city_contacts
    ADD CONSTRAINT vendor_city_contacts_pkey PRIMARY KEY (id);


--
-- Name: vendor_invoices vendor_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_invoices
    ADD CONSTRAINT vendor_invoices_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: idx_candidates_city_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_candidates_city_id ON public.candidates USING btree (city_id);


--
-- Name: idx_candidates_cluster_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_candidates_cluster_id ON public.candidates USING btree (cluster_id);


--
-- Name: idx_candidates_recruiter_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_candidates_recruiter_id ON public.candidates USING btree (recruiter_id);


--
-- Name: idx_candidates_role_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_candidates_role_id ON public.candidates USING btree (role_id);


--
-- Name: idx_candidates_vendor_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_candidates_vendor_id ON public.candidates USING btree (vendor_id);


--
-- Name: idx_clusters_city_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_clusters_city_id ON public.clusters USING btree (city_id);


--
-- Name: idx_employee_actions_employee_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_employee_actions_employee_id ON public.employee_actions USING btree (employee_id);


--
-- Name: idx_employees_candidate_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_employees_candidate_id ON public.employees USING btree (candidate_id);


--
-- Name: idx_exit_records_employee_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_exit_records_employee_id ON public.exit_records USING btree (employee_id);


--
-- Name: idx_hiring_requests_city_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_hiring_requests_city_id ON public.hiring_requests USING btree (city_id);


--
-- Name: idx_hiring_requests_cluster_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_hiring_requests_cluster_id ON public.hiring_requests USING btree (cluster_id);


--
-- Name: idx_hiring_requests_created_by; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_hiring_requests_created_by ON public.hiring_requests USING btree (created_by);


--
-- Name: idx_hiring_requests_role_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_hiring_requests_role_id ON public.hiring_requests USING btree (role_id);


--
-- Name: idx_recruiters_city_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_recruiters_city_id ON public.recruiters USING btree (city_id);


--
-- Name: idx_training_sessions_candidate_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_training_sessions_candidate_id ON public.training_sessions USING btree (candidate_id);


--
-- Name: idx_training_sessions_trainer_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_training_sessions_trainer_id ON public.training_sessions USING btree (trainer_id);


--
-- Name: idx_users_city_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_city_id ON public.users USING btree (city_id);


--
-- Name: idx_users_cluster_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_cluster_id ON public.users USING btree (cluster_id);


--
-- Name: idx_users_manager_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_manager_id ON public.users USING btree (manager_id);


--
-- Name: idx_vendor_city_contacts_city_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_vendor_city_contacts_city_id ON public.vendor_city_contacts USING btree (city_id);


--
-- Name: idx_vendor_city_contacts_vendor_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_vendor_city_contacts_vendor_id ON public.vendor_city_contacts USING btree (vendor_id);


--
-- Name: candidates candidates_city_id_cities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_city_id_cities_id_fk FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: candidates candidates_cluster_id_clusters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_cluster_id_clusters_id_fk FOREIGN KEY (cluster_id) REFERENCES public.clusters(id);


--
-- Name: candidates candidates_recruiter_id_recruiters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_recruiter_id_recruiters_id_fk FOREIGN KEY (recruiter_id) REFERENCES public.recruiters(id);


--
-- Name: candidates candidates_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: candidates candidates_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_vendor_id_vendors_id_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: clusters clusters_city_id_cities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clusters
    ADD CONSTRAINT clusters_city_id_cities_id_fk FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: employee_actions employee_actions_employee_id_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_actions
    ADD CONSTRAINT employee_actions_employee_id_employees_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employees employees_candidate_id_candidates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_candidate_id_candidates_id_fk FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);


--
-- Name: exit_records exit_records_employee_id_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.exit_records
    ADD CONSTRAINT exit_records_employee_id_employees_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: hiring_requests hiring_requests_city_id_cities_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hiring_requests
    ADD CONSTRAINT hiring_requests_city_id_cities_id_fk FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: hiring_requests hiring_requests_cluster_id_clusters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hiring_requests
    ADD CONSTRAINT hiring_requests_cluster_id_clusters_id_fk FOREIGN KEY (cluster_id) REFERENCES public.clusters(id);


--
-- Name: hiring_requests hiring_requests_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hiring_requests
    ADD CONSTRAINT hiring_requests_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: recruiter_incentives recruiter_incentives_candidate_id_candidates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recruiter_incentives
    ADD CONSTRAINT recruiter_incentives_candidate_id_candidates_id_fk FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);


--
-- Name: recruiter_incentives recruiter_incentives_recruiter_id_recruiters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recruiter_incentives
    ADD CONSTRAINT recruiter_incentives_recruiter_id_recruiters_id_fk FOREIGN KEY (recruiter_id) REFERENCES public.recruiters(id);


--
-- Name: recruiters recruiters_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recruiters
    ADD CONSTRAINT recruiters_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: training_attendance training_attendance_training_session_id_training_sessions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_attendance
    ADD CONSTRAINT training_attendance_training_session_id_training_sessions_id_fk FOREIGN KEY (training_session_id) REFERENCES public.training_sessions(id);


--
-- Name: training_sessions training_sessions_candidate_id_candidates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT training_sessions_candidate_id_candidates_id_fk FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);


--
-- Name: vendor_city_contacts vendor_city_contacts_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_city_contacts
    ADD CONSTRAINT vendor_city_contacts_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: vendor_city_contacts vendor_city_contacts_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_city_contacts
    ADD CONSTRAINT vendor_city_contacts_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: vendor_invoices vendor_invoices_candidate_id_candidates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_invoices
    ADD CONSTRAINT vendor_invoices_candidate_id_candidates_id_fk FOREIGN KEY (candidate_id) REFERENCES public.candidates(id);


--
-- Name: vendor_invoices vendor_invoices_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_invoices
    ADD CONSTRAINT vendor_invoices_vendor_id_vendors_id_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

