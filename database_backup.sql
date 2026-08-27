--
-- PostgreSQL database dump
--

\restrict iuTYa5Nzy99jfksSXF3Y2F6ew9hFU97VlDUUI6QqvvSW3Tum7IZ6ZSdQ62BAw7c

-- Dumped from database version 16.14 (Homebrew)
-- Dumped by pg_dump version 16.14 (Homebrew)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assignment_histories; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.assignment_histories (
    id bigint NOT NULL,
    year bigint NOT NULL,
    month bigint NOT NULL,
    month_name character varying(10),
    id_employee bigint,
    employee_name character varying(150) NOT NULL,
    employee_role character varying(100),
    id_customer bigint,
    customer_name character varying(100) NOT NULL,
    id_group bigint,
    group_name character varying(100),
    brand_name character varying(50),
    sallary_gross numeric(15,2),
    start_contract character varying(50),
    end_contract character varying(50),
    is_permanent boolean DEFAULT false,
    employee_status character varying(20),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.assignment_histories OWNER TO "user";

--
-- Name: assignment_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.assignment_histories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignment_histories_id_seq OWNER TO "user";

--
-- Name: assignment_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.assignment_histories_id_seq OWNED BY public.assignment_histories.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    action character varying(50) NOT NULL,
    entity character varying(50) NOT NULL,
    entity_id character varying(50),
    summary character varying(255) NOT NULL,
    details text,
    performed_by character varying(100) DEFAULT 'admin'::character varying,
    ip_address character varying(50),
    created_at timestamp with time zone
);


ALTER TABLE public.audit_logs OWNER TO "user";

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO "user";

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.customers (
    id_customer bigint NOT NULL,
    customer_name character varying(100) NOT NULL,
    customer_start_contract date NOT NULL,
    customer_end_contract date NOT NULL
);


ALTER TABLE public.customers OWNER TO "user";

--
-- Name: customers_id_customer_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.customers_id_customer_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_customer_seq OWNER TO "user";

--
-- Name: customers_id_customer_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.customers_id_customer_seq OWNED BY public.customers.id_customer;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.employees (
    id_employee bigint NOT NULL,
    employee_name character varying(150) NOT NULL,
    employee_role character varying(100) NOT NULL,
    status character varying(20) DEFAULT 'Active'::character varying,
    is_active boolean DEFAULT true,
    id_group bigint,
    id_customer bigint,
    start_contract character varying(50) NOT NULL,
    end_contract character varying(50) NOT NULL,
    sallary_gross numeric(15,2) DEFAULT 0,
    tunjangan_penempatan numeric(15,2) DEFAULT 0,
    tunjangan_keahlian numeric(15,2) DEFAULT 0,
    koefisien numeric(3,2),
    revenue_nett numeric(15,2) DEFAULT 0,
    join_date character varying(50),
    onboarding_date character varying(50),
    is_permanent boolean DEFAULT false,
    allocation_status character varying(30) DEFAULT 'ACTIVE'::character varying,
    last_salary_increment_date character varying(50)
);


ALTER TABLE public.employees OWNER TO "user";

--
-- Name: employees_id_employee_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.employees_id_employee_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_employee_seq OWNER TO "user";

--
-- Name: employees_id_employee_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.employees_id_employee_seq OWNED BY public.employees.id_employee;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.groups (
    id_group bigint NOT NULL,
    group_name character varying(100) NOT NULL,
    brand_name character varying(50)
);


ALTER TABLE public.groups OWNER TO "user";

--
-- Name: groups_id_group_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.groups_id_group_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.groups_id_group_seq OWNER TO "user";

--
-- Name: groups_id_group_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.groups_id_group_seq OWNED BY public.groups.id_group;


--
-- Name: personal_notes; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.personal_notes (
    id bigint NOT NULL,
    net_salary numeric(15,2) NOT NULL,
    tk0_k0 numeric(15,2),
    k1_k2 numeric(15,2),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.personal_notes OWNER TO "user";

--
-- Name: personal_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.personal_notes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_notes_id_seq OWNER TO "user";

--
-- Name: personal_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.personal_notes_id_seq OWNED BY public.personal_notes.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(150),
    role character varying(50) DEFAULT 'Manager'::character varying,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO "user";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO "user";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: assignment_histories id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.assignment_histories ALTER COLUMN id SET DEFAULT nextval('public.assignment_histories_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: customers id_customer; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.customers ALTER COLUMN id_customer SET DEFAULT nextval('public.customers_id_customer_seq'::regclass);


--
-- Name: employees id_employee; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.employees ALTER COLUMN id_employee SET DEFAULT nextval('public.employees_id_employee_seq'::regclass);


--
-- Name: groups id_group; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.groups ALTER COLUMN id_group SET DEFAULT nextval('public.groups_id_group_seq'::regclass);


--
-- Name: personal_notes id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.personal_notes ALTER COLUMN id SET DEFAULT nextval('public.personal_notes_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: assignment_histories; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.assignment_histories (id, year, month, month_name, id_employee, employee_name, employee_role, id_customer, customer_name, id_group, group_name, brand_name, sallary_gross, start_contract, end_contract, is_permanent, employee_status, created_at, updated_at) FROM stdin;
29	2026	9	Sep	3	Rifki Ridha	Backend Developer	2	Bank CIMB	2	GS	GS	8300000.00	2026-01-01	2027-02-06	f	Active	2026-08-27 13:11:21.236667+07	2026-08-27 14:58:32.894494+07
30	2026	10	Oct	3	Rifki Ridha	Backend Developer	2	Bank CIMB	2	GS	GS	8300000.00	2026-01-01	2027-02-06	f	Active	2026-08-27 13:11:21.237073+07	2026-08-27 14:58:32.894761+07
31	2026	11	Nov	3	Rifki Ridha	Backend Developer	2	Bank CIMB	2	GS	GS	8300000.00	2026-01-01	2027-02-06	f	Active	2026-08-27 13:11:21.237486+07	2026-08-27 14:58:32.895012+07
32	2026	12	Dec	3	Rifki Ridha	Backend Developer	2	Bank CIMB	2	GS	GS	8300000.00	2026-01-01	2027-02-06	f	Active	2026-08-27 13:11:21.237881+07	2026-08-27 14:58:32.895283+07
40	2026	8	Aug	4	Ahri Maulana	Webmethods Developer	3	Bank Indonesia APIM	2	GS	GS	7331379.00	2026-01-01	2026-10-28	f	Active	2026-08-27 13:11:21.241774+07	2026-08-27 14:58:32.895745+07
651	2026	8	Aug	57	Rafli Akbar Audi	Middle DevOps	14	TELKOMSEL FOSS	2	GS	GS	11851099.00	2026-01-01	2026-10-20	f	Active	2026-08-27 14:58:03.0861+07	2026-08-27 14:58:32.957644+07
652	2026	9	Sep	57	Rafli Akbar Audi	Middle DevOps	14	TELKOMSEL FOSS	2	GS	GS	11851099.00	2026-01-01	2026-10-20	f	Active	2026-08-27 14:58:03.087245+07	2026-08-27 14:58:32.957933+07
653	2026	10	Oct	57	Rafli Akbar Audi	Middle DevOps	14	TELKOMSEL FOSS	2	GS	GS	11851099.00	2026-01-01	2026-10-20	f	Active	2026-08-27 14:58:03.08763+07	2026-08-27 14:58:32.958278+07
8	2026	8	Aug	1	Sukma Aspriliyawan	Webmethods Developer	1	Bank BSI	2	GS	GS	8000000.00	2026-01-01	2026-09-30	f	Active	2026-08-27 13:11:21.216029+07	2026-08-27 14:58:32.887817+07
9	2026	9	Sep	1	Sukma Aspriliyawan	Webmethods Developer	1	Bank BSI	2	GS	GS	8000000.00	2026-01-01	2026-09-30	f	Active	2026-08-27 13:11:21.216423+07	2026-08-27 14:58:32.891805+07
17	2026	8	Aug	2	Satria Pandega	Middle Backend Engineer	2	Bank CIMB	2	GS	GS	6789705.00	2026-01-01	2026-11-18	f	Active	2026-08-27 13:11:21.21978+07	2026-08-27 14:58:32.892833+07
18	2026	9	Sep	2	Satria Pandega	Middle Backend Engineer	2	Bank CIMB	2	GS	GS	6789705.00	2026-01-01	2026-11-18	f	Active	2026-08-27 13:11:21.220202+07	2026-08-27 14:58:32.893203+07
19	2026	10	Oct	2	Satria Pandega	Middle Backend Engineer	2	Bank CIMB	2	GS	GS	6789705.00	2026-01-01	2026-11-18	f	Active	2026-08-27 13:11:21.220591+07	2026-08-27 14:58:32.893533+07
20	2026	11	Nov	2	Satria Pandega	Middle Backend Engineer	2	Bank CIMB	2	GS	GS	6789705.00	2026-01-01	2026-11-18	f	Active	2026-08-27 13:11:21.221021+07	2026-08-27 14:58:32.893808+07
28	2026	8	Aug	3	Rifki Ridha	Backend Developer	2	Bank CIMB	2	GS	GS	8300000.00	2026-01-01	2027-02-06	f	Active	2026-08-27 13:11:21.236223+07	2026-08-27 14:58:32.894158+07
52	2026	10	Oct	5	Rizki Maulana Rajabi	Webmethods Developer	3	Bank Indonesia APIM	2	GS	GS	8400992.00	2026-01-01	2027-07-15	f	Active	2026-08-27 13:11:21.24725+07	2026-08-27 14:58:32.897711+07
53	2026	11	Nov	5	Rizki Maulana Rajabi	Webmethods Developer	3	Bank Indonesia APIM	2	GS	GS	8400992.00	2026-01-01	2027-07-15	f	Active	2026-08-27 13:11:21.247685+07	2026-08-27 14:58:32.897972+07
54	2026	12	Dec	5	Rizki Maulana Rajabi	Webmethods Developer	3	Bank Indonesia APIM	2	GS	GS	8400992.00	2026-01-01	2027-07-15	f	Active	2026-08-27 13:11:21.248107+07	2026-08-27 14:58:32.898214+07
62	2026	8	Aug	6	Alif Athallah M	Middle Backend	4	Bank Indonesia BIFAST	2	GS	GS	10000000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.251571+07	2026-08-27 14:58:32.898541+07
63	2026	9	Sep	6	Alif Athallah M	Middle Backend	4	Bank Indonesia BIFAST	2	GS	GS	10000000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.251962+07	2026-08-27 14:58:32.898843+07
64	2026	10	Oct	6	Alif Athallah M	Middle Backend	4	Bank Indonesia BIFAST	2	GS	GS	10000000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.252328+07	2026-08-27 14:58:32.899146+07
65	2026	11	Nov	6	Alif Athallah M	Middle Backend	4	Bank Indonesia BIFAST	2	GS	GS	10000000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.252736+07	2026-08-27 14:58:32.899485+07
66	2026	12	Dec	6	Alif Athallah M	Middle Backend	4	Bank Indonesia BIFAST	2	GS	GS	10000000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.253346+07	2026-08-27 14:58:32.899764+07
74	2026	8	Aug	8	Ferdy Lasuf Baehaqie	Monitoring Engineer	5	Bank Indonesia JBOSS	2	GS	GS	8200000.00	2026-01-01	2027-02-10	f	Active	2026-08-27 13:11:21.256631+07	2026-08-27 14:58:32.900738+07
75	2026	9	Sep	8	Ferdy Lasuf Baehaqie	Monitoring Engineer	5	Bank Indonesia JBOSS	2	GS	GS	8200000.00	2026-01-01	2027-02-10	f	Active	2026-08-27 13:11:21.257134+07	2026-08-27 14:58:32.901046+07
76	2026	10	Oct	8	Ferdy Lasuf Baehaqie	Monitoring Engineer	5	Bank Indonesia JBOSS	2	GS	GS	8200000.00	2026-01-01	2027-02-10	f	Active	2026-08-27 13:11:21.257514+07	2026-08-27 14:58:32.901341+07
77	2026	11	Nov	8	Ferdy Lasuf Baehaqie	Monitoring Engineer	5	Bank Indonesia JBOSS	2	GS	GS	8200000.00	2026-01-01	2027-02-10	f	Active	2026-08-27 13:11:21.257886+07	2026-08-27 14:58:32.901684+07
78	2026	12	Dec	8	Ferdy Lasuf Baehaqie	Monitoring Engineer	5	Bank Indonesia JBOSS	2	GS	GS	8200000.00	2026-01-01	2027-02-10	f	Active	2026-08-27 13:11:21.258246+07	2026-08-27 14:58:32.901949+07
42	2026	10	Oct	4	Ahri Maulana	Webmethods Developer	3	Bank Indonesia APIM	2	GS	GS	7331379.00	2026-01-01	2026-10-28	f	Active	2026-08-27 13:11:21.242996+07	2026-08-27 14:58:32.896496+07
50	2026	8	Aug	5	Rizki Maulana Rajabi	Webmethods Developer	3	Bank Indonesia APIM	2	GS	GS	8400992.00	2026-01-01	2027-07-15	f	Active	2026-08-27 13:11:21.246342+07	2026-08-27 14:58:32.897105+07
51	2026	9	Sep	5	Rizki Maulana Rajabi	Webmethods Developer	3	Bank Indonesia APIM	2	GS	GS	8400992.00	2026-01-01	2027-07-15	f	Active	2026-08-27 13:11:21.246825+07	2026-08-27 14:58:32.897404+07
108	2026	8	Aug	11	Yuniar Fitria Hendrawati	Middle QA Tester/ Engineer	7	Bank Jakarta (App Migration)	2	GS	GS	7106040.00	2026-01-01	2027-03-05	f	Active	2026-08-27 13:11:21.270668+07	2026-08-27 14:58:32.904525+07
109	2026	9	Sep	11	Yuniar Fitria Hendrawati	Middle QA Tester/ Engineer	7	Bank Jakarta (App Migration)	2	GS	GS	7106040.00	2026-01-01	2027-03-05	f	Active	2026-08-27 13:11:21.271058+07	2026-08-27 14:58:32.904758+07
110	2026	10	Oct	11	Yuniar Fitria Hendrawati	Middle QA Tester/ Engineer	7	Bank Jakarta (App Migration)	2	GS	GS	7106040.00	2026-01-01	2027-03-05	f	Active	2026-08-27 13:11:21.27144+07	2026-08-27 14:58:32.904984+07
111	2026	11	Nov	11	Yuniar Fitria Hendrawati	Middle QA Tester/ Engineer	7	Bank Jakarta (App Migration)	2	GS	GS	7106040.00	2026-01-01	2027-03-05	f	Active	2026-08-27 13:11:21.271841+07	2026-08-27 14:58:32.905223+07
112	2026	12	Dec	11	Yuniar Fitria Hendrawati	Middle QA Tester/ Engineer	7	Bank Jakarta (App Migration)	2	GS	GS	7106040.00	2026-01-01	2027-03-05	f	Active	2026-08-27 13:11:21.272236+07	2026-08-27 14:58:32.905439+07
86	2026	8	Aug	9	Henry Prasetyo	Monitoring Engineer	6	Bank Indonesia OCP	2	GS	GS	6789705.00	2026-01-01	2026-10-27	f	Active	2026-08-27 13:11:21.261283+07	2026-08-27 14:58:32.902208+07
87	2026	9	Sep	9	Henry Prasetyo	Monitoring Engineer	6	Bank Indonesia OCP	2	GS	GS	6789705.00	2026-01-01	2026-10-27	f	Active	2026-08-27 13:11:21.261644+07	2026-08-27 14:58:32.902472+07
88	2026	10	Oct	9	Henry Prasetyo	Monitoring Engineer	6	Bank Indonesia OCP	2	GS	GS	6789705.00	2026-01-01	2026-10-27	f	Active	2026-08-27 13:11:21.262049+07	2026-08-27 14:58:32.902704+07
96	2026	8	Aug	10	Imron Rosadi	Monitoring Engineer	6	Bank Indonesia OCP	2	GS	GS	6250884.00	2026-01-01	2027-06-17	f	Active	2026-08-27 13:11:21.265956+07	2026-08-27 14:58:32.903282+07
97	2026	9	Sep	10	Imron Rosadi	Monitoring Engineer	6	Bank Indonesia OCP	2	GS	GS	6250884.00	2026-01-01	2027-06-17	f	Active	2026-08-27 13:11:21.266348+07	2026-08-27 14:58:32.903555+07
98	2026	10	Oct	10	Imron Rosadi	Monitoring Engineer	6	Bank Indonesia OCP	2	GS	GS	6250884.00	2026-01-01	2027-06-17	f	Active	2026-08-27 13:11:21.266821+07	2026-08-27 14:58:32.903798+07
99	2026	11	Nov	10	Imron Rosadi	Monitoring Engineer	6	Bank Indonesia OCP	2	GS	GS	6250884.00	2026-01-01	2027-06-17	f	Active	2026-08-27 13:11:21.267206+07	2026-08-27 14:58:32.904037+07
100	2026	12	Dec	10	Imron Rosadi	Monitoring Engineer	6	Bank Indonesia OCP	2	GS	GS	6250884.00	2026-01-01	2027-06-17	f	Active	2026-08-27 13:11:21.267565+07	2026-08-27 14:58:32.904268+07
144	2026	8	Aug	14	Nida Tedila Y	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2026-11-05	f	Active	2026-08-27 13:11:21.283851+07	2026-08-27 14:58:32.909157+07
145	2026	9	Sep	14	Nida Tedila Y	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2026-11-05	f	Active	2026-08-27 13:11:21.284087+07	2026-08-27 14:58:32.909444+07
146	2026	10	Oct	14	Nida Tedila Y	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2026-11-05	f	Active	2026-08-27 13:11:21.284328+07	2026-08-27 14:58:32.909712+07
147	2026	11	Nov	14	Nida Tedila Y	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2026-11-05	f	Active	2026-08-27 13:11:21.284572+07	2026-08-27 14:58:32.909982+07
120	2026	8	Aug	12	Fendi Gunawan	Infrastructure Engineer	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2027-01-25	f	Active	2026-08-27 13:11:21.275285+07	2026-08-27 14:58:32.905673+07
121	2026	9	Sep	12	Fendi Gunawan	Infrastructure Engineer	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2027-01-25	f	Active	2026-08-27 13:11:21.275653+07	2026-08-27 14:58:32.905914+07
122	2026	10	Oct	12	Fendi Gunawan	Infrastructure Engineer	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2027-01-25	f	Active	2026-08-27 13:11:21.276018+07	2026-08-27 14:58:32.906172+07
123	2026	11	Nov	12	Fendi Gunawan	Infrastructure Engineer	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2027-01-25	f	Active	2026-08-27 13:11:21.27637+07	2026-08-27 14:58:32.906411+07
132	2026	8	Aug	13	Daniel D	Senior Change Management	7	Bank Jakarta (App Migration)	2	GS	GS	0.00	2026-01-01	2026-12-31	f	Active	2026-08-27 13:11:21.279709+07	2026-08-27 14:58:32.906966+07
133	2026	9	Sep	13	Daniel D	Senior Change Management	7	Bank Jakarta (App Migration)	2	GS	GS	0.00	2026-01-01	2026-12-31	f	Active	2026-08-27 13:11:21.280058+07	2026-08-27 14:58:32.907266+07
134	2026	10	Oct	13	Daniel D	Senior Change Management	7	Bank Jakarta (App Migration)	2	GS	GS	0.00	2026-01-01	2026-12-31	f	Active	2026-08-27 13:11:21.280408+07	2026-08-27 14:58:32.908241+07
135	2026	11	Nov	13	Daniel D	Senior Change Management	7	Bank Jakarta (App Migration)	2	GS	GS	0.00	2026-01-01	2026-12-31	f	Active	2026-08-27 13:11:21.280735+07	2026-08-27 14:58:32.908685+07
136	2026	12	Dec	13	Daniel D	Senior Change Management	7	Bank Jakarta (App Migration)	2	GS	GS	0.00	2026-01-01	2026-12-31	f	Active	2026-08-27 13:11:21.281079+07	2026-08-27 14:58:32.908908+07
169	2026	10	Oct	16	Putri Rizky N	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2026-11-06	f	Active	2026-08-27 13:11:21.290163+07	2026-08-27 14:58:32.912197+07
170	2026	11	Nov	16	Putri Rizky N	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2026-11-06	f	Active	2026-08-27 13:11:21.290402+07	2026-08-27 14:58:32.912432+07
178	2026	8	Aug	17	Akmal Al Haqq	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2026-11-06	f	Active	2026-08-27 13:11:21.29225+07	2026-08-27 14:58:32.912846+07
179	2026	9	Sep	17	Akmal Al Haqq	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2026-11-06	f	Active	2026-08-27 13:11:21.292469+07	2026-08-27 14:58:32.913092+07
180	2026	10	Oct	17	Akmal Al Haqq	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2026-11-06	f	Active	2026-08-27 13:11:21.292703+07	2026-08-27 14:58:32.9134+07
181	2026	11	Nov	17	Akmal Al Haqq	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2026-11-06	f	Active	2026-08-27 13:11:21.292951+07	2026-08-27 14:58:32.913635+07
189	2026	8	Aug	18	Muhammad Daffa Arviano Putra	Java BE (Senior)	8	Bank Jakarta (Corporat Web)	2	GS	GS	10750000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.295075+07	2026-08-27 14:58:32.913988+07
190	2026	9	Sep	18	Muhammad Daffa Arviano Putra	Java BE (Senior)	8	Bank Jakarta (Corporat Web)	2	GS	GS	10750000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.295294+07	2026-08-27 14:58:32.914259+07
191	2026	10	Oct	18	Muhammad Daffa Arviano Putra	Java BE (Senior)	8	Bank Jakarta (Corporat Web)	2	GS	GS	10750000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.295527+07	2026-08-27 14:58:32.914594+07
156	2026	9	Sep	15	Aura Sukma	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2027-01-20	f	Active	2026-08-27 13:11:21.286875+07	2026-08-27 14:58:32.910676+07
157	2026	10	Oct	15	Aura Sukma	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2027-01-20	f	Active	2026-08-27 13:11:21.287324+07	2026-08-27 14:58:32.910925+07
158	2026	11	Nov	15	Aura Sukma	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2027-01-20	f	Active	2026-08-27 13:11:21.287549+07	2026-08-27 14:58:32.911174+07
159	2026	12	Dec	15	Aura Sukma	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2027-01-20	f	Active	2026-08-27 13:11:21.287794+07	2026-08-27 14:58:32.911452+07
167	2026	8	Aug	16	Putri Rizky N	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2026-11-06	f	Active	2026-08-27 13:11:21.289698+07	2026-08-27 14:58:32.911729+07
168	2026	9	Sep	16	Putri Rizky N	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2026-11-06	f	Active	2026-08-27 13:11:21.28994+07	2026-08-27 14:58:32.911963+07
200	2026	9	Sep	19	Mohammad Radja Alyfa Amri	FE Developer (Senior)	8	Bank Jakarta (Corporat Web)	2	GS	GS	10750000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.29762+07	2026-08-27 14:58:32.915482+07
201	2026	10	Oct	19	Mohammad Radja Alyfa Amri	FE Developer (Senior)	8	Bank Jakarta (Corporat Web)	2	GS	GS	10750000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.297845+07	2026-08-27 14:58:32.915811+07
209	2026	8	Aug	20	Della Fitrisia	UI/UX Designer (Middle)	8	Bank Jakarta (Corporat Web)	2	GS	GS	9500000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.299658+07	2026-08-27 14:58:32.916345+07
210	2026	9	Sep	20	Della Fitrisia	UI/UX Designer (Middle)	8	Bank Jakarta (Corporat Web)	2	GS	GS	9500000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.299964+07	2026-08-27 14:58:32.916704+07
211	2026	10	Oct	20	Della Fitrisia	UI/UX Designer (Middle)	8	Bank Jakarta (Corporat Web)	2	GS	GS	9500000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.300227+07	2026-08-27 14:58:32.917029+07
219	2026	8	Aug	21	Putra Aditama	UI/UX Designer (Middle)	8	Bank Jakarta (Corporat Web)	2	GS	GS	10750000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.302226+07	2026-08-27 14:58:32.917509+07
220	2026	9	Sep	21	Putra Aditama	UI/UX Designer (Middle)	8	Bank Jakarta (Corporat Web)	2	GS	GS	10750000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.302447+07	2026-08-27 14:58:32.917798+07
221	2026	10	Oct	21	Putra Aditama	UI/UX Designer (Middle)	8	Bank Jakarta (Corporat Web)	2	GS	GS	10750000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.302674+07	2026-08-27 14:58:32.918076+07
229	2026	8	Aug	22	Ersa Andhini	Scrum Master	8	Bank Jakarta (Corporat Web)	2	GS	GS	10750000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.304402+07	2026-08-27 14:58:32.918554+07
231	2026	10	Oct	22	Ersa Andhini	Scrum Master	8	Bank Jakarta (Corporat Web)	2	GS	GS	10750000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.30487+07	2026-08-27 14:58:32.919086+07
239	2026	8	Aug	23	Khairul Pandunata	Business Analyst (Middle)	8	Bank Jakarta (Corporat Web)	2	GS	GS	8441493.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.306694+07	2026-08-27 14:58:32.919536+07
240	2026	9	Sep	23	Khairul Pandunata	Business Analyst (Middle)	8	Bank Jakarta (Corporat Web)	2	GS	GS	8441493.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.306929+07	2026-08-27 14:58:32.91981+07
241	2026	10	Oct	23	Khairul Pandunata	Business Analyst (Middle)	8	Bank Jakarta (Corporat Web)	2	GS	GS	8441493.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.307153+07	2026-08-27 14:58:32.920104+07
249	2026	8	Aug	24	Duwi Sulistianingsih - BA (Internal Aigen)	Business Analyst (Middle)	8	Bank Jakarta (Corporat Web)	2	GS	GS	5442000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.309107+07	2026-08-27 14:58:32.920647+07
250	2026	9	Sep	24	Duwi Sulistianingsih - BA (Internal Aigen)	Business Analyst (Middle)	8	Bank Jakarta (Corporat Web)	2	GS	GS	5442000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.309331+07	2026-08-27 14:58:32.920896+07
251	2026	10	Oct	24	Duwi Sulistianingsih - BA (Internal Aigen)	Business Analyst (Middle)	8	Bank Jakarta (Corporat Web)	2	GS	GS	5442000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.309544+07	2026-08-27 14:58:32.921129+07
259	2026	8	Aug	25	Nurullah - Scrum	Scrum Master	8	Bank Jakarta (Corporat Web)	2	GS	GS	16659228.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.311766+07	2026-08-27 14:58:32.9216+07
260	2026	9	Sep	25	Nurullah - Scrum	Scrum Master	8	Bank Jakarta (Corporat Web)	2	GS	GS	16659228.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.311987+07	2026-08-27 14:58:32.921856+07
261	2026	10	Oct	25	Nurullah - Scrum	Scrum Master	8	Bank Jakarta (Corporat Web)	2	GS	GS	16659228.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.312229+07	2026-08-27 14:58:32.922144+07
283	2026	12	Dec	27	M Januar (Internal Aigen)	Business Analyst (Middle)	9	Bank Jakarta (MB Vello)	1	AIGEN	AIGEN	7210000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.317636+07	2026-08-27 14:58:32.925131+07
291	2026	8	Aug	28	Fadilah Arifki	Fullstack Developer (Senior)	9	Bank Jakarta (MB Vello)	2	GS	GS	10750000.00	2026-01-01	2027-04-01	f	Active	2026-08-27 13:11:21.319545+07	2026-08-27 14:58:32.925419+07
292	2026	9	Sep	28	Fadilah Arifki	Fullstack Developer (Senior)	9	Bank Jakarta (MB Vello)	2	GS	GS	10750000.00	2026-01-01	2027-04-01	f	Active	2026-08-27 13:11:21.319783+07	2026-08-27 14:58:32.925691+07
293	2026	10	Oct	28	Fadilah Arifki	Fullstack Developer (Senior)	9	Bank Jakarta (MB Vello)	2	GS	GS	10750000.00	2026-01-01	2027-04-01	f	Active	2026-08-27 13:11:21.320014+07	2026-08-27 14:58:32.925971+07
294	2026	11	Nov	28	Fadilah Arifki	Fullstack Developer (Senior)	9	Bank Jakarta (MB Vello)	2	GS	GS	10750000.00	2026-01-01	2027-04-01	f	Active	2026-08-27 13:11:21.320243+07	2026-08-27 14:58:32.92647+07
295	2026	12	Dec	28	Fadilah Arifki	Fullstack Developer (Senior)	9	Bank Jakarta (MB Vello)	2	GS	GS	10750000.00	2026-01-01	2027-04-01	f	Active	2026-08-27 13:11:21.320473+07	2026-08-27 14:58:32.926769+07
269	2026	8	Aug	26	Kahfi Kurnia Aji	Java BE (Middle Senior)	8	Bank Jakarta (Corporat Web)	2	GS	GS	9500000.00	2026-01-01	2026-10-13	f	Active	2026-08-27 13:11:21.314116+07	2026-08-27 14:58:32.92272+07
270	2026	9	Sep	26	Kahfi Kurnia Aji	Java BE (Middle Senior)	8	Bank Jakarta (Corporat Web)	2	GS	GS	9500000.00	2026-01-01	2026-10-13	f	Active	2026-08-27 13:11:21.314374+07	2026-08-27 14:58:32.923024+07
271	2026	10	Oct	26	Kahfi Kurnia Aji	Java BE (Middle Senior)	8	Bank Jakarta (Corporat Web)	2	GS	GS	9500000.00	2026-01-01	2026-10-13	f	Active	2026-08-27 13:11:21.314596+07	2026-08-27 14:58:32.923261+07
279	2026	8	Aug	27	M Januar (Internal Aigen)	Business Analyst (Middle)	9	Bank Jakarta (MB Vello)	1	AIGEN	AIGEN	7210000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.316704+07	2026-08-27 14:58:32.923922+07
280	2026	9	Sep	27	M Januar (Internal Aigen)	Business Analyst (Middle)	9	Bank Jakarta (MB Vello)	1	AIGEN	AIGEN	7210000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.316935+07	2026-08-27 14:58:32.92426+07
281	2026	10	Oct	27	M Januar (Internal Aigen)	Business Analyst (Middle)	9	Bank Jakarta (MB Vello)	1	AIGEN	AIGEN	7210000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.317161+07	2026-08-27 14:58:32.924566+07
282	2026	11	Nov	27	M Januar (Internal Aigen)	Business Analyst (Middle)	9	Bank Jakarta (MB Vello)	1	AIGEN	AIGEN	7210000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.317402+07	2026-08-27 14:58:32.924827+07
317	2026	12	Dec	30	Ragil Aria Dewanto	Security Engineer	11	Bank Permata	3	NFT	NFT	11000000.00	2026-01-01	2027-08-14	f	Active	2026-08-27 13:11:21.325803+07	2026-08-27 14:58:32.929189+07
325	2026	8	Aug	31	Agma Setiawan	Security Engineer	11	Bank Permata	3	NFT	NFT	9482748.00	2026-01-01	2026-10-15	f	Active	2026-08-27 13:11:21.327676+07	2026-08-27 14:58:32.929451+07
326	2026	9	Sep	31	Agma Setiawan	Security Engineer	11	Bank Permata	3	NFT	NFT	9482748.00	2026-01-01	2026-10-15	f	Active	2026-08-27 13:11:21.327917+07	2026-08-27 14:58:32.929709+07
327	2026	10	Oct	31	Agma Setiawan	Security Engineer	11	Bank Permata	3	NFT	NFT	9482748.00	2026-01-01	2026-10-15	f	Active	2026-08-27 13:11:21.328159+07	2026-08-27 14:58:32.929945+07
335	2026	8	Aug	32	Deki Tri Rizmawan	Security Engineer	11	Bank Permata	3	NFT	NFT	10056338.00	2026-01-01	2027-03-23	f	Active	2026-08-27 13:11:21.330146+07	2026-08-27 14:58:32.930391+07
336	2026	9	Sep	32	Deki Tri Rizmawan	Security Engineer	11	Bank Permata	3	NFT	NFT	10056338.00	2026-01-01	2027-03-23	f	Active	2026-08-27 13:11:21.330462+07	2026-08-27 14:58:32.93064+07
337	2026	10	Oct	32	Deki Tri Rizmawan	Security Engineer	11	Bank Permata	3	NFT	NFT	10056338.00	2026-01-01	2027-03-23	f	Active	2026-08-27 13:11:21.331859+07	2026-08-27 14:58:32.930899+07
338	2026	11	Nov	32	Deki Tri Rizmawan	Security Engineer	11	Bank Permata	3	NFT	NFT	10056338.00	2026-01-01	2027-03-23	f	Active	2026-08-27 13:11:21.333044+07	2026-08-27 14:58:32.931147+07
339	2026	12	Dec	32	Deki Tri Rizmawan	Security Engineer	11	Bank Permata	3	NFT	NFT	10056338.00	2026-01-01	2027-03-23	f	Active	2026-08-27 13:11:21.333458+07	2026-08-27 14:58:32.931384+07
303	2026	8	Aug	29	Rajesh Rivalda	Monitoring Engineer	10	Bank OCBC	1	AIGEN	AIGEN	10713395.00	2026-01-01	2026-10-10	f	Active	2026-08-27 13:11:21.322441+07	2026-08-27 14:58:32.927034+07
304	2026	9	Sep	29	Rajesh Rivalda	Monitoring Engineer	10	Bank OCBC	1	AIGEN	AIGEN	10713395.00	2026-01-01	2026-10-10	f	Active	2026-08-27 13:11:21.322681+07	2026-08-27 14:58:32.927303+07
305	2026	10	Oct	29	Rajesh Rivalda	Monitoring Engineer	10	Bank OCBC	1	AIGEN	AIGEN	10713395.00	2026-01-01	2026-10-10	f	Active	2026-08-27 13:11:21.322904+07	2026-08-27 14:58:32.927606+07
313	2026	8	Aug	30	Ragil Aria Dewanto	Security Engineer	11	Bank Permata	3	NFT	NFT	11000000.00	2026-01-01	2027-08-14	f	Active	2026-08-27 13:11:21.324928+07	2026-08-27 14:58:32.928144+07
314	2026	9	Sep	30	Ragil Aria Dewanto	Security Engineer	11	Bank Permata	3	NFT	NFT	11000000.00	2026-01-01	2027-08-14	f	Active	2026-08-27 13:11:21.325154+07	2026-08-27 14:58:32.928414+07
315	2026	10	Oct	30	Ragil Aria Dewanto	Security Engineer	11	Bank Permata	3	NFT	NFT	11000000.00	2026-01-01	2027-08-14	f	Active	2026-08-27 13:11:21.325372+07	2026-08-27 14:58:32.928666+07
347	2026	8	Aug	33	Asep Supriyadi L2	L2 Security Engineer	11	Bank Permata	3	NFT	NFT	10713395.00	2026-01-01	2026-09-23	f	Active	2026-08-27 13:11:21.335551+07	2026-08-27 13:40:02.248108+07
348	2026	9	Sep	33	Asep Supriyadi L2	L2 Security Engineer	11	Bank Permata	3	NFT	NFT	10713395.00	2026-01-01	2026-09-23	f	Active	2026-08-27 13:11:21.33578+07	2026-08-27 13:40:02.248521+07
365	2026	8	Aug	35	Faudzan Adim	Security Engineer	11	Bank Permata	3	NFT	NFT	10056338.00	2026-01-01	2026-10-13	f	Active	2026-08-27 13:11:21.33976+07	2026-08-27 14:58:32.931633+07
366	2026	9	Sep	35	Faudzan Adim	Security Engineer	11	Bank Permata	3	NFT	NFT	10056338.00	2026-01-01	2026-10-13	f	Active	2026-08-27 13:11:21.340034+07	2026-08-27 14:58:32.931916+07
367	2026	10	Oct	35	Faudzan Adim	Security Engineer	11	Bank Permata	3	NFT	NFT	10056338.00	2026-01-01	2026-10-13	f	Active	2026-08-27 13:11:21.34049+07	2026-08-27 14:58:32.932329+07
375	2026	8	Aug	36	Chandra Farizka	Security Engineer	11	Bank Permata	3	NFT	NFT	8405962.00	2026-01-01	29 Des 2026	f	Active	2026-08-27 13:11:21.342392+07	2026-08-27 14:58:32.933063+07
376	2026	9	Sep	36	Chandra Farizka	Security Engineer	11	Bank Permata	3	NFT	NFT	8405962.00	2026-01-01	29 Des 2026	f	Active	2026-08-27 13:11:21.342684+07	2026-08-27 14:58:32.933464+07
377	2026	10	Oct	36	Chandra Farizka	Security Engineer	11	Bank Permata	3	NFT	NFT	8405962.00	2026-01-01	29 Des 2026	f	Active	2026-08-27 13:11:21.342941+07	2026-08-27 14:58:32.933759+07
378	2026	11	Nov	36	Chandra Farizka	Security Engineer	11	Bank Permata	3	NFT	NFT	8405962.00	2026-01-01	29 Des 2026	f	Active	2026-08-27 13:11:21.343184+07	2026-08-27 14:58:32.934113+07
356	2026	8	Aug	34	Asep Supriyadi	L2 Security Engineer	11	Bank Permata	3	NFT	NFT	11296249.00	2026-01-01	2026-09-23	f	Active	2026-08-27 13:11:21.337689+07	2026-08-27 14:58:32.948001+07
357	2026	9	Sep	34	Asep Supriyadi	L2 Security Engineer	11	Bank Permata	3	NFT	NFT	11296249.00	2026-01-01	2026-09-23	f	Active	2026-08-27 13:11:21.337912+07	2026-08-27 14:58:32.948299+07
390	2026	11	Nov	37	Yoga Ajiputro Sapakoly	Security Engineer	11	Bank Permata	3	NFT	NFT	10713395.00	2026-01-01	2027-01-10	f	Active	2026-08-27 13:11:21.346135+07	2026-08-27 14:58:32.935509+07
391	2026	12	Dec	37	Yoga Ajiputro Sapakoly	Security Engineer	11	Bank Permata	3	NFT	NFT	10713395.00	2026-01-01	2027-01-10	f	Active	2026-08-27 13:11:21.346366+07	2026-08-27 14:58:32.935803+07
399	2026	8	Aug	38	Faried Abimanyu Bhakti Nusantara	Security Engineer	11	Bank Permata	3	NFT	NFT	8926054.00	2026-01-01	2027-01-21	f	Active	2026-08-27 13:11:21.3484+07	2026-08-27 14:58:32.936074+07
400	2026	9	Sep	38	Faried Abimanyu Bhakti Nusantara	Security Engineer	11	Bank Permata	3	NFT	NFT	8926054.00	2026-01-01	2027-01-21	f	Active	2026-08-27 13:11:21.348642+07	2026-08-27 14:58:32.93637+07
401	2026	10	Oct	38	Faried Abimanyu Bhakti Nusantara	Security Engineer	11	Bank Permata	3	NFT	NFT	8926054.00	2026-01-01	2027-01-21	f	Active	2026-08-27 13:11:21.348856+07	2026-08-27 14:58:32.936651+07
402	2026	11	Nov	38	Faried Abimanyu Bhakti Nusantara	Security Engineer	11	Bank Permata	3	NFT	NFT	8926054.00	2026-01-01	2027-01-21	f	Active	2026-08-27 13:11:21.349061+07	2026-08-27 14:58:32.936907+07
403	2026	12	Dec	38	Faried Abimanyu Bhakti Nusantara	Security Engineer	11	Bank Permata	3	NFT	NFT	8926054.00	2026-01-01	2027-01-21	f	Active	2026-08-27 13:11:21.349294+07	2026-08-27 14:58:32.937154+07
411	2026	8	Aug	39	Sukma Wijaya	Security Engineer	11	Bank Permata	3	NFT	NFT	10056338.00	2026-01-01	2027-02-08	f	Active	2026-08-27 13:11:21.351248+07	2026-08-27 14:58:32.937403+07
412	2026	9	Sep	39	Sukma Wijaya	Security Engineer	11	Bank Permata	3	NFT	NFT	10056338.00	2026-01-01	2027-02-08	f	Active	2026-08-27 13:11:21.351507+07	2026-08-27 14:58:32.937652+07
413	2026	10	Oct	39	Sukma Wijaya	Security Engineer	11	Bank Permata	3	NFT	NFT	10056338.00	2026-01-01	2027-02-08	f	Active	2026-08-27 13:11:21.351731+07	2026-08-27 14:58:32.937895+07
414	2026	11	Nov	39	Sukma Wijaya	Security Engineer	11	Bank Permata	3	NFT	NFT	10056338.00	2026-01-01	2027-02-08	f	Active	2026-08-27 13:11:21.351951+07	2026-08-27 14:58:32.938137+07
415	2026	12	Dec	39	Sukma Wijaya	Security Engineer	11	Bank Permata	3	NFT	NFT	10056338.00	2026-01-01	2027-02-08	f	Active	2026-08-27 13:11:21.352174+07	2026-08-27 14:58:32.938373+07
458	2026	8	Aug	44	Hafizh Shiba	Security Engineer	11	Bank Permata	3	NFT	NFT	6789705.00	2026-01-01	2027-03-27	f	Active	2026-08-27 13:11:21.363333+07	2026-08-27 14:58:32.943678+07
387	2026	8	Aug	37	Yoga Ajiputro Sapakoly	Security Engineer	11	Bank Permata	3	NFT	NFT	10713395.00	2026-01-01	2027-01-10	f	Active	2026-08-27 13:11:21.345404+07	2026-08-27 14:58:32.934683+07
388	2026	9	Sep	37	Yoga Ajiputro Sapakoly	Security Engineer	11	Bank Permata	3	NFT	NFT	10713395.00	2026-01-01	2027-01-10	f	Active	2026-08-27 13:11:21.345655+07	2026-08-27 14:58:32.934944+07
389	2026	10	Oct	37	Yoga Ajiputro Sapakoly	Security Engineer	11	Bank Permata	3	NFT	NFT	10713395.00	2026-01-01	2027-01-10	f	Active	2026-08-27 13:11:21.345896+07	2026-08-27 14:58:32.935192+07
438	2026	11	Nov	41	Nor Alip	Security Engineer	11	Bank Permata	3	NFT	NFT	10713395.00	2026-01-01	2026-11-13	f	Active	2026-08-27 13:11:21.358279+07	2026-08-27 14:58:32.940902+07
446	2026	8	Aug	42	Fatma Rahma W	Security Engineer	11	Bank Permata	3	NFT	NFT	5442000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.360245+07	2026-08-27 14:58:32.941424+07
447	2026	9	Sep	42	Fatma Rahma W	Security Engineer	11	Bank Permata	3	NFT	NFT	5442000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.360488+07	2026-08-27 14:58:32.941694+07
448	2026	10	Oct	42	Fatma Rahma W	Security Engineer	11	Bank Permata	3	NFT	NFT	5442000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.360752+07	2026-08-27 14:58:32.941966+07
449	2026	11	Nov	42	Fatma Rahma W	Security Engineer	11	Bank Permata	3	NFT	NFT	5442000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.361003+07	2026-08-27 14:58:32.942235+07
450	2026	12	Dec	42	Fatma Rahma W	Security Engineer	11	Bank Permata	3	NFT	NFT	5442000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.361235+07	2026-08-27 14:58:32.942491+07
423	2026	8	Aug	40	Arrumaisha Ruhama Nafisah	Security Engineer	11	Bank Permata	3	NFT	NFT	10700165.00	2026-01-01	2027-06-10	f	Active	2026-08-27 13:11:21.354057+07	2026-08-27 14:58:32.938623+07
424	2026	9	Sep	40	Arrumaisha Ruhama Nafisah	Security Engineer	11	Bank Permata	3	NFT	NFT	10700165.00	2026-01-01	2027-06-10	f	Active	2026-08-27 13:11:21.354576+07	2026-08-27 14:58:32.938875+07
425	2026	10	Oct	40	Arrumaisha Ruhama Nafisah	Security Engineer	11	Bank Permata	3	NFT	NFT	10700165.00	2026-01-01	2027-06-10	f	Active	2026-08-27 13:11:21.354853+07	2026-08-27 14:58:32.939125+07
426	2026	11	Nov	40	Arrumaisha Ruhama Nafisah	Security Engineer	11	Bank Permata	3	NFT	NFT	10700165.00	2026-01-01	2027-06-10	f	Active	2026-08-27 13:11:21.355258+07	2026-08-27 14:58:32.939372+07
427	2026	12	Dec	40	Arrumaisha Ruhama Nafisah	Security Engineer	11	Bank Permata	3	NFT	NFT	10700165.00	2026-01-01	2027-06-10	f	Active	2026-08-27 13:11:21.355509+07	2026-08-27 14:58:32.939605+07
435	2026	8	Aug	41	Nor Alip	Security Engineer	11	Bank Permata	3	NFT	NFT	10713395.00	2026-01-01	2026-11-13	f	Active	2026-08-27 13:11:21.357532+07	2026-08-27 14:58:32.939849+07
436	2026	9	Sep	41	Nor Alip	Security Engineer	11	Bank Permata	3	NFT	NFT	10713395.00	2026-01-01	2026-11-13	f	Active	2026-08-27 13:11:21.357781+07	2026-08-27 14:58:32.940112+07
437	2026	10	Oct	41	Nor Alip	Security Engineer	11	Bank Permata	3	NFT	NFT	10713395.00	2026-01-01	2026-11-13	f	Active	2026-08-27 13:11:21.358031+07	2026-08-27 14:58:32.940467+07
471	2026	9	Sep	45	Arrico Hardyanto	Middle BE Engineer	12	HIBANK	1	AIGEN	AIGEN	12524067.00	2026-01-01	2027-07-27	f	Active	2026-08-27 13:11:21.366612+07	2026-08-27 14:58:32.945261+07
472	2026	10	Oct	45	Arrico Hardyanto	Middle BE Engineer	12	HIBANK	1	AIGEN	AIGEN	12524067.00	2026-01-01	2027-07-27	f	Active	2026-08-27 13:11:21.366857+07	2026-08-27 14:58:32.94553+07
473	2026	11	Nov	45	Arrico Hardyanto	Middle BE Engineer	12	HIBANK	1	AIGEN	AIGEN	12524067.00	2026-01-01	2027-07-27	f	Active	2026-08-27 13:11:21.367094+07	2026-08-27 14:58:32.94578+07
474	2026	12	Dec	45	Arrico Hardyanto	Middle BE Engineer	12	HIBANK	1	AIGEN	AIGEN	12524067.00	2026-01-01	2027-07-27	f	Active	2026-08-27 13:11:21.367339+07	2026-08-27 14:58:32.946023+07
482	2026	8	Aug	46	Tahir Shadaqat Ahmad	Middle webMethods	12	HIBANK	1	AIGEN	AIGEN	14297210.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.369349+07	2026-08-27 14:58:32.946275+07
483	2026	9	Sep	46	Tahir Shadaqat Ahmad	Middle webMethods	12	HIBANK	1	AIGEN	AIGEN	14297210.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.369596+07	2026-08-27 14:58:32.946614+07
484	2026	10	Oct	46	Tahir Shadaqat Ahmad	Middle webMethods	12	HIBANK	1	AIGEN	AIGEN	14297210.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.369827+07	2026-08-27 14:58:32.946958+07
485	2026	11	Nov	46	Tahir Shadaqat Ahmad	Middle webMethods	12	HIBANK	1	AIGEN	AIGEN	14297210.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.370073+07	2026-08-27 14:58:32.947312+07
486	2026	12	Dec	46	Tahir Shadaqat Ahmad	Middle webMethods	12	HIBANK	1	AIGEN	AIGEN	14297210.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.37033+07	2026-08-27 14:58:32.947678+07
494	2026	8	Aug	55	Zhiddan P	Middle DevOps	13	INTERNAL - SOC	2	GS	GS	11986097.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.372471+07	2026-08-27 14:58:32.94926+07
496	2026	10	Oct	55	Zhiddan P	Middle DevOps	13	INTERNAL - SOC	2	GS	GS	11986097.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.372983+07	2026-08-27 14:58:32.949961+07
497	2026	11	Nov	55	Zhiddan P	Middle DevOps	13	INTERNAL - SOC	2	GS	GS	11986097.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.373225+07	2026-08-27 14:58:32.95031+07
498	2026	12	Dec	55	Zhiddan P	Middle DevOps	13	INTERNAL - SOC	2	GS	GS	11986097.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.373464+07	2026-08-27 14:58:32.950602+07
460	2026	10	Oct	44	Hafizh Shiba	Security Engineer	11	Bank Permata	3	NFT	NFT	6789705.00	2026-01-01	2027-03-27	f	Active	2026-08-27 13:11:21.363832+07	2026-08-27 14:58:32.944236+07
461	2026	11	Nov	44	Hafizh Shiba	Security Engineer	11	Bank Permata	3	NFT	NFT	6789705.00	2026-01-01	2027-03-27	f	Active	2026-08-27 13:11:21.364075+07	2026-08-27 14:58:32.944501+07
462	2026	12	Dec	44	Hafizh Shiba	Security Engineer	11	Bank Permata	3	NFT	NFT	6789705.00	2026-01-01	2027-03-27	f	Active	2026-08-27 13:11:21.364308+07	2026-08-27 14:58:32.944768+07
470	2026	8	Aug	45	Arrico Hardyanto	Middle BE Engineer	12	HIBANK	1	AIGEN	AIGEN	12524067.00	2026-01-01	2027-07-27	f	Active	2026-08-27 13:11:21.366364+07	2026-08-27 14:58:32.945018+07
506	2026	8	Aug	56	Danu Prasetyo	Mandiri Ansible	14	TELKOMSEL FOSS	2	GS	GS	9000000.00	2026-01-01	2027-01-26	f	Active	2026-08-27 13:11:21.375514+07	2026-08-27 14:58:32.958759+07
507	2026	9	Sep	56	Danu Prasetyo	Mandiri Ansible	14	TELKOMSEL FOSS	2	GS	GS	9000000.00	2026-01-01	2027-01-26	f	Active	2026-08-27 13:11:21.375745+07	2026-08-27 14:58:32.95906+07
508	2026	10	Oct	56	Danu Prasetyo	Mandiri Ansible	14	TELKOMSEL FOSS	2	GS	GS	9000000.00	2026-01-01	2027-01-26	f	Active	2026-08-27 13:11:21.375976+07	2026-08-27 14:58:32.959395+07
509	2026	11	Nov	56	Danu Prasetyo	Mandiri Ansible	14	TELKOMSEL FOSS	2	GS	GS	9000000.00	2026-01-01	2027-01-26	f	Active	2026-08-27 13:11:21.376231+07	2026-08-27 14:58:32.959675+07
510	2026	12	Dec	56	Danu Prasetyo	Mandiri Ansible	14	TELKOMSEL FOSS	2	GS	GS	9000000.00	2026-01-01	2027-01-26	f	Active	2026-08-27 13:11:21.376459+07	2026-08-27 14:58:32.959949+07
529	2026	8	Aug	59	Alfian Widitama	Senior Frontend Developer	14	TELKOMSEL FOSS	2	GS	GS	9550000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.381182+07	2026-08-27 14:58:32.954789+07
530	2026	9	Sep	59	Alfian Widitama	Senior Frontend Developer	14	TELKOMSEL FOSS	2	GS	GS	9550000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.381407+07	2026-08-27 14:58:32.955117+07
531	2026	10	Oct	59	Alfian Widitama	Senior Frontend Developer	14	TELKOMSEL FOSS	2	GS	GS	9550000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.381632+07	2026-08-27 14:58:32.955416+07
532	2026	11	Nov	59	Alfian Widitama	Senior Frontend Developer	14	TELKOMSEL FOSS	2	GS	GS	9550000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.381856+07	2026-08-27 14:58:32.955694+07
533	2026	12	Dec	59	Alfian Widitama	Senior Frontend Developer	14	TELKOMSEL FOSS	2	GS	GS	9550000.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.382073+07	2026-08-27 14:58:32.956039+07
518	2026	8	Aug	58	Iqbal Pradipta	Junior Backend	14	TELKOMSEL FOSS	2	GS	GS	5442000.00	2026-01-01	2026-11-05	f	Active	2026-08-27 13:11:21.378384+07	2026-08-27 14:58:32.956333+07
519	2026	9	Sep	58	Iqbal Pradipta	Junior Backend	14	TELKOMSEL FOSS	2	GS	GS	5442000.00	2026-01-01	2026-11-05	f	Active	2026-08-27 13:11:21.378624+07	2026-08-27 14:58:32.956612+07
520	2026	10	Oct	58	Iqbal Pradipta	Junior Backend	14	TELKOMSEL FOSS	2	GS	GS	5442000.00	2026-01-01	2026-11-05	f	Active	2026-08-27 13:11:21.379028+07	2026-08-27 14:58:32.956889+07
521	2026	11	Nov	58	Iqbal Pradipta	Junior Backend	14	TELKOMSEL FOSS	2	GS	GS	5442000.00	2026-01-01	2026-11-05	f	Active	2026-08-27 13:11:21.379265+07	2026-08-27 14:58:32.957208+07
552	2026	9	Sep	61	Ivan Habibi	Senior DevOps	15	TELKOMSEL IDP	1	AIGEN	AIGEN	11986097.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.386884+07	2026-08-27 14:58:32.952294+07
553	2026	10	Oct	61	Ivan Habibi	Senior DevOps	15	TELKOMSEL IDP	1	AIGEN	AIGEN	11986097.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.387142+07	2026-08-27 14:58:32.9526+07
554	2026	11	Nov	61	Ivan Habibi	Senior DevOps	15	TELKOMSEL IDP	1	AIGEN	AIGEN	11986097.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.387365+07	2026-08-27 14:58:32.952875+07
555	2026	12	Dec	61	Ivan Habibi	Senior DevOps	15	TELKOMSEL IDP	1	AIGEN	AIGEN	11986097.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.387605+07	2026-08-27 14:58:32.953169+07
563	2026	8	Aug	62	Saiful Wardi	Backend Dev	15	TELKOMSEL IDP	2	GS	GS	11986097.00	2026-01-01	2027-01-29	f	Active	2026-08-27 13:11:21.389527+07	2026-08-27 14:58:32.95342+07
564	2026	9	Sep	62	Saiful Wardi	Backend Dev	15	TELKOMSEL IDP	2	GS	GS	11986097.00	2026-01-01	2027-01-29	f	Active	2026-08-27 13:11:21.389769+07	2026-08-27 14:58:32.953675+07
565	2026	10	Oct	62	Saiful Wardi	Backend Dev	15	TELKOMSEL IDP	2	GS	GS	11986097.00	2026-01-01	2027-01-29	f	Active	2026-08-27 13:11:21.390005+07	2026-08-27 14:58:32.953948+07
566	2026	11	Nov	62	Saiful Wardi	Backend Dev	15	TELKOMSEL IDP	2	GS	GS	11986097.00	2026-01-01	2027-01-29	f	Active	2026-08-27 13:11:21.390288+07	2026-08-27 14:58:32.954197+07
567	2026	12	Dec	62	Saiful Wardi	Backend Dev	15	TELKOMSEL IDP	2	GS	GS	11986097.00	2026-01-01	2027-01-29	f	Active	2026-08-27 13:11:21.390527+07	2026-08-27 14:58:32.95444+07
575	2026	8	Aug	63	Asep Khairul A	Senior Fullstack Developer	15	TELKOMSEL IDP	2	GS	GS	9289722.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.392442+07	2026-08-27 14:58:32.969173+07
576	2026	9	Sep	63	Asep Khairul A	Senior Fullstack Developer	15	TELKOMSEL IDP	2	GS	GS	9289722.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.392661+07	2026-08-27 14:58:32.969428+07
577	2026	10	Oct	63	Asep Khairul A	Senior Fullstack Developer	15	TELKOMSEL IDP	2	GS	GS	9289722.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.392893+07	2026-08-27 14:58:32.969695+07
578	2026	11	Nov	63	Asep Khairul A	Senior Fullstack Developer	15	TELKOMSEL IDP	2	GS	GS	9289722.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.393109+07	2026-08-27 14:58:32.969927+07
579	2026	12	Dec	63	Asep Khairul A	Senior Fullstack Developer	15	TELKOMSEL IDP	2	GS	GS	9289722.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.393333+07	2026-08-27 14:58:32.970173+07
542	2026	9	Sep	60	Falyan Zuril	Middle DevOps	15	TELKOMSEL IDP	2	GS	GS	6500000.00	2026-01-01	2026-10-27	f	Active	2026-08-27 13:11:21.384325+07	2026-08-27 14:58:32.951191+07
543	2026	10	Oct	60	Falyan Zuril	Middle DevOps	15	TELKOMSEL IDP	2	GS	GS	6500000.00	2026-01-01	2026-10-27	f	Active	2026-08-27 13:11:21.384575+07	2026-08-27 14:58:32.9515+07
551	2026	8	Aug	61	Ivan Habibi	Senior DevOps	15	TELKOMSEL IDP	1	AIGEN	AIGEN	11986097.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.386644+07	2026-08-27 14:58:32.951997+07
601	2026	10	Oct	65	Anval H	Middle Fullstack Developer *	15	TELKOMSEL IDP	2	GS	GS	7335074.00	2026-01-01	2027-01-15	f	Active	2026-08-27 13:11:21.399354+07	2026-08-27 14:58:32.966954+07
602	2026	11	Nov	65	Anval H	Middle Fullstack Developer *	15	TELKOMSEL IDP	2	GS	GS	7335074.00	2026-01-01	2027-01-15	f	Active	2026-08-27 13:11:21.399601+07	2026-08-27 14:58:32.967241+07
603	2026	12	Dec	65	Anval H	Middle Fullstack Developer *	15	TELKOMSEL IDP	2	GS	GS	7335074.00	2026-01-01	2027-01-15	f	Active	2026-08-27 13:11:21.39983+07	2026-08-27 14:58:32.967519+07
587	2026	8	Aug	64	Aris M	Middle Frontend Developer *	15	TELKOMSEL IDP	2	GS	GS	8414368.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.395593+07	2026-08-27 14:58:32.967818+07
588	2026	9	Sep	64	Aris M	Middle Frontend Developer *	15	TELKOMSEL IDP	2	GS	GS	8414368.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.395842+07	2026-08-27 14:58:32.968111+07
589	2026	10	Oct	64	Aris M	Middle Frontend Developer *	15	TELKOMSEL IDP	2	GS	GS	8414368.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.396188+07	2026-08-27 14:58:32.968385+07
590	2026	11	Nov	64	Aris M	Middle Frontend Developer *	15	TELKOMSEL IDP	2	GS	GS	8414368.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.396569+07	2026-08-27 14:58:32.968631+07
591	2026	12	Dec	64	Aris M	Middle Frontend Developer *	15	TELKOMSEL IDP	2	GS	GS	8414368.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.396805+07	2026-08-27 14:58:32.968892+07
611	2026	8	Aug	66	Sutrisno	Middle DevOps	16	TELKOMSEL TEM	2	GS	GS	9482748.00	2026-01-01	2027-01-06	f	Active	2026-08-27 13:11:21.401762+07	2026-08-27 14:58:32.964847+07
612	2026	9	Sep	66	Sutrisno	Middle DevOps	16	TELKOMSEL TEM	2	GS	GS	9482748.00	2026-01-01	2027-01-06	f	Active	2026-08-27 13:11:21.401991+07	2026-08-27 14:58:32.965135+07
613	2026	10	Oct	66	Sutrisno	Middle DevOps	16	TELKOMSEL TEM	2	GS	GS	9482748.00	2026-01-01	2027-01-06	f	Active	2026-08-27 13:11:21.402436+07	2026-08-27 14:58:32.965437+07
614	2026	11	Nov	66	Sutrisno	Middle DevOps	16	TELKOMSEL TEM	2	GS	GS	9482748.00	2026-01-01	2027-01-06	f	Active	2026-08-27 13:11:21.402683+07	2026-08-27 14:58:32.965803+07
615	2026	12	Dec	66	Sutrisno	Middle DevOps	16	TELKOMSEL TEM	2	GS	GS	9482748.00	2026-01-01	2027-01-06	f	Active	2026-08-27 13:11:21.402924+07	2026-08-27 14:58:32.966086+07
599	2026	8	Aug	65	Anval H	Middle Fullstack Developer *	15	TELKOMSEL IDP	2	GS	GS	7335074.00	2026-01-01	2027-01-15	f	Active	2026-08-27 13:11:21.398867+07	2026-08-27 14:58:32.966402+07
600	2026	9	Sep	65	Anval H	Middle Fullstack Developer *	15	TELKOMSEL IDP	2	GS	GS	7335074.00	2026-01-01	2027-01-15	f	Active	2026-08-27 13:11:21.3991+07	2026-08-27 14:58:32.966691+07
124	2026	12	Dec	12	Fendi Gunawan	Infrastructure Engineer	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2027-01-25	f	Active	2026-08-27 13:11:21.276713+07	2026-08-27 14:58:32.906684+07
155	2026	8	Aug	15	Aura Sukma	QA	7	Bank Jakarta (App Migration)	2	GS	GS	10750000.00	2026-01-01	2027-01-20	f	Active	2026-08-27 13:11:21.286625+07	2026-08-27 14:58:32.910418+07
646	2026	8	Aug	69	Widianingrum	Middle QA Tester/ Engineer	16	TELKOMSEL TEM	1	AIGEN	AIGEN	8926054.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.410676+07	2026-08-27 14:58:32.960239+07
647	2026	9	Sep	69	Widianingrum	Middle QA Tester/ Engineer	16	TELKOMSEL TEM	1	AIGEN	AIGEN	8926054.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.410903+07	2026-08-27 14:58:32.960511+07
648	2026	10	Oct	69	Widianingrum	Middle QA Tester/ Engineer	16	TELKOMSEL TEM	1	AIGEN	AIGEN	8926054.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.411129+07	2026-08-27 14:58:32.960782+07
649	2026	11	Nov	69	Widianingrum	Middle QA Tester/ Engineer	16	TELKOMSEL TEM	1	AIGEN	AIGEN	8926054.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.411355+07	2026-08-27 14:58:32.961056+07
650	2026	12	Dec	69	Widianingrum	Middle QA Tester/ Engineer	16	TELKOMSEL TEM	1	AIGEN	AIGEN	8926054.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.411571+07	2026-08-27 14:58:32.961347+07
634	2026	8	Aug	68	Rifqi Darmawan	Senior Mobile / Fullstack Developer	16	TELKOMSEL TEM	2	GS	GS	11942490.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.407696+07	2026-08-27 14:58:32.961649+07
635	2026	9	Sep	68	Rifqi Darmawan	Senior Mobile / Fullstack Developer	16	TELKOMSEL TEM	2	GS	GS	11942490.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.407943+07	2026-08-27 14:58:32.961937+07
636	2026	10	Oct	68	Rifqi Darmawan	Senior Mobile / Fullstack Developer	16	TELKOMSEL TEM	2	GS	GS	11942490.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.408187+07	2026-08-27 14:58:32.962219+07
637	2026	11	Nov	68	Rifqi Darmawan	Senior Mobile / Fullstack Developer	16	TELKOMSEL TEM	2	GS	GS	11942490.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.408416+07	2026-08-27 14:58:32.962488+07
638	2026	12	Dec	68	Rifqi Darmawan	Senior Mobile / Fullstack Developer	16	TELKOMSEL TEM	2	GS	GS	11942490.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.408642+07	2026-08-27 14:58:32.962799+07
623	2026	8	Aug	67	Athallah Andi	Junior DevOps	16	TELKOMSEL TEM	2	GS	GS	5442000.00	2026-01-01	2026-11-04	f	Active	2026-08-27 13:11:21.404972+07	2026-08-27 14:58:32.963302+07
624	2026	9	Sep	67	Athallah Andi	Junior DevOps	16	TELKOMSEL TEM	2	GS	GS	5442000.00	2026-01-01	2026-11-04	f	Active	2026-08-27 13:11:21.40523+07	2026-08-27 14:58:32.963826+07
625	2026	10	Oct	67	Athallah Andi	Junior DevOps	16	TELKOMSEL TEM	2	GS	GS	5442000.00	2026-01-01	2026-11-04	f	Active	2026-08-27 13:11:21.405486+07	2026-08-27 14:58:32.964147+07
626	2026	11	Nov	67	Athallah Andi	Junior DevOps	16	TELKOMSEL TEM	2	GS	GS	5442000.00	2026-01-01	2026-11-04	f	Active	2026-08-27 13:11:21.40572+07	2026-08-27 14:58:32.96444+07
41	2026	9	Sep	4	Ahri Maulana	Webmethods Developer	3	Bank Indonesia APIM	2	GS	GS	7331379.00	2026-01-01	2026-10-28	f	Active	2026-08-27 13:11:21.242206+07	2026-08-27 14:58:32.896095+07
199	2026	8	Aug	19	Mohammad Radja Alyfa Amri	FE Developer (Senior)	8	Bank Jakarta (Corporat Web)	2	GS	GS	10750000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.297373+07	2026-08-27 14:58:32.915108+07
230	2026	9	Sep	22	Ersa Andhini	Scrum Master	8	Bank Jakarta (Corporat Web)	2	GS	GS	10750000.00	2026-01-01	2026-10-06	f	Active	2026-08-27 13:11:21.304621+07	2026-08-27 14:58:32.91882+07
316	2026	11	Nov	30	Ragil Aria Dewanto	Security Engineer	11	Bank Permata	3	NFT	NFT	11000000.00	2026-01-01	2027-08-14	f	Active	2026-08-27 13:11:21.325598+07	2026-08-27 14:58:32.928944+07
379	2026	12	Dec	36	Chandra Farizka	Security Engineer	11	Bank Permata	3	NFT	NFT	8405962.00	2026-01-01	29 Des 2026	f	Active	2026-08-27 13:11:21.343426+07	2026-08-27 14:58:32.934403+07
459	2026	9	Sep	44	Hafizh Shiba	Security Engineer	11	Bank Permata	3	NFT	NFT	6789705.00	2026-01-01	2027-03-27	f	Active	2026-08-27 13:11:21.363578+07	2026-08-27 14:58:32.943947+07
495	2026	9	Sep	55	Zhiddan P	Middle DevOps	13	INTERNAL - SOC	2	GS	GS	11986097.00	Permanent	Permanent	t	Active	2026-08-27 13:11:21.372729+07	2026-08-27 14:58:32.949609+07
541	2026	8	Aug	60	Falyan Zuril	Middle DevOps	15	TELKOMSEL IDP	2	GS	GS	6500000.00	2026-01-01	2026-10-27	f	Active	2026-08-27 13:11:21.384055+07	2026-08-27 14:58:32.950888+07
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.audit_logs (id, action, entity, entity_id, summary, details, performed_by, ip_address, created_at) FROM stdin;
1	LOGIN	Auth	1	User Randy Farhan berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	127.0.0.1	2026-08-13 14:09:05.545625+07
2	CREATE	Employee	1	Menambahkan karyawan baru: Ahmad Fauzi (Senior Backend Engineer)	{"name":"Ahmad Fauzi","role":"Senior Backend Engineer","customer":"PT Bank Central Asia Tbk","gross_salary":15000000}	admin	127.0.0.1	2026-08-13 14:09:05.545625+07
3	UPDATE	Employee	2	Mengubah alokasi penempatan Siti Rahmawati ke PT Bank Central Asia Tbk	{"field":"id_customer","old":null,"new":1}	admin	127.0.0.1	2026-08-13 14:09:05.545625+07
4	STATUS_CHANGE	Employee	15	Mengubah status karyawan Joko Susilo menjadi Resign	{"old_status":"Active","new_status":"Resign"}	admin	127.0.0.1	2026-08-13 14:09:05.545625+07
5	CREATE	Customer	1	Menambahkan customer bank baru: PT Bank Central Asia Tbk	{"customer_name":"PT Bank Central Asia Tbk","start_contract":"2025-01-01","end_contract":"2027-12-31"}	admin	127.0.0.1	2026-08-13 14:09:05.545625+07
6	UPDATE	PersonalNote	2	Memperbarui acuan gaji Net Salary Rp 5.000.000,00	{"net_salary":5000000,"tk0_k0":5154639,"k1_k2":5154639}	admin	127.0.0.1	2026-08-13 14:09:05.545625+07
7	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 14:09:09.530185+07
8	STATUS_CHANGE	Employee	11	Mengubah status karyawan Ida Ayu Prima Utami Anissa Wijayanti dari Active menjadi Resign	{"name":"Ida Ayu Prima Utami Anissa Wijayanti","status":"Resign","gross":6789705.00}	admin	::1	2026-08-13 14:14:14.023987+07
9	UPDATE	Employee	50	Mengubah data karyawan: Tefa Arya G	{"name":"Tefa Arya G","status":"Active","gross":11986097.00}	admin	::1	2026-08-13 14:14:39.023758+07
10	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 14:18:09.004437+07
11	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 14:21:54.139382+07
12	STATUS_CHANGE	Employee	159	Mengubah status karyawan Saiful W L dari Active menjadi Resign	{"name":"Saiful W L","status":"Resign","gross":0.00}	admin	::1	2026-08-13 14:21:54.191694+07
13	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 14:21:58.007714+07
14	STATUS_CHANGE	Employee	159	Mengubah status karyawan Saiful W L dari Resign menjadi Active	{"name":"Saiful W L","status":"Active","gross":0.00}	admin	::1	2026-08-13 14:21:58.028666+07
15	STATUS_CHANGE	Employee	117	Mengubah status karyawan Ida Ayu Prima Utami Anissa Wijayanti dari Active menjadi Resign	{"name":"Ida Ayu Prima Utami Anissa Wijayanti","status":"Resign","gross":6789705.00}	admin	::1	2026-08-13 14:22:37.890169+07
16	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 14:27:02.870202+07
17	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 14:27:07.599084+07
18	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 14:27:18.793123+07
19	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 14:29:00.098523+07
20	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 14:33:28.013959+07
21	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 15:41:32.097627+07
22	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 15:41:59.878035+07
23	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 15:42:09.884586+07
24	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 15:43:05.582964+07
25	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 15:43:07.794774+07
26	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-13 15:43:13.239473+07
27	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-14 09:30:14.137746+07
28	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-15 13:38:51.957165+07
29	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-18 10:36:15.623478+07
30	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	127.0.0.1	2026-08-26 13:26:42.289948+07
31	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-26 13:27:03.171674+07
32	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-27 12:58:55.052692+07
33	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-27 13:12:20.364263+07
34	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-27 13:15:01.950711+07
35	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-27 13:15:04.906629+07
36	CREATE	Employee	70	Menambahkan karyawan baru: dummy employee 2 (Senior QA Tester)	{"name":"dummy employee 2","role":"Senior QA Tester","gross":12000000.00}	admin	::1	2026-08-27 13:15:04.914034+07
37	UPDATE	Employee	70	Mengubah data karyawan: dummy employee 2	{"name":"dummy employee 2","status":"Active","gross":12000000.00}	admin	::1	2026-08-27 13:15:04.918581+07
38	DELETE	Employee	70	Menghapus data karyawan ID 70	{"id":70}	admin	::1	2026-08-27 13:15:04.920224+07
39	UPDATE	Employee	69	Mengubah data karyawan: Widianingrum	{"name":"Widianingrum","status":"Active","gross":8926054.00}	admin	::1	2026-08-27 13:18:32.274321+07
40	LOGIN	Auth	1	User Resource Manager berhasil login ke sistem	{"username":"admin","role":"Manager"}	admin	::1	2026-08-27 13:35:28.352123+07
41	DELETE	Employee	33	Menghapus data karyawan ID 33	{"id":33}	admin	::1	2026-08-27 13:50:32.134199+07
42	UPDATE	Employee	34	Mengubah data karyawan: Asep Supriyadi	{"name":"Asep Supriyadi","status":"Active","gross":11296249.00}	admin	::1	2026-08-27 13:50:42.339725+07
43	UPDATE	Employee	59	Mengubah data karyawan: Alfian Widitama	{"name":"Alfian Widitama","status":"Active","gross":9550000.00}	admin	::1	2026-08-27 14:47:09.939456+07
44	UPDATE	Employee	58	Mengubah data karyawan: Iqbal Pradipta	{"name":"Iqbal Pradipta","status":"Active","gross":5442000.00}	admin	::1	2026-08-27 14:47:21.974384+07
45	UPDATE	Employee	57	Mengubah data karyawan: Rafli Akbar Audi	{"name":"Rafli Akbar Audi","status":"Active","gross":11851099.00}	admin	::1	2026-08-27 14:47:46.788733+07
46	UPDATE	Employee	56	Mengubah data karyawan: Danu Prasetyo	{"name":"Danu Prasetyo","status":"Active","gross":9000000.00}	admin	::1	2026-08-27 14:47:57.003681+07
47	UPDATE	Employee	69	Mengubah data karyawan: Widianingrum	{"name":"Widianingrum","status":"Active","gross":8926054.00}	admin	::1	2026-08-27 14:48:33.87642+07
48	UPDATE	Employee	68	Mengubah data karyawan: Rifqi Darmawan	{"name":"Rifqi Darmawan","status":"Active","gross":11942490.00}	admin	::1	2026-08-27 14:48:41.913375+07
49	UPDATE	Employee	67	Mengubah data karyawan: Athallah Andi	{"name":"Athallah Andi","status":"Active","gross":5442000.00}	admin	::1	2026-08-27 14:48:47.358635+07
50	UPDATE	Employee	66	Mengubah data karyawan: Sutrisno	{"name":"Sutrisno","status":"Active","gross":9482748.00}	admin	::1	2026-08-27 14:48:52.116+07
51	UPDATE	Employee	65	Mengubah data karyawan: Anval H	{"name":"Anval H","status":"Active","gross":7335074.00}	admin	::1	2026-08-27 14:55:02.54528+07
52	UPDATE	Employee	64	Mengubah data karyawan: Aris M	{"name":"Aris M","status":"Active","gross":8414368.00}	admin	::1	2026-08-27 14:55:07.747598+07
53	UPDATE	Employee	63	Mengubah data karyawan: Asep Khairul A	{"name":"Asep Khairul A","status":"Active","gross":9289722.00}	admin	::1	2026-08-27 14:55:12.716648+07
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.customers (id_customer, customer_name, customer_start_contract, customer_end_contract) FROM stdin;
1	Bank BSI	2026-01-01	2026-12-31
2	Bank CIMB	2026-01-01	2026-12-31
3	Bank Indonesia APIM	2026-01-01	2026-12-31
4	Bank Indonesia BIFAST	2026-01-01	2026-12-31
5	Bank Indonesia JBOSS	2026-01-01	2026-12-31
6	Bank Indonesia OCP	2026-01-01	2026-12-31
7	Bank Jakarta (App Migration)	2026-01-01	2026-12-31
8	Bank Jakarta (Corporat Web)	2026-01-01	2026-12-31
9	Bank Jakarta (MB Vello)	2026-01-01	2026-12-31
10	Bank OCBC	2026-01-01	2026-12-31
11	Bank Permata	2026-01-01	2026-12-31
12	HIBANK	2026-01-01	2026-12-31
13	INTERNAL - SOC	2026-01-01	2026-12-31
14	TELKOMSEL FOSS	2026-01-01	2026-12-31
15	TELKOMSEL IDP	2026-01-01	2026-12-31
16	TELKOMSEL TEM	2026-01-01	2026-12-31
17	ITWASUM POLRI	2026-08-27	2026-08-28
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.employees (id_employee, employee_name, employee_role, status, is_active, id_group, id_customer, start_contract, end_contract, sallary_gross, tunjangan_penempatan, tunjangan_keahlian, koefisien, revenue_nett, join_date, onboarding_date, is_permanent, allocation_status, last_salary_increment_date) FROM stdin;
1	Sukma Aspriliyawan	Webmethods Developer	Active	t	2	1	2026-01-01	2026-09-30	8000000.00	1000000.00	0.00	1.50	19765099.10	\N	\N	f	ACTIVE	
2	Satria Pandega	Middle Backend Engineer	Active	t	2	2	2026-01-01	2026-11-18	6789705.00	1000000.00	0.00	1.40	22000000.00	\N	\N	f	ACTIVE	
3	Rifki Ridha	Backend Developer	Active	t	2	2	2026-01-01	2027-02-06	8300000.00	1000000.00	500000.00	1.40	22000000.00	\N	\N	f	ACTIVE	
4	Ahri Maulana	Webmethods Developer	Active	t	2	3	2026-01-01	2026-10-28	7331379.00	1000000.00	500000.00	1.40	19800000.00	\N	\N	f	ACTIVE	
5	Rizki Maulana Rajabi	Webmethods Developer	Active	t	2	3	2026-01-01	2027-07-15	8400992.00	1000000.00	1000000.00	1.30	19800000.00	\N	\N	f	ACTIVE	
6	Alif Athallah M	Middle Backend	Active	t	2	4	Permanent	Permanent	10000000.00	1000000.00	0.00	1.40	22000000.00	\N	\N	t	ACTIVE	
7	Aldy Suryanto	Monitoring Engineer	Active	t	2	5	2026-01-01	03 Agt 2027	6800000.00	1000000.00	500000.00	1.50	19800000.00	\N	\N	f	ACTIVE	
8	Ferdy Lasuf Baehaqie	Monitoring Engineer	Active	t	2	5	2026-01-01	2027-02-10	8200000.00	1000000.00	1000000.00	1.40	19800000.00	\N	\N	f	ACTIVE	
9	Henry Prasetyo	Monitoring Engineer	Active	t	2	6	2026-01-01	2026-10-27	6789705.00	1000000.00	500000.00	1.50	19800000.00	\N	\N	f	ACTIVE	
10	Imron Rosadi	Monitoring Engineer	Active	t	2	6	2026-01-01	2027-06-17	6250884.00	1000000.00	300000.00	1.40	19800000.00	\N	\N	f	ACTIVE	
11	Yuniar Fitria Hendrawati	Middle QA Tester/ Engineer	Active	t	2	7	2026-01-01	2027-03-05	7106040.00	1000000.00	1000000.00	1.40	17747800.00	\N	\N	f	ACTIVE	
12	Fendi Gunawan	Infrastructure Engineer	Active	t	2	7	2026-01-01	2027-01-25	10750000.00	1000000.00	4000000.00	1.40	32000000.00	\N	\N	f	ACTIVE	
13	Daniel D	Senior Change Management	Active	t	2	7	2026-01-01	2026-12-31	0.00	0.00	0.00	1.40	0.00	\N	\N	f	ACTIVE	
14	Nida Tedila Y	QA	Active	t	2	7	2026-01-01	2026-11-05	10750000.00	1000000.00	4000000.00	1.40	32000000.00	\N	\N	f	ACTIVE	
15	Aura Sukma	QA	Active	t	2	7	2026-01-01	2027-01-20	10750000.00	1000000.00	4000000.00	1.40	32000000.00	\N	\N	f	ACTIVE	
16	Putri Rizky N	QA	Active	t	2	7	2026-01-01	2026-11-06	10750000.00	1000000.00	4000000.00	1.40	32000000.00	\N	\N	f	ACTIVE	
17	Akmal Al Haqq	QA	Active	t	2	7	2026-01-01	2026-11-06	10750000.00	1000000.00	4000000.00	1.40	32000000.00	\N	\N	f	ACTIVE	
18	Muhammad Daffa Arviano Putra	Java BE (Senior)	Active	t	2	8	2026-01-01	2026-10-06	10750000.00	1000000.00	500000.00	1.40	30500000.00	\N	\N	f	ACTIVE	
19	Mohammad Radja Alyfa Amri	FE Developer (Senior)	Active	t	2	8	2026-01-01	2026-10-06	10750000.00	1000000.00	1000000.00	1.40	30500000.00	\N	\N	f	ACTIVE	
20	Della Fitrisia	UI/UX Designer (Middle)	Active	t	2	8	2026-01-01	2026-10-06	9500000.00	1000000.00	0.00	1.40	29500000.00	\N	\N	f	ACTIVE	
21	Putra Aditama	UI/UX Designer (Middle)	Active	t	2	8	2026-01-01	2026-10-06	10750000.00	1000000.00	1000000.00	1.40	29500000.00	\N	\N	f	ACTIVE	
22	Ersa Andhini	Scrum Master	Active	t	2	8	2026-01-01	2026-10-06	10750000.00	1000000.00	2000000.00	1.40	36000000.00	\N	\N	f	ACTIVE	
23	Khairul Pandunata	Business Analyst (Middle)	Active	t	2	8	2026-01-01	2026-10-06	8441493.00	1000000.00	1000000.00	1.40	30000000.00	\N	\N	f	ACTIVE	
24	Duwi Sulistianingsih - BA (Internal Aigen)	Business Analyst (Middle)	Active	t	2	8	2026-01-01	2026-10-06	5442000.00	1000000.00	1500000.00	1.40	30000000.00	\N	\N	f	ACTIVE	
25	Nurullah - Scrum	Scrum Master	Active	t	2	8	2026-01-01	2026-10-06	16659228.00	1000000.00	3000000.00	1.40	36000000.00	\N	\N	f	ACTIVE	
26	Kahfi Kurnia Aji	Java BE (Middle Senior)	Active	t	2	8	2026-01-01	2026-10-13	9500000.00	1000000.00	1000000.00	1.40	30500000.00	\N	\N	f	ACTIVE	
27	M Januar (Internal Aigen)	Business Analyst (Middle)	Active	t	1	9	Permanent	Permanent	7210000.00	1000000.00	2000000.00	1.40	30000000.00	\N	\N	t	ACTIVE	
28	Fadilah Arifki	Fullstack Developer (Senior)	Active	t	2	9	2026-01-01	2027-04-01	10750000.00	1000000.00	4000000.00	1.40	32000000.00	\N	\N	f	ACTIVE	
29	Rajesh Rivalda	Monitoring Engineer	Active	t	1	10	2026-01-01	2026-10-10	10713395.00	1000000.00	0.00	1.30	20668200.00	\N	\N	f	ACTIVE	
30	Ragil Aria Dewanto	Security Engineer	Active	t	3	11	2026-01-01	2027-08-14	11000000.00	1000000.00	1000000.00	1.30	19291667.00	\N	\N	f	ACTIVE	
31	Agma Setiawan	Security Engineer	Active	t	3	11	2026-01-01	2026-10-15	9482748.00	1000000.00	500000.00	1.30	19291667.00	\N	\N	f	ACTIVE	
32	Deki Tri Rizmawan	Security Engineer	Active	t	3	11	2026-01-01	2027-03-23	10056338.00	1000000.00	300000.00	1.30	19291667.00	\N	\N	f	ACTIVE	
35	Faudzan Adim	Security Engineer	Active	t	3	11	2026-01-01	2026-10-13	10056338.00	1000000.00	0.00	1.30	19291667.00	\N	\N	f	ACTIVE	
36	Chandra Farizka	Security Engineer	Active	t	3	11	2026-01-01	29 Des 2026	8405962.00	1000000.00	800000.00	1.30	19291667.00	\N	\N	f	ACTIVE	
37	Yoga Ajiputro Sapakoly	Security Engineer	Active	t	3	11	2026-01-01	2027-01-10	10713395.00	1000000.00	0.00	1.30	19291667.00	\N	\N	f	ACTIVE	
38	Faried Abimanyu Bhakti Nusantara	Security Engineer	Active	t	3	11	2026-01-01	2027-01-21	8926054.00	1000000.00	300000.00	1.30	19291667.00	\N	\N	f	ACTIVE	
39	Sukma Wijaya	Security Engineer	Active	t	3	11	2026-01-01	2027-02-08	10056338.00	1000000.00	300000.00	1.30	19291667.00	\N	\N	f	ACTIVE	
40	Arrumaisha Ruhama Nafisah	Security Engineer	Active	t	3	11	2026-01-01	2027-06-10	10700165.00	1000000.00	0.00	1.30	19291667.00	\N	\N	f	ACTIVE	
41	Nor Alip	Security Engineer	Active	t	3	11	2026-01-01	2026-11-13	10713395.00	1000000.00	500000.00	1.30	19291667.00	\N	\N	f	ACTIVE	
42	Fatma Rahma W	Security Engineer	Active	t	3	11	Permanent	Permanent	5442000.00	1000000.00	0.00	1.30	19291667.00	\N	\N	t	ACTIVE	
43	Moses Tri Xavario	Security Engineer	Active	t	3	11	2026-01-01	05 Mei 2027	5442000.00	1000000.00	500000.00	1.30	19291667.00	\N	\N	f	ACTIVE	
44	Hafizh Shiba	Security Engineer	Active	t	3	11	2026-01-01	2027-03-27	6789705.00	1000000.00	500000.00	1.30	19291667.00	\N	\N	f	ACTIVE	
45	Arrico Hardyanto	Middle BE Engineer	Active	t	1	12	2026-01-01	2027-07-27	12524067.00	500000.00	0.00	1.40	21012612.61	\N	\N	f	ACTIVE	
46	Tahir Shadaqat Ahmad	Middle webMethods	Active	t	1	12	Permanent	Permanent	14297210.00	1000000.00	1000000.00	1.30	35315316.00	\N	\N	t	ACTIVE	
47	Ira Maria Ulfa	Middle Businise Analyst	Active	t	2	\N	Permanent	Permanent	9078439.00	0.00	1000000.00	1.40	0.00	\N	\N	t	ACTIVE	
34	Asep Supriyadi	L2 Security Engineer	Active	t	3	11	2026-01-01	2026-09-23	11296249.00	1000000.00	3500000.00	1.30	19291667.00			f	ACTIVE	
48	Adinda Sintawati	Junior Fullstack Developr	Active	t	2	\N	2026-01-01	2026-11-06	5729876.00	0.00	0.00	1.40	0.00	\N	\N	f	ACTIVE	
49	Fadhel	Project Manager	Active	t	1	\N	2026-01-01	2026-09-09	9036409.00	0.00	0.00	1.40	0.00	\N	\N	f	ACTIVE	
50	Diky Arief	Middle Fullstack Developer *	Active	t	2	\N	2026-01-01	2027-01-13	6792538.00	0.00	0.00	1.40	0.00	\N	\N	f	ACTIVE	
51	Muhammad Rizky (kibot)	QA	Active	t	2	\N	2026-01-01	2027-01-20	5439500.00	0.00	0.00	1.40	0.00	\N	\N	f	ACTIVE	
52	Bondan	Senior AI Engineer	Active	t	2	\N	2026-01-01	2026-09-09	10060000.00	0.00	0.00	1.40	0.00	\N	\N	f	ACTIVE	
53	M Glenn Yunifer	Middle Data Engineer	Active	t	2	\N	2026-01-01	16 Des 2026	7331379.00	0.00	0.00	1.40	0.00	\N	\N	f	ACTIVE	
54	Luthfy Rahmani	Middle Mobile / Frontend Developer	Active	t	2	\N	2026-01-01	2026-09-25	7859008.00	0.00	0.00	1.40	0.00	\N	\N	f	ACTIVE	
55	Zhiddan P	Middle DevOps	Active	t	2	13	Permanent	Permanent	11986097.00	1000000.00	0.00	1.40	22000000.00	\N	\N	t	ACTIVE	
60	Falyan Zuril	Middle DevOps	Active	t	2	15	2026-01-01	2026-10-27	6500000.00	0.00	0.00	1.40	22000000.00	\N	\N	f	ACTIVE	
61	Ivan Habibi	Senior DevOps	Active	t	1	15	Permanent	Permanent	11986097.00	1000000.00	0.00	1.40	22000000.00	\N	\N	t	ACTIVE	
62	Saiful Wardi	Backend Dev	Active	t	2	15	2026-01-01	2027-01-29	11986097.00	1000000.00	0.00	1.40	22000000.00	\N	\N	f	ACTIVE	
59	Alfian Widitama	Senior Frontend Developer	Active	t	2	14	Permanent	Permanent	9550000.00	0.00	1000000.00	1.40	20857142.00			t	ACTIVE	
58	Iqbal Pradipta	Junior Backend	Active	t	2	14	2026-01-01	2026-11-05	5442000.00	0.00	0.00	1.40	20857142.00			f	ACTIVE	
57	Rafli Akbar Audi	Middle DevOps	Active	t	2	14	2026-01-01	2026-10-20	11851099.00	0.00	2000000.00	1.40	20857142.00			f	ACTIVE	
56	Danu Prasetyo	Mandiri Ansible	Active	t	2	14	2026-01-01	2027-01-26	9000000.00	1000000.00	1000000.00	1.50	20857142.00			f	ACTIVE	
69	Widianingrum	Middle QA Tester/ Engineer	Active	t	1	16	Permanent	Permanent	8926054.00	1000000.00	1500000.00	1.40	23714285.00			t	ACTIVE	
68	Rifqi Darmawan	Senior Mobile / Fullstack Developer	Active	t	2	16	Permanent	Permanent	11942490.00	0.00	0.00	1.40	23714285.00			t	ACTIVE	
67	Athallah Andi	Junior DevOps	Active	t	2	16	2026-01-01	2026-11-04	5442000.00	0.00	0.00	1.40	23714285.00			f	ACTIVE	
66	Sutrisno	Middle DevOps	Active	t	2	16	2026-01-01	2027-01-06	9482748.00	1000000.00	0.00	1.40	23714285.00			f	ACTIVE	
65	Anval H	Middle Fullstack Developer *	Active	t	2	15	2026-01-01	2027-01-15	7335074.00	0.00	0.00	1.40	22800000.00			f	ACTIVE	
64	Aris M	Middle Frontend Developer *	Active	t	2	15	Permanent	Permanent	8414368.00	0.00	0.00	1.40	22800000.00			t	ACTIVE	
63	Asep Khairul A	Senior Fullstack Developer	Active	t	2	15	Permanent	Permanent	9289722.00	0.00	0.00	1.40	22800000.00			t	ACTIVE	
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.groups (id_group, group_name, brand_name) FROM stdin;
1	AIGEN	AIGEN
2	GS	GS
3	NFT	NFT
\.


--
-- Data for Name: personal_notes; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.personal_notes (id, net_salary, tk0_k0, k1_k2, created_at, updated_at) FROM stdin;
1	4500000.00	\N	\N	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
2	5000000.00	5154639.00	5154639.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
3	5500000.00	5714895.00	5670103.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
4	6000000.00	6250884.00	6201773.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
5	6250000.00	6528562.00	6477147.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
6	6500000.00	6789705.00	6753967.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
7	7000000.00	7331379.00	7292698.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
8	7250000.00	\N	\N	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
9	7500000.00	7855049.00	7813605.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
10	8000000.00	8400992.00	8334512.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
11	8250000.00	\N	\N	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
12	8500000.00	8926054.00	8902389.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
13	9000000.00	\N	9426059.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
14	9250000.00	\N	\N	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
15	9500000.00	10056338.00	9949729.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
16	10000000.00	10700165.00	10529223.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
17	10500000.00	11296249.00	11174727.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
18	12000000.00	13047038.00	12905435.00	2026-08-13 14:09:05.539927+07	2026-08-13 14:09:05.539927+07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.users (id, username, password, name, role, created_at, updated_at) FROM stdin;
1	admin	$2a$10$M8vtD0GXSHF/e34n.0W9YuvJYYsH9PigJrck5dciOOxMiERjulCPO	Resource Manager	Manager	2026-08-13 14:09:05.527082+07	2026-08-13 14:09:05.527082+07
\.


--
-- Name: assignment_histories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.assignment_histories_id_seq', 653, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 53, true);


--
-- Name: customers_id_customer_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.customers_id_customer_seq', 17, true);


--
-- Name: employees_id_employee_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.employees_id_employee_seq', 70, true);


--
-- Name: groups_id_group_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.groups_id_group_seq', 3, true);


--
-- Name: personal_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.personal_notes_id_seq', 18, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: assignment_histories assignment_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.assignment_histories
    ADD CONSTRAINT assignment_histories_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id_customer);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id_employee);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id_group);


--
-- Name: personal_notes personal_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.personal_notes
    ADD CONSTRAINT personal_notes_pkey PRIMARY KEY (id);


--
-- Name: users uni_users_username; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uni_users_username UNIQUE (username);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_assignment_histories_id_employee; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_assignment_histories_id_employee ON public.assignment_histories USING btree (id_employee);


--
-- Name: idx_assignment_histories_month; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_assignment_histories_month ON public.assignment_histories USING btree (month);


--
-- Name: idx_assignment_histories_year; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_assignment_histories_year ON public.assignment_histories USING btree (year);


--
-- PostgreSQL database dump complete
--

\unrestrict iuTYa5Nzy99jfksSXF3Y2F6ew9hFU97VlDUUI6QqvvSW3Tum7IZ6ZSdQ62BAw7c

