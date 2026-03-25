--
-- PostgreSQL database dump
--

\restrict ATLhvrdxnntLyXOsK36g1dR1X1K38O6nLugGFNR7JhAMyUa68dnNovdyrzSGYUM

-- Dumped from database version 15.15 (Ubuntu 15.15-1.pgdg24.04+1)
-- Dumped by pg_dump version 15.15 (Ubuntu 15.15-1.pgdg24.04+1)

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
-- Name: DeviceType; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."DeviceType" AS ENUM (
    'POS',
    'TABLET',
    'BAR',
    'KIOSK',
    'KDS',
    'OTHER'
);


ALTER TYPE public."DeviceType" OWNER TO hospitality;

--
-- Name: KdsStatus; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."KdsStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'READY',
    'SERVED'
);


ALTER TYPE public."KdsStatus" OWNER TO hospitality;

--
-- Name: KitchenTicketStatus; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."KitchenTicketStatus" AS ENUM (
    'OPEN',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."KitchenTicketStatus" OWNER TO hospitality;

--
-- Name: MembershipLevel; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."MembershipLevel" AS ENUM (
    'SILVER',
    'GOLD',
    'VIP'
);


ALTER TYPE public."MembershipLevel" OWNER TO hospitality;

--
-- Name: OrderItemStatus; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."OrderItemStatus" AS ENUM (
    'ACTIVE',
    'VOID'
);


ALTER TYPE public."OrderItemStatus" OWNER TO hospitality;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'OPEN',
    'SENT_TO_KITCHEN',
    'PARTIALLY_PAID',
    'PAID',
    'VOIDED'
);


ALTER TYPE public."OrderStatus" OWNER TO hospitality;

--
-- Name: OrderType; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."OrderType" AS ENUM (
    'DINE_IN',
    'TAKEAWAY',
    'DELIVERY',
    'BAR'
);


ALTER TYPE public."OrderType" OWNER TO hospitality;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CARD',
    'VOUCHER',
    'ROOM',
    'EXTERNAL'
);


ALTER TYPE public."PaymentMethod" OWNER TO hospitality;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'DECLINED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO hospitality;

--
-- Name: ReportType; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."ReportType" AS ENUM (
    'DAILY',
    'SHIFT',
    'CUSTOM'
);


ALTER TYPE public."ReportType" OWNER TO hospitality;

--
-- Name: ReservationServiceType; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."ReservationServiceType" AS ENUM (
    'ALL_DAY_MENU',
    'SOCIAL_LUNCH',
    'MIXED'
);


ALTER TYPE public."ReservationServiceType" OWNER TO hospitality;

--
-- Name: ReservationSource; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."ReservationSource" AS ENUM (
    'PHONE',
    'WALK_IN',
    'ONLINE'
);


ALTER TYPE public."ReservationSource" OWNER TO hospitality;

--
-- Name: ReservationStatus; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."ReservationStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'SEATED',
    'CANCELLED',
    'NO_SHOW'
);


ALTER TYPE public."ReservationStatus" OWNER TO hospitality;

--
-- Name: SavedFilterScope; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."SavedFilterScope" AS ENUM (
    'ORDERS',
    'SALES',
    'TABLES',
    'GUESTS'
);


ALTER TYPE public."SavedFilterScope" OWNER TO hospitality;

--
-- Name: ShiftStatus; Type: TYPE; Schema: public; Owner: hospitality
--

CREATE TYPE public."ShiftStatus" AS ENUM (
    'OPEN',
    'CLOSED',
    'ARCHIVED'
);


ALTER TYPE public."ShiftStatus" OWNER TO hospitality;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ApiIdempotency; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."ApiIdempotency" (
    id integer NOT NULL,
    key text NOT NULL,
    "locationId" integer NOT NULL,
    "terminalId" integer NOT NULL,
    "userId" integer NOT NULL,
    method text NOT NULL,
    path text NOT NULL,
    "requestHash" text NOT NULL,
    "responseJson" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ApiIdempotency" OWNER TO hospitality;

--
-- Name: ApiIdempotency_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."ApiIdempotency_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ApiIdempotency_id_seq" OWNER TO hospitality;

--
-- Name: ApiIdempotency_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."ApiIdempotency_id_seq" OWNED BY public."ApiIdempotency".id;


--
-- Name: Area; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."Area" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    name text NOT NULL,
    "sortOrder" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Area" OWNER TO hospitality;

--
-- Name: Area_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."Area_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Area_id_seq" OWNER TO hospitality;

--
-- Name: Area_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."Area_id_seq" OWNED BY public."Area".id;


--
-- Name: DisplayLayout; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."DisplayLayout" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    "terminalId" integer,
    name text NOT NULL,
    "configJson" jsonb NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DisplayLayout" OWNER TO hospitality;

--
-- Name: DisplayLayout_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."DisplayLayout_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."DisplayLayout_id_seq" OWNER TO hospitality;

--
-- Name: DisplayLayout_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."DisplayLayout_id_seq" OWNED BY public."DisplayLayout".id;


--
-- Name: Guest; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."Guest" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    email text,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Guest" OWNER TO hospitality;

--
-- Name: Guest_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."Guest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Guest_id_seq" OWNER TO hospitality;

--
-- Name: Guest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."Guest_id_seq" OWNED BY public."Guest".id;


--
-- Name: KDSStation; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."KDSStation" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    name text NOT NULL,
    code text,
    "sortOrder" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."KDSStation" OWNER TO hospitality;

--
-- Name: KDSStation_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."KDSStation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KDSStation_id_seq" OWNER TO hospitality;

--
-- Name: KDSStation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."KDSStation_id_seq" OWNED BY public."KDSStation".id;


--
-- Name: KitchenTicket; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."KitchenTicket" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    "orderId" integer NOT NULL,
    "tableId" integer,
    "kdsStationId" integer,
    "terminalId" integer NOT NULL,
    "createdByUserId" integer NOT NULL,
    status public."KitchenTicketStatus" DEFAULT 'OPEN'::public."KitchenTicketStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "scheduledTime" timestamp(3) without time zone
);


ALTER TABLE public."KitchenTicket" OWNER TO hospitality;

--
-- Name: KitchenTicketItem; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."KitchenTicketItem" (
    id integer NOT NULL,
    "ticketId" integer NOT NULL,
    "orderItemId" integer NOT NULL,
    quantity integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."KitchenTicketItem" OWNER TO hospitality;

--
-- Name: KitchenTicketItem_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."KitchenTicketItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KitchenTicketItem_id_seq" OWNER TO hospitality;

--
-- Name: KitchenTicketItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."KitchenTicketItem_id_seq" OWNED BY public."KitchenTicketItem".id;


--
-- Name: KitchenTicket_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."KitchenTicket_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."KitchenTicket_id_seq" OWNER TO hospitality;

--
-- Name: KitchenTicket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."KitchenTicket_id_seq" OWNED BY public."KitchenTicket".id;


--
-- Name: LocationSettings; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."LocationSettings" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    "statsConfig" jsonb NOT NULL,
    "saleConfig" jsonb NOT NULL,
    "rsvpConfig" jsonb NOT NULL,
    "displayConfig" jsonb NOT NULL,
    "tablesConfig" jsonb NOT NULL,
    "filterConfig" jsonb NOT NULL,
    "logConfig" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LocationSettings" OWNER TO hospitality;

--
-- Name: LocationSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."LocationSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."LocationSettings_id_seq" OWNER TO hospitality;

--
-- Name: LocationSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."LocationSettings_id_seq" OWNED BY public."LocationSettings".id;


--
-- Name: Membership; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."Membership" (
    id integer NOT NULL,
    "guestId" integer NOT NULL,
    "membershipLevel" public."MembershipLevel" NOT NULL,
    "membershipNumber" text,
    "discountPercent" numeric(5,2),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Membership" OWNER TO hospitality;

--
-- Name: Membership_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."Membership_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Membership_id_seq" OWNER TO hospitality;

--
-- Name: Membership_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."Membership_id_seq" OWNED BY public."Membership".id;


--
-- Name: MenuCategory; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."MenuCategory" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    name text NOT NULL,
    slug text,
    description text,
    "sortOrder" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MenuCategory" OWNER TO hospitality;

--
-- Name: MenuCategory_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."MenuCategory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MenuCategory_id_seq" OWNER TO hospitality;

--
-- Name: MenuCategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."MenuCategory_id_seq" OWNED BY public."MenuCategory".id;


--
-- Name: MenuItem; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."MenuItem" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    "categoryId" integer NOT NULL,
    name text NOT NULL,
    sku text,
    description text,
    "basePrice" numeric(10,2) NOT NULL,
    "taxRate" numeric(5,2),
    "isAlcohol" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "kdsStationId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    allergens text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public."MenuItem" OWNER TO hospitality;

--
-- Name: MenuItemModifierGroup; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."MenuItemModifierGroup" (
    id integer NOT NULL,
    "menuItemId" integer NOT NULL,
    "modifierGroupId" integer NOT NULL
);


ALTER TABLE public."MenuItemModifierGroup" OWNER TO hospitality;

--
-- Name: MenuItemModifierGroup_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."MenuItemModifierGroup_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MenuItemModifierGroup_id_seq" OWNER TO hospitality;

--
-- Name: MenuItemModifierGroup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."MenuItemModifierGroup_id_seq" OWNED BY public."MenuItemModifierGroup".id;


--
-- Name: MenuItem_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."MenuItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MenuItem_id_seq" OWNER TO hospitality;

--
-- Name: MenuItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."MenuItem_id_seq" OWNED BY public."MenuItem".id;


--
-- Name: ModifierGroup; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."ModifierGroup" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    name text NOT NULL,
    "minSelected" integer,
    "maxSelected" integer,
    "isRequired" boolean DEFAULT false NOT NULL,
    "sortOrder" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ModifierGroup" OWNER TO hospitality;

--
-- Name: ModifierGroup_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."ModifierGroup_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ModifierGroup_id_seq" OWNER TO hospitality;

--
-- Name: ModifierGroup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."ModifierGroup_id_seq" OWNED BY public."ModifierGroup".id;


--
-- Name: ModifierOption; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."ModifierOption" (
    id integer NOT NULL,
    "modifierGroupId" integer NOT NULL,
    name text NOT NULL,
    "priceDelta" numeric(10,2),
    "sortOrder" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ModifierOption" OWNER TO hospitality;

--
-- Name: ModifierOption_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."ModifierOption_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ModifierOption_id_seq" OWNER TO hospitality;

--
-- Name: ModifierOption_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."ModifierOption_id_seq" OWNED BY public."ModifierOption".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."Order" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    "terminalId" integer NOT NULL,
    "shiftId" integer NOT NULL,
    "tableId" integer,
    "guestId" integer,
    "membershipId" integer,
    "parentOrderId" integer,
    "orderType" public."OrderType" NOT NULL,
    status public."OrderStatus" NOT NULL,
    "subtotalAmount" numeric(10,2) NOT NULL,
    "discountAmount" numeric(10,2) NOT NULL,
    "serviceChargeAmount" numeric(10,2) NOT NULL,
    "taxAmount" numeric(10,2) NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    "openedByUserId" integer NOT NULL,
    "closedByUserId" integer,
    "openedAt" timestamp(3) without time zone NOT NULL,
    "closedAt" timestamp(3) without time zone,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "serverUserId" integer
);


ALTER TABLE public."Order" OWNER TO hospitality;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."OrderItem" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "menuItemId" integer NOT NULL,
    "seatNumber" integer,
    quantity integer NOT NULL,
    "basePrice" numeric(10,2) NOT NULL,
    "discountAmount" numeric(10,2) NOT NULL,
    "finalPrice" numeric(10,2) NOT NULL,
    comment text,
    "kdsStatus" public."KdsStatus" NOT NULL,
    status public."OrderItemStatus" DEFAULT 'ACTIVE'::public."OrderItemStatus" NOT NULL,
    "voidedAt" timestamp(3) without time zone,
    "voidedByUserId" integer,
    "voidReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "courseNumber" integer
);


ALTER TABLE public."OrderItem" OWNER TO hospitality;

--
-- Name: OrderItemModifier; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."OrderItemModifier" (
    id integer NOT NULL,
    "orderItemId" integer NOT NULL,
    "modifierOptionId" integer NOT NULL,
    "priceDelta" numeric(10,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OrderItemModifier" OWNER TO hospitality;

--
-- Name: OrderItemModifier_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."OrderItemModifier_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."OrderItemModifier_id_seq" OWNER TO hospitality;

--
-- Name: OrderItemModifier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."OrderItemModifier_id_seq" OWNED BY public."OrderItemModifier".id;


--
-- Name: OrderItem_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."OrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."OrderItem_id_seq" OWNER TO hospitality;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."OrderItem_id_seq" OWNED BY public."OrderItem".id;


--
-- Name: Order_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Order_id_seq" OWNER TO hospitality;

--
-- Name: Order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;


--
-- Name: Payment; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."Payment" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "shiftId" integer NOT NULL,
    "terminalId" integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    "tipAmount" numeric(10,2) NOT NULL,
    "paymentMethod" public."PaymentMethod" NOT NULL,
    provider text,
    "transactionId" text,
    status public."PaymentStatus" NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Payment" OWNER TO hospitality;

--
-- Name: PaymentRefund; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."PaymentRefund" (
    id integer NOT NULL,
    "paymentId" integer NOT NULL,
    "orderId" integer NOT NULL,
    "shiftId" integer,
    "terminalId" integer,
    amount numeric(12,2) NOT NULL,
    reason text,
    provider text,
    "refundTransactionId" text,
    status public."PaymentStatus" DEFAULT 'APPROVED'::public."PaymentStatus" NOT NULL,
    "refundedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PaymentRefund" OWNER TO hospitality;

--
-- Name: PaymentRefund_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."PaymentRefund_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PaymentRefund_id_seq" OWNER TO hospitality;

--
-- Name: PaymentRefund_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."PaymentRefund_id_seq" OWNED BY public."PaymentRefund".id;


--
-- Name: Payment_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."Payment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Payment_id_seq" OWNER TO hospitality;

--
-- Name: Payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."Payment_id_seq" OWNED BY public."Payment".id;


--
-- Name: ReportSnapshot; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."ReportSnapshot" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    "shiftId" integer,
    date timestamp(3) without time zone NOT NULL,
    type public."ReportType" NOT NULL,
    "dataJson" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ReportSnapshot" OWNER TO hospitality;

--
-- Name: ReportSnapshot_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."ReportSnapshot_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ReportSnapshot_id_seq" OWNER TO hospitality;

--
-- Name: ReportSnapshot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."ReportSnapshot_id_seq" OWNED BY public."ReportSnapshot".id;


--
-- Name: Reservation; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."Reservation" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    "guestId" integer,
    "reservationTime" timestamp(3) without time zone NOT NULL,
    "partySize" integer NOT NULL,
    status public."ReservationStatus" NOT NULL,
    source public."ReservationSource" NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "serviceType" public."ReservationServiceType"
);


ALTER TABLE public."Reservation" OWNER TO hospitality;

--
-- Name: ReservationTable; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."ReservationTable" (
    id integer NOT NULL,
    "reservationId" integer NOT NULL,
    "tableId" integer NOT NULL
);


ALTER TABLE public."ReservationTable" OWNER TO hospitality;

--
-- Name: ReservationTable_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."ReservationTable_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ReservationTable_id_seq" OWNER TO hospitality;

--
-- Name: ReservationTable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."ReservationTable_id_seq" OWNED BY public."ReservationTable".id;


--
-- Name: Reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."Reservation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Reservation_id_seq" OWNER TO hospitality;

--
-- Name: Reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."Reservation_id_seq" OWNED BY public."Reservation".id;


--
-- Name: RestaurantLocation; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."RestaurantLocation" (
    id integer NOT NULL,
    name text NOT NULL,
    code text,
    timezone text,
    address text,
    phone text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RestaurantLocation" OWNER TO hospitality;

--
-- Name: RestaurantLocation_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."RestaurantLocation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."RestaurantLocation_id_seq" OWNER TO hospitality;

--
-- Name: RestaurantLocation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."RestaurantLocation_id_seq" OWNED BY public."RestaurantLocation".id;


--
-- Name: Role; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."Role" (
    id integer NOT NULL,
    name text NOT NULL,
    "permissionsJson" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Role" OWNER TO hospitality;

--
-- Name: Role_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."Role_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Role_id_seq" OWNER TO hospitality;

--
-- Name: Role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."Role_id_seq" OWNED BY public."Role".id;


--
-- Name: SavedFilter; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."SavedFilter" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    "userId" integer NOT NULL,
    name text NOT NULL,
    scope public."SavedFilterScope" NOT NULL,
    "filterJson" jsonb NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SavedFilter" OWNER TO hospitality;

--
-- Name: SavedFilter_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."SavedFilter_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."SavedFilter_id_seq" OWNER TO hospitality;

--
-- Name: SavedFilter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."SavedFilter_id_seq" OWNED BY public."SavedFilter".id;


--
-- Name: Session; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."Session" (
    id integer NOT NULL,
    token text NOT NULL,
    "locationId" integer NOT NULL,
    "terminalId" integer NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO hospitality;

--
-- Name: Session_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."Session_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Session_id_seq" OWNER TO hospitality;

--
-- Name: Session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."Session_id_seq" OWNED BY public."Session".id;


--
-- Name: Shift; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."Shift" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    "userId" integer NOT NULL,
    "terminalId" integer NOT NULL,
    "openedAt" timestamp(3) without time zone NOT NULL,
    "closedAt" timestamp(3) without time zone,
    "openingCashAmount" numeric(10,2) NOT NULL,
    "closingCashAmount" numeric(10,2),
    status public."ShiftStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Shift" OWNER TO hospitality;

--
-- Name: Shift_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."Shift_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Shift_id_seq" OWNER TO hospitality;

--
-- Name: Shift_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."Shift_id_seq" OWNED BY public."Shift".id;


--
-- Name: Table; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."Table" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    "areaId" integer NOT NULL,
    name text NOT NULL,
    capacity integer NOT NULL,
    status text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "activeOrderId" integer
);


ALTER TABLE public."Table" OWNER TO hospitality;

--
-- Name: Table_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."Table_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Table_id_seq" OWNER TO hospitality;

--
-- Name: Table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."Table_id_seq" OWNED BY public."Table".id;


--
-- Name: Terminal; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."Terminal" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    name text NOT NULL,
    code text,
    "deviceType" public."DeviceType" NOT NULL,
    "kdsStationId" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Terminal" OWNER TO hospitality;

--
-- Name: Terminal_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."Terminal_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Terminal_id_seq" OWNER TO hospitality;

--
-- Name: Terminal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."Terminal_id_seq" OWNED BY public."Terminal".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    "locationId" integer NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "pinCode" text NOT NULL,
    email text,
    phone text,
    "roleId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "avatarColor" character varying(32)
);


ALTER TABLE public."User" OWNER TO hospitality;

--
-- Name: UserDevice; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public."UserDevice" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    token text NOT NULL,
    platform text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserDevice" OWNER TO hospitality;

--
-- Name: UserDevice_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."UserDevice_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UserDevice_id_seq" OWNER TO hospitality;

--
-- Name: UserDevice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."UserDevice_id_seq" OWNED BY public."UserDevice".id;


--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: hospitality
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO hospitality;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hospitality
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: hospitality
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO hospitality;

--
-- Name: ApiIdempotency id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ApiIdempotency" ALTER COLUMN id SET DEFAULT nextval('public."ApiIdempotency_id_seq"'::regclass);


--
-- Name: Area id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Area" ALTER COLUMN id SET DEFAULT nextval('public."Area_id_seq"'::regclass);


--
-- Name: DisplayLayout id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."DisplayLayout" ALTER COLUMN id SET DEFAULT nextval('public."DisplayLayout_id_seq"'::regclass);


--
-- Name: Guest id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Guest" ALTER COLUMN id SET DEFAULT nextval('public."Guest_id_seq"'::regclass);


--
-- Name: KDSStation id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KDSStation" ALTER COLUMN id SET DEFAULT nextval('public."KDSStation_id_seq"'::regclass);


--
-- Name: KitchenTicket id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KitchenTicket" ALTER COLUMN id SET DEFAULT nextval('public."KitchenTicket_id_seq"'::regclass);


--
-- Name: KitchenTicketItem id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KitchenTicketItem" ALTER COLUMN id SET DEFAULT nextval('public."KitchenTicketItem_id_seq"'::regclass);


--
-- Name: LocationSettings id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."LocationSettings" ALTER COLUMN id SET DEFAULT nextval('public."LocationSettings_id_seq"'::regclass);


--
-- Name: Membership id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Membership" ALTER COLUMN id SET DEFAULT nextval('public."Membership_id_seq"'::regclass);


--
-- Name: MenuCategory id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."MenuCategory" ALTER COLUMN id SET DEFAULT nextval('public."MenuCategory_id_seq"'::regclass);


--
-- Name: MenuItem id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."MenuItem" ALTER COLUMN id SET DEFAULT nextval('public."MenuItem_id_seq"'::regclass);


--
-- Name: MenuItemModifierGroup id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."MenuItemModifierGroup" ALTER COLUMN id SET DEFAULT nextval('public."MenuItemModifierGroup_id_seq"'::regclass);


--
-- Name: ModifierGroup id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ModifierGroup" ALTER COLUMN id SET DEFAULT nextval('public."ModifierGroup_id_seq"'::regclass);


--
-- Name: ModifierOption id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ModifierOption" ALTER COLUMN id SET DEFAULT nextval('public."ModifierOption_id_seq"'::regclass);


--
-- Name: Order id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);


--
-- Name: OrderItem id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."OrderItem" ALTER COLUMN id SET DEFAULT nextval('public."OrderItem_id_seq"'::regclass);


--
-- Name: OrderItemModifier id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."OrderItemModifier" ALTER COLUMN id SET DEFAULT nextval('public."OrderItemModifier_id_seq"'::regclass);


--
-- Name: Payment id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Payment" ALTER COLUMN id SET DEFAULT nextval('public."Payment_id_seq"'::regclass);


--
-- Name: PaymentRefund id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."PaymentRefund" ALTER COLUMN id SET DEFAULT nextval('public."PaymentRefund_id_seq"'::regclass);


--
-- Name: ReportSnapshot id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ReportSnapshot" ALTER COLUMN id SET DEFAULT nextval('public."ReportSnapshot_id_seq"'::regclass);


--
-- Name: Reservation id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Reservation" ALTER COLUMN id SET DEFAULT nextval('public."Reservation_id_seq"'::regclass);


--
-- Name: ReservationTable id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ReservationTable" ALTER COLUMN id SET DEFAULT nextval('public."ReservationTable_id_seq"'::regclass);


--
-- Name: RestaurantLocation id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."RestaurantLocation" ALTER COLUMN id SET DEFAULT nextval('public."RestaurantLocation_id_seq"'::regclass);


--
-- Name: Role id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Role" ALTER COLUMN id SET DEFAULT nextval('public."Role_id_seq"'::regclass);


--
-- Name: SavedFilter id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."SavedFilter" ALTER COLUMN id SET DEFAULT nextval('public."SavedFilter_id_seq"'::regclass);


--
-- Name: Session id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Session" ALTER COLUMN id SET DEFAULT nextval('public."Session_id_seq"'::regclass);


--
-- Name: Shift id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Shift" ALTER COLUMN id SET DEFAULT nextval('public."Shift_id_seq"'::regclass);


--
-- Name: Table id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Table" ALTER COLUMN id SET DEFAULT nextval('public."Table_id_seq"'::regclass);


--
-- Name: Terminal id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Terminal" ALTER COLUMN id SET DEFAULT nextval('public."Terminal_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: UserDevice id; Type: DEFAULT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."UserDevice" ALTER COLUMN id SET DEFAULT nextval('public."UserDevice_id_seq"'::regclass);


--
-- Data for Name: ApiIdempotency; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."ApiIdempotency" (id, key, "locationId", "terminalId", "userId", method, path, "requestHash", "responseJson", "createdAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: Area; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."Area" (id, "locationId", name, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
1	2	Main Hall	1	t	2026-03-09 16:49:03.601	2026-03-09 16:49:03.601
2	2	Patio	2	t	2026-03-09 16:49:03.61	2026-03-09 16:49:03.61
3	3	Bar	3	t	2026-03-25 11:57:58.457	2026-03-25 11:57:58.457
\.


--
-- Data for Name: DisplayLayout; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."DisplayLayout" (id, "locationId", "terminalId", name, "configJson", "isDefault", "createdAt", "updatedAt") FROM stdin;
1	2	2	Default POS Layout	{"sections": ["tables", "menu", "cart"]}	t	2026-03-09 16:49:04.056	2026-03-09 16:49:04.056
\.


--
-- Data for Name: Guest; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."Guest" (id, "locationId", "firstName", "lastName", phone, email, note, "createdAt", "updatedAt") FROM stdin;
1	2	Michael	Stone	+380501112233	guest@example.com	Prefers window seating	2026-03-09 16:49:03.674	2026-03-09 16:49:03.674
3	2	test2		\N	\N	\N	2026-03-18 10:06:39.85	2026-03-18 10:06:39.85
4	2	test 3		\N	\N	\N	2026-03-18 10:09:18.522	2026-03-18 10:09:18.522
5	2	ttttt		\N	\N	\N	2026-03-18 10:09:46.687	2026-03-18 10:09:46.687
6	2	gfhfhfh		\N	\N	\N	2026-03-18 10:12:48.889	2026-03-18 10:12:48.889
2	2	Joe	Doe	0632688276	dssf2@dvs.cn	fgsd	2026-03-18 09:56:15.825	2026-03-24 20:19:30.971
\.


--
-- Data for Name: KDSStation; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."KDSStation" (id, "locationId", name, code, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
4	2	Hot Kitchen	HOT	1	t	2026-03-09 16:49:03.564	2026-03-09 16:49:03.564
5	2	Bar	BAR	2	t	2026-03-09 16:49:03.568	2026-03-09 16:49:03.568
6	3	Kitchen	KITCHEN	1	t	2026-03-25 11:57:58.314	2026-03-25 11:57:58.314
7	3	Bar	BAR	2	t	2026-03-25 11:57:58.324	2026-03-25 11:57:58.324
\.


--
-- Data for Name: KitchenTicket; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."KitchenTicket" (id, "locationId", "orderId", "tableId", "kdsStationId", "terminalId", "createdByUserId", status, "createdAt", "updatedAt", "scheduledTime") FROM stdin;
2	2	5	5	4	2	1	OPEN	2026-03-15 16:19:25.429	2026-03-15 16:19:25.429	\N
3	2	5	5	4	2	1	OPEN	2026-03-15 16:20:20.086	2026-03-15 16:20:20.086	\N
1	2	1	1	4	2	2	COMPLETED	2026-03-09 16:49:04.042	2026-03-15 16:37:46.939	\N
4	2	6	3	4	2	1	COMPLETED	2026-03-15 16:37:36.506	2026-03-15 19:10:17.997	\N
5	2	7	1	4	2	1	COMPLETED	2026-03-15 16:38:14.131	2026-03-15 19:10:23.504	\N
7	2	8	2	5	2	1	COMPLETED	2026-03-15 19:09:43.94	2026-03-15 19:18:40.996	\N
8	2	8	2	4	2	1	COMPLETED	2026-03-15 19:10:11.603	2026-03-15 19:18:40.996	\N
9	2	8	2	5	2	1	COMPLETED	2026-03-15 19:10:11.608	2026-03-15 19:18:40.996	\N
12	2	10	7	4	2	1	COMPLETED	2026-03-15 20:20:40.002	2026-03-16 04:35:30.687	\N
19	2	13	4	4	2	1	OPEN	2026-03-17 11:27:58.422	2026-03-17 11:27:58.422	\N
20	2	13	4	5	2	1	OPEN	2026-03-17 11:27:58.437	2026-03-17 11:27:58.437	\N
13	2	11	3	4	2	1	COMPLETED	2026-03-16 04:34:20.877	2026-03-17 11:28:03.106	\N
10	2	9	1	4	2	1	COMPLETED	2026-03-15 19:19:07.598	2026-03-17 11:29:00.48	\N
11	2	9	1	5	2	1	COMPLETED	2026-03-15 19:19:07.61	2026-03-17 11:29:00.48	\N
16	2	9	1	4	2	1	COMPLETED	2026-03-16 12:28:59.285	2026-03-17 11:29:00.48	\N
14	2	12	2	4	2	1	COMPLETED	2026-03-16 12:26:27.664	2026-03-17 11:36:47.257	\N
15	2	12	2	5	2	1	COMPLETED	2026-03-16 12:26:27.668	2026-03-17 11:36:47.257	\N
17	2	12	2	4	2	1	COMPLETED	2026-03-17 10:48:15.739	2026-03-17 11:36:47.257	\N
18	2	12	2	4	2	1	COMPLETED	2026-03-17 11:10:47.547	2026-03-17 11:36:47.257	\N
25	2	16	2	4	2	1	COMPLETED	2026-03-17 12:15:13.759	2026-03-17 12:15:24.574	\N
26	2	16	2	5	2	1	COMPLETED	2026-03-17 12:15:13.769	2026-03-17 12:15:24.574	\N
21	2	14	3	4	2	1	COMPLETED	2026-03-17 11:39:59.346	2026-03-17 12:15:25.84	\N
22	2	14	3	5	2	1	COMPLETED	2026-03-17 11:39:59.357	2026-03-17 12:15:25.84	\N
23	2	14	3	4	2	1	COMPLETED	2026-03-17 11:40:21.891	2026-03-17 12:15:25.84	\N
32	2	13	4	4	2	1	OPEN	2026-03-18 08:24:37.256	2026-03-18 08:24:37.256	\N
33	2	13	4	5	2	1	OPEN	2026-03-18 08:24:37.263	2026-03-18 08:24:37.263	\N
27	2	17	2	4	2	1	COMPLETED	2026-03-17 19:20:24.707	2026-03-18 09:21:18.47	\N
28	2	17	2	5	2	1	COMPLETED	2026-03-17 19:20:24.717	2026-03-18 09:21:18.47	\N
24	2	15	1	4	2	1	COMPLETED	2026-03-17 11:40:45.891	2026-03-24 19:10:31.406	\N
35	2	19	9	4	2	1	OPEN	2026-03-24 19:13:56.69	2026-03-24 19:13:56.69	\N
36	2	19	9	5	2	1	OPEN	2026-03-24 19:13:56.698	2026-03-24 19:13:56.698	\N
6	2	8	2	4	2	1	CANCELLED	2026-03-15 19:09:43.934	2026-03-24 19:30:00.127	\N
37	2	20	2	4	2	1	OPEN	2026-03-24 21:06:28.917	2026-03-24 21:06:28.917	\N
34	2	18	9	4	2	1	CANCELLED	2026-03-18 15:54:10.447	2026-03-24 21:56:28.667	\N
31	2	17	2	5	2	1	CANCELLED	2026-03-18 08:24:14.8	2026-03-24 21:56:30.298	\N
30	2	17	2	4	2	1	CANCELLED	2026-03-18 08:24:14.792	2026-03-24 21:56:31.283	\N
38	2	20	2	5	2	1	OPEN	2026-03-24 21:06:28.923	2026-03-25 07:28:42.999	\N
29	2	15	1	4	2	1	CANCELLED	2026-03-18 08:23:01.471	2026-03-25 09:55:35.582	\N
39	2	21	10	4	2	1	COMPLETED	2026-03-25 09:54:55.568	2026-03-25 09:58:22.158	\N
40	2	21	10	5	2	1	COMPLETED	2026-03-25 09:54:55.576	2026-03-25 09:58:22.158	\N
41	2	22	7	4	2	1	OPEN	2026-03-25 11:39:24.599	2026-03-25 11:39:24.599	2026-03-25 12:30:00
42	2	22	7	5	2	1	OPEN	2026-03-25 11:39:24.605	2026-03-25 11:39:24.605	2026-03-25 12:30:00
43	2	23	10	4	2	1	OPEN	2026-03-25 11:57:24.08	2026-03-25 11:57:24.08	\N
44	2	24	3	5	2	1	OPEN	2026-03-25 12:20:35.614	2026-03-25 12:20:35.614	\N
\.


--
-- Data for Name: KitchenTicketItem; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."KitchenTicketItem" (id, "ticketId", "orderItemId", quantity, "createdAt") FROM stdin;
1	1	1	1	2026-03-09 16:49:04.048
2	1	2	1	2026-03-09 16:49:04.048
3	2	26	1	2026-03-15 16:19:25.438
4	2	27	1	2026-03-15 16:19:25.438
5	3	28	1	2026-03-15 16:20:20.09
6	4	29	1	2026-03-15 16:37:36.555
7	5	30	1	2026-03-15 16:38:14.133
8	5	31	1	2026-03-15 16:38:14.133
9	6	32	1	2026-03-15 19:09:43.938
10	6	33	1	2026-03-15 19:09:43.938
11	6	34	1	2026-03-15 19:09:43.938
12	7	35	1	2026-03-15 19:09:43.942
13	8	36	1	2026-03-15 19:10:11.606
14	9	37	1	2026-03-15 19:10:11.611
15	10	38	1	2026-03-15 19:19:07.606
16	11	39	1	2026-03-15 19:19:07.614
17	12	40	1	2026-03-15 20:20:40.005
18	13	41	1	2026-03-16 04:34:20.88
19	14	42	1	2026-03-16 12:26:27.666
20	15	43	1	2026-03-16 12:26:27.67
21	16	44	1	2026-03-16 12:28:59.288
22	17	45	1	2026-03-17 10:48:15.741
23	18	46	1	2026-03-17 11:10:47.554
24	19	47	1	2026-03-17 11:27:58.429
25	19	49	1	2026-03-17 11:27:58.429
26	19	50	1	2026-03-17 11:27:58.429
27	19	51	1	2026-03-17 11:27:58.429
28	20	48	1	2026-03-17 11:27:58.443
29	21	52	1	2026-03-17 11:39:59.354
30	21	53	1	2026-03-17 11:39:59.354
31	22	54	1	2026-03-17 11:39:59.362
32	22	55	1	2026-03-17 11:39:59.362
33	23	56	1	2026-03-17 11:40:21.894
34	24	57	1	2026-03-17 11:40:45.899
35	25	58	1	2026-03-17 12:15:13.765
36	26	59	1	2026-03-17 12:15:13.774
37	27	60	1	2026-03-17 19:20:24.712
38	28	61	1	2026-03-17 19:20:24.722
39	29	62	1	2026-03-18 08:23:01.48
40	30	63	1	2026-03-18 08:24:14.795
41	30	64	1	2026-03-18 08:24:14.795
42	31	65	1	2026-03-18 08:24:14.805
43	32	66	1	2026-03-18 08:24:37.26
44	33	67	1	2026-03-18 08:24:37.265
45	34	68	1	2026-03-18 15:54:10.451
46	35	69	1	2026-03-24 19:13:56.695
47	35	72	1	2026-03-24 19:13:56.695
48	36	70	1	2026-03-24 19:13:56.7
49	36	71	1	2026-03-24 19:13:56.7
50	37	73	1	2026-03-24 21:06:28.921
51	38	74	1	2026-03-24 21:06:28.925
52	39	75	1	2026-03-25 09:54:55.573
53	40	76	1	2026-03-25 09:54:55.578
54	40	77	1	2026-03-25 09:54:55.578
55	41	78	1	2026-03-25 11:39:24.603
56	41	79	1	2026-03-25 11:39:24.603
57	42	80	1	2026-03-25 11:39:24.607
58	43	81	1	2026-03-25 11:57:24.085
59	44	82	1	2026-03-25 12:20:35.618
\.


--
-- Data for Name: LocationSettings; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."LocationSettings" (id, "locationId", "statsConfig", "saleConfig", "rsvpConfig", "displayConfig", "tablesConfig", "filterConfig", "logConfig", "createdAt", "updatedAt") FROM stdin;
51	3	{"showCovers": true, "showRevenue": true, "showTopItems": true, "defaultPeriod": "today", "showAverageCheck": true}	{"allowVoid": true, "allowNotes": true, "requireTable": false, "allowDiscounts": true, "allowScheduledOrders": true}	{"allowMixed": true, "allowAllDayMenu": true, "allowSocialLunch": true, "showTablesOption": true, "allowGuestOverride": true}	{"showTableName": true, "showServerName": true, "showElapsedTime": true, "autoRefreshSeconds": 10}	{"colorByStatus": true, "showOccupancy": true, "showActiveOrders": true}	{"showVoided": false, "defaultPeriod": "today", "defaultStatus": "all"}	{"logLevel": "info", "retentionDays": 30}	2026-03-25 11:57:59.868	2026-03-25 11:57:59.868
3	2	{"daily": {"events": true, "revenue": true, "tickets": true, "foodCost": true, "laborCost": true, "beverageCost": true, "popularItems": true, "avgOrderValue": true}, "weekly": {"events": true, "revenue": true, "tickets": true, "foodCost": true, "laborCost": true, "beverageCost": true, "popularItems": true, "avgOrderValue": true}}	{"noticeEnabled": true, "noticeMessage": "Notice: short staffed in the Kitchen, longer than normal wait times for food items...", "showNonMember": true, "autoGroupOrders": true, "memberDiscounts": [{"color": "green", "value": 10}, {"color": "green", "value": 15}, {"color": "purple", "value": 20}, {"color": "red", "value": 25}], "showSkipSeating": true, "autoGroupMinutes": 3, "nonMemberDiscounts": [{"color": "green", "value": 10}, {"color": "green", "value": 15}, {"color": "purple", "value": 20}, {"color": "red", "value": 25}], "nonMemberPriceIncrease": true, "showAllModifiersByDefault": true, "nonMemberPriceIncreasePercent": 10}	{"allowMixed": true, "allowAllDayMenu": true, "allowSocialLunch": true, "showTablesOption": true, "allowGuestOverride": true}	{}	{"layouts": [{"x": 253, "y": 236, "id": 1, "seats": 4, "shape": "square"}, {"x": 460, "y": 51, "id": 2, "seats": 4, "shape": "square"}, {"x": 428, "y": 227, "id": 3, "seats": 2, "shape": "square"}, {"x": 260, "y": 65, "id": 4, "seats": 2, "shape": "square"}, {"x": 284, "y": 101, "id": 5, "seats": 4, "shape": "square"}, {"x": 753, "y": 132, "id": 6, "seats": 6, "shape": "square"}, {"x": 632, "y": 144, "id": 7, "seats": 6, "shape": "round"}, {"x": 444, "y": 470, "id": 8, "seats": 6, "shape": "round"}, {"x": 818, "y": 135, "id": 9, "seats": 6, "shape": "round"}, {"x": 44.844203770395325, "y": 69.91100204797289, "id": 10, "seats": 2, "shape": "round"}]}	{}	{}	2026-03-18 09:03:59.441	2026-03-25 09:11:13.391
\.


--
-- Data for Name: Membership; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."Membership" (id, "guestId", "membershipLevel", "membershipNumber", "discountPercent", "isActive", "createdAt", "updatedAt") FROM stdin;
1	1	GOLD	GOLD-0001	10.00	t	2026-03-09 16:49:03.682	2026-03-09 16:49:03.682
2	2	SILVER	CC-2	4.00	t	2026-03-24 20:19:31.061	2026-03-24 20:19:31.061
\.


--
-- Data for Name: MenuCategory; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."MenuCategory" (id, "locationId", name, slug, description, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
5	2	Burgers	burgers	Burgers and sandwiches	1	t	2026-03-09 16:49:03.778	2026-03-09 16:49:03.778
6	2	Pizza	pizza	Stone baked pizza	2	t	2026-03-09 16:49:03.784	2026-03-09 16:49:03.784
7	2	Drinks	drinks	Soft drinks and bar	3	t	2026-03-09 16:49:03.788	2026-03-09 16:49:03.788
8	2	Sides	sides	Snacks and sides	4	t	2026-03-09 16:49:03.794	2026-03-09 16:49:03.794
1	3	Starters	starters	\N	1	t	2026-03-25 11:57:58.613	2026-03-25 11:57:58.613
2	3	Soups	soups	\N	2	t	2026-03-25 11:57:58.622	2026-03-25 11:57:58.622
3	3	Salads	salads	\N	3	t	2026-03-25 11:57:58.632	2026-03-25 11:57:58.632
4	3	Main Course	main	\N	4	t	2026-03-25 11:57:58.641	2026-03-25 11:57:58.641
9	3	Hot Drinks	hot-drinks	\N	9	t	2026-03-25 11:57:58.67	2026-03-25 11:57:58.67
10	3	Alcohol	alcohol	\N	10	t	2026-03-25 11:57:58.678	2026-03-25 11:57:58.678
\.


--
-- Data for Name: MenuItem; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."MenuItem" (id, "locationId", "categoryId", name, sku, description, "basePrice", "taxRate", "isAlcohol", "isActive", "kdsStationId", "createdAt", "updatedAt", allergens) FROM stdin;
10	2	5	Cheeseburger	BURGER-CHEESE	Beef patty with cheddar cheese	13.50	20.00	f	t	4	2026-03-09 16:49:03.808	2026-03-09 16:49:03.808	{}
14	2	8	Caesar Salad	SALAD-CAESAR	Romaine, parmesan, croutons	9.00	20.00	f	t	4	2026-03-09 16:49:03.839	2026-03-09 16:49:03.839	{}
16	2	7	Orange Juice	DRINK-OJ	Fresh orange juice	4.50	20.00	f	t	5	2026-03-09 16:49:03.855	2026-03-09 16:49:03.855	{}
17	2	7	Draft Beer	DRINK-BEER	House lager 0.5L	5.00	20.00	t	t	5	2026-03-09 16:49:03.86	2026-03-09 16:49:03.86	{}
29	3	8	Orange Juice	SD-003	\N	3.50	0.00	f	t	7	2026-03-25 11:57:58.969	2026-03-25 11:57:58.969	{}
30	3	8	Still Water	SD-004	\N	1.50	0.00	f	t	7	2026-03-25 11:57:58.977	2026-03-25 11:57:58.977	{}
31	3	8	Sparkling Water	SD-005	\N	1.80	0.00	f	t	7	2026-03-25 11:57:58.985	2026-03-25 11:57:58.985	{}
32	3	9	Latte	HD-001	\N	3.90	0.00	f	t	7	2026-03-25 11:57:58.993	2026-03-25 11:57:58.993	{}
33	3	9	Americano	HD-002	\N	2.90	0.00	f	t	7	2026-03-25 11:57:59.001	2026-03-25 11:57:59.001	{}
34	3	9	Cappuccino	HD-003	\N	3.50	0.00	f	t	7	2026-03-25 11:57:59.008	2026-03-25 11:57:59.008	{}
35	3	9	Espresso	HD-004	\N	2.20	0.00	f	t	7	2026-03-25 11:57:59.015	2026-03-25 11:57:59.015	{}
36	3	9	Tea	HD-005	\N	2.50	0.00	f	t	7	2026-03-25 11:57:59.022	2026-03-25 11:57:59.022	{}
37	3	10	Lager Beer (0.5L)	AL-001	\N	4.50	0.00	t	t	7	2026-03-25 11:57:59.034	2026-03-25 11:57:59.034	{}
38	3	10	Dark Beer (0.5L)	AL-002	\N	4.90	0.00	t	t	7	2026-03-25 11:57:59.042	2026-03-25 11:57:59.042	{}
39	3	10	House Red Wine	AL-003	\N	6.50	0.00	t	t	7	2026-03-25 11:57:59.048	2026-03-25 11:57:59.048	{}
40	3	10	House White Wine	AL-004	\N	6.50	0.00	t	t	7	2026-03-25 11:57:59.057	2026-03-25 11:57:59.057	{}
13	2	8	French Fries	SIDE-FRIES	Crispy fries	5.50	20.00	f	t	4	2026-03-09 16:49:03.834	2026-03-25 08:48:46.741	{}
41	3	10	Prosecco (glass)	AL-005	\N	7.50	0.00	t	t	7	2026-03-25 11:57:59.063	2026-03-25 11:57:59.063	{}
42	3	10	Whisky (50ml)	AL-006	\N	8.00	0.00	t	t	7	2026-03-25 11:57:59.071	2026-03-25 11:57:59.071	{}
43	3	10	Vodka (50ml)	AL-007	\N	5.50	0.00	t	t	7	2026-03-25 11:57:59.079	2026-03-25 11:57:59.079	{}
44	3	10	Gin & Tonic	AL-008	\N	9.00	0.00	t	t	7	2026-03-25 11:57:59.086	2026-03-25 11:57:59.086	{}
15	2	7	Cola	DRINK-COLA	330ml bottle	3.50	20.00	f	t	5	2026-03-09 16:49:03.848	2026-03-25 08:56:19.423	{Egg,Fish,Corn,"Test allegen"}
18	2	7	Sprite	\N	\N	2.45	\N	f	t	5	2026-03-25 09:02:10.429	2026-03-25 09:02:10.429	{}
19	2	7	Fanta	\N	\N	2.00	\N	f	t	5	2026-03-25 09:02:52.327	2026-03-25 09:02:52.327	{}
9	2	5	TEST BURGER UI	BURGER-CLASSIC	Beef patty, lettuce, tomato, pickles	12.50	20.00	f	f	4	2026-03-09 16:49:03.801	2026-03-25 11:44:11.636	{}
1	3	1	French Fries	ST-001	\N	3.50	0.00	f	t	6	2026-03-25 11:57:58.694	2026-03-25 11:57:58.694	{}
2	3	1	Chicken Wings	ST-002	\N	6.90	0.00	f	t	6	2026-03-25 11:57:58.71	2026-03-25 11:57:58.71	{}
4	3	1	Nachos	ST-004	\N	6.20	0.00	f	t	6	2026-03-25 11:57:58.736	2026-03-25 11:57:58.736	{}
5	3	2	Tomato Soup	SO-001	\N	5.00	0.00	f	t	6	2026-03-25 11:57:58.746	2026-03-25 11:57:58.746	{}
6	3	2	French Onion Soup	SO-002	\N	6.00	0.00	f	t	6	2026-03-25 11:57:58.758	2026-03-25 11:57:58.758	{}
7	3	3	Caesar Salad	SA-001	\N	8.50	0.00	f	t	6	2026-03-25 11:57:58.772	2026-03-25 11:57:58.772	{}
8	3	3	Greek Salad	SA-002	\N	7.90	0.00	f	t	6	2026-03-25 11:57:58.781	2026-03-25 11:57:58.781	{}
20	3	6	Pepperoni Pizza	PP-003	\N	12.90	0.00	f	t	6	2026-03-25 11:57:58.899	2026-03-25 11:57:58.899	{}
21	3	6	Spaghetti Carbonara	PP-004	\N	11.00	0.00	f	t	6	2026-03-25 11:57:58.906	2026-03-25 11:57:58.906	{}
22	3	6	Penne Arrabbiata	PP-005	\N	10.00	0.00	f	t	6	2026-03-25 11:57:58.914	2026-03-25 11:57:58.914	{}
25	3	7	Creme Brulee	DS-003	\N	6.50	0.00	f	t	6	2026-03-25 11:57:58.938	2026-03-25 11:57:58.938	{}
28	3	8	Lemonade	SD-002	\N	3.00	0.00	f	t	7	2026-03-25 11:57:58.961	2026-03-25 11:57:58.961	{}
3	3	1	Bruschetta	ST-003	\N	5.50	0.00	f	t	6	2026-03-25 11:57:58.725	2026-03-25 12:22:06.026	{}
12	2	6	Pepperoni Pizza	PIZZA-PEPP	Tomato, mozzarella, pepperoni	16.00	20.00	f	f	6	2026-03-09 16:49:03.825	2026-03-25 12:26:10.793	{Sulfites,Dairy,Gluten,Egg}
11	2	6	Margherita Pizza	PIZZA-MARG	Tomato, mozzarella, basil	20.00	20.00	f	t	4	2026-03-09 16:49:03.818	2026-03-25 12:27:05.271	{}
24	3	4	Tiramisu	DS-002	\N	5.90	0.00	f	t	6	2026-03-25 11:57:58.931	2026-03-25 12:27:30.515	{}
26	3	4	Ice Cream (2 scoops)	DS-004	\N	4.50	0.00	f	t	6	2026-03-25 11:57:58.945	2026-03-25 12:27:42.64	{}
27	3	4	Cola	SD-001	\N	2.80	0.00	f	t	7	2026-03-25 11:57:58.953	2026-03-25 12:28:20.359	{}
23	3	7	Cheesecake	DS-001	\N	5.20	0.00	f	t	6	2026-03-25 11:57:58.923	2026-03-25 12:29:58.91	{}
\.


--
-- Data for Name: MenuItemModifierGroup; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."MenuItemModifierGroup" (id, "menuItemId", "modifierGroupId") FROM stdin;
12	9	9
13	9	10
14	10	9
15	10	10
16	11	11
17	12	11
18	15	12
19	16	12
20	17	12
21	12	10
22	13	13
23	19	12
24	1	2
25	2	2
26	18	3
27	18	2
28	19	4
29	19	5
30	14	1
31	14	9
32	14	10
33	15	1
34	15	9
35	15	10
36	32	6
37	32	7
38	27	8
39	37	8
40	12	9
41	20	11
\.


--
-- Data for Name: ModifierGroup; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."ModifierGroup" (id, "locationId", name, "minSelected", "maxSelected", "isRequired", "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
9	2	Burger Add-ons	0	3	f	1	t	2026-03-09 16:49:03.87	2026-03-09 16:49:03.87
10	2	Burger Cooking	1	1	t	2	t	2026-03-09 16:49:03.877	2026-03-09 16:49:03.877
11	2	Pizza Extras	0	3	f	3	t	2026-03-09 16:49:03.882	2026-03-09 16:49:03.882
12	2	Drink Size	1	1	t	4	t	2026-03-09 16:49:03.89	2026-03-09 16:49:03.89
13	2	test	\N	\N	f	\N	t	2026-03-24 19:32:17.825	2026-03-24 19:32:17.825
1	3	Cooking Preference	1	1	t	\N	t	2026-03-25 11:57:59.097	2026-03-25 11:57:59.097
2	3	Sauce Choice	0	2	f	\N	t	2026-03-25 11:57:59.149	2026-03-25 11:57:59.149
3	3	Burger Add-ons	0	5	f	\N	t	2026-03-25 11:57:59.194	2026-03-25 11:57:59.194
4	3	Pizza Size	1	1	t	\N	t	2026-03-25 11:57:59.297	2026-03-25 11:57:59.297
5	3	Extra Toppings	0	6	f	\N	t	2026-03-25 11:57:59.54	2026-03-25 11:57:59.54
6	3	Milk	0	1	f	\N	t	2026-03-25 11:57:59.693	2026-03-25 11:57:59.693
7	3	Syrup	0	2	f	\N	t	2026-03-25 11:57:59.745	2026-03-25 11:57:59.745
8	3	Ice	0	1	f	\N	t	2026-03-25 11:57:59.759	2026-03-25 11:57:59.759
\.


--
-- Data for Name: ModifierOption; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."ModifierOption" (id, "modifierGroupId", name, "priceDelta", "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
28	9	Extra Cheese	1.50	1	t	2026-03-09 16:49:03.895	2026-03-09 16:49:03.895
29	9	Bacon	2.00	2	t	2026-03-09 16:49:03.901	2026-03-09 16:49:03.901
30	9	Jalapeno	1.00	3	t	2026-03-09 16:49:03.907	2026-03-09 16:49:03.907
31	10	Medium Rare	0.00	1	t	2026-03-09 16:49:03.912	2026-03-09 16:49:03.912
32	10	Medium	0.00	2	t	2026-03-09 16:49:03.915	2026-03-09 16:49:03.915
33	10	Well Done	0.00	3	t	2026-03-09 16:49:03.919	2026-03-09 16:49:03.919
34	11	Extra Mozzarella	1.50	1	t	2026-03-09 16:49:03.922	2026-03-09 16:49:03.922
35	11	Mushrooms	1.20	2	t	2026-03-09 16:49:03.928	2026-03-09 16:49:03.928
36	11	Olives	1.20	3	t	2026-03-09 16:49:03.933	2026-03-09 16:49:03.933
37	12	Small	0.00	1	t	2026-03-09 16:49:03.936	2026-03-09 16:49:03.936
38	12	Large	1.00	2	t	2026-03-09 16:49:03.94	2026-03-09 16:49:03.94
1	1	Rare	\N	\N	t	2026-03-25 11:57:59.112	2026-03-25 11:57:59.112
2	1	Medium Rare	\N	\N	t	2026-03-25 11:57:59.124	2026-03-25 11:57:59.124
3	1	Medium	\N	\N	t	2026-03-25 11:57:59.132	2026-03-25 11:57:59.132
4	1	Well-done	\N	\N	t	2026-03-25 11:57:59.139	2026-03-25 11:57:59.139
5	2	BBQ	\N	\N	t	2026-03-25 11:57:59.157	2026-03-25 11:57:59.157
6	2	Mayo	\N	\N	t	2026-03-25 11:57:59.163	2026-03-25 11:57:59.163
7	2	Ketchup	\N	\N	t	2026-03-25 11:57:59.171	2026-03-25 11:57:59.171
8	2	Spicy sauce	0.30	\N	t	2026-03-25 11:57:59.181	2026-03-25 11:57:59.181
9	3	Extra cheese	1.00	\N	t	2026-03-25 11:57:59.202	2026-03-25 11:57:59.202
10	3	Bacon	1.50	\N	t	2026-03-25 11:57:59.209	2026-03-25 11:57:59.209
11	3	Jalapeño	0.70	\N	t	2026-03-25 11:57:59.217	2026-03-25 11:57:59.217
12	3	Avocado	1.20	\N	t	2026-03-25 11:57:59.223	2026-03-25 11:57:59.223
13	3	No onions	\N	\N	t	2026-03-25 11:57:59.262	2026-03-25 11:57:59.262
14	3	No tomato	\N	\N	t	2026-03-25 11:57:59.28	2026-03-25 11:57:59.28
15	4	Small 25cm	0.00	\N	t	2026-03-25 11:57:59.335	2026-03-25 11:57:59.335
16	4	Medium 30cm	2.00	\N	t	2026-03-25 11:57:59.412	2026-03-25 11:57:59.412
17	4	Large 35cm	4.00	\N	t	2026-03-25 11:57:59.493	2026-03-25 11:57:59.493
18	5	Mushrooms	1.00	\N	t	2026-03-25 11:57:59.582	2026-03-25 11:57:59.582
19	5	Olives	0.80	\N	t	2026-03-25 11:57:59.614	2026-03-25 11:57:59.614
20	5	Pepperoni	1.50	\N	t	2026-03-25 11:57:59.634	2026-03-25 11:57:59.634
21	5	Extra mozzarella	1.20	\N	t	2026-03-25 11:57:59.65	2026-03-25 11:57:59.65
22	5	Roasted peppers	0.90	\N	t	2026-03-25 11:57:59.674	2026-03-25 11:57:59.674
23	6	Regular	\N	\N	t	2026-03-25 11:57:59.706	2026-03-25 11:57:59.706
24	6	Oat milk	0.70	\N	t	2026-03-25 11:57:59.717	2026-03-25 11:57:59.717
25	6	Almond milk	0.90	\N	t	2026-03-25 11:57:59.729	2026-03-25 11:57:59.729
26	6	Lactose-free	0.50	\N	t	2026-03-25 11:57:59.74	2026-03-25 11:57:59.74
27	7	Vanilla	0.50	\N	t	2026-03-25 11:57:59.749	2026-03-25 11:57:59.749
39	10	Mushroom sauce	\N	\N	t	2026-03-25 11:57:59.801	2026-03-25 11:57:59.801
40	10	Red wine sauce	\N	\N	t	2026-03-25 11:57:59.805	2026-03-25 11:57:59.805
41	10	Garlic butter	\N	\N	t	2026-03-25 11:57:59.808	2026-03-25 11:57:59.808
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."Order" (id, "locationId", "terminalId", "shiftId", "tableId", "guestId", "membershipId", "parentOrderId", "orderType", status, "subtotalAmount", "discountAmount", "serviceChargeAmount", "taxAmount", "totalAmount", "openedByUserId", "closedByUserId", "openedAt", "closedAt", note, "createdAt", "updatedAt", "serverUserId") FROM stdin;
13	2	2	1	4	\N	\N	\N	DINE_IN	OPEN	84.40	0.00	0.00	16.88	101.28	1	\N	2026-03-17 11:27:58.354	\N	\N	2026-03-17 11:27:58.359	2026-03-18 08:24:37.274	\N
17	2	2	1	2	\N	\N	\N	DINE_IN	PAID	55.50	0.00	0.00	11.10	66.60	1	1	2026-03-17 19:20:24.64	2026-03-18 09:21:18.382	\N	2026-03-17 19:20:24.645	2026-03-18 09:21:18.417	\N
18	2	2	1	9	\N	\N	\N	DINE_IN	PAID	14.50	0.00	0.00	2.90	17.40	1	1	2026-03-18 15:54:10.409	2026-03-24 14:32:38.965	\N	2026-03-18 15:54:10.412	2026-03-24 14:32:38.986	\N
15	2	2	1	1	\N	\N	\N	DINE_IN	PAID	28.00	0.00	0.00	5.60	33.60	1	1	2026-03-17 11:40:45.852	2026-03-24 19:10:31.369	\N	2026-03-17 11:40:45.856	2026-03-24 19:10:31.382	\N
19	2	2	1	9	\N	\N	\N	DINE_IN	OPEN	40.70	0.00	0.00	8.14	48.84	1	\N	2026-03-24 19:13:56.584	\N	\N	2026-03-24 19:13:56.589	2026-03-24 19:13:56.711	\N
20	2	2	1	2	\N	\N	\N	DINE_IN	OPEN	20.50	0.00	0.00	4.10	24.60	1	\N	2026-03-24 21:06:28.833	\N	\N	2026-03-24 21:06:28.839	2026-03-24 21:06:28.943	\N
5	2	2	1	5	\N	\N	\N	DINE_IN	OPEN	44.50	0.00	0.00	8.90	53.40	1	\N	2026-03-15 16:19:25.405	\N	\N	2026-03-15 16:19:25.406	2026-03-15 16:20:20.096	\N
3	2	2	1	3	\N	\N	\N	DINE_IN	PAID	96.10	0.00	0.00	19.22	115.32	1	1	2026-03-15 15:04:24.385	2026-03-15 16:28:22.936	\N	2026-03-15 15:04:24.386	2026-03-15 16:28:22.938	\N
1	2	2	1	1	1	1	\N	DINE_IN	PAID	55.35	0.00	0.00	11.07	66.42	2	1	2026-03-09 16:49:03.969	2026-03-15 16:37:46.921	Demo open table order	2026-03-09 16:49:03.975	2026-03-15 16:37:46.924	\N
21	2	2	1	10	\N	\N	\N	DINE_IN	PAID	25.20	0.00	0.00	5.04	30.24	1	1	2026-03-25 09:54:55.441	2026-03-25 09:58:22.127	\N	2026-03-25 09:54:55.47	2026-03-25 09:58:22.134	\N
6	2	2	1	3	\N	\N	\N	DINE_IN	PAID	12.50	0.00	0.00	2.50	15.00	1	1	2026-03-15 16:37:36.393	2026-03-15 19:10:17.988	\N	2026-03-15 16:37:36.397	2026-03-15 19:10:17.99	\N
2	2	2	1	4	\N	\N	\N	DINE_IN	PAID	158.90	0.00	0.00	31.78	190.68	1	1	2026-03-15 14:57:34.084	2026-03-15 19:10:21.818	\N	2026-03-15 14:57:34.128	2026-03-15 19:10:21.819	\N
7	2	2	1	1	\N	\N	\N	DINE_IN	PAID	30.00	0.00	0.00	6.00	36.00	1	1	2026-03-15 16:38:14.109	2026-03-15 19:10:23.502	\N	2026-03-15 16:38:14.111	2026-03-15 19:10:23.502	\N
8	2	2	1	2	\N	\N	\N	DINE_IN	PAID	54.00	0.00	0.00	10.80	64.80	1	1	2026-03-15 19:09:43.853	2026-03-15 19:18:40.944	\N	2026-03-15 19:09:43.867	2026-03-15 19:18:40.964	\N
22	2	2	1	7	\N	\N	\N	DINE_IN	OPEN	35.70	0.00	0.00	6.54	42.24	1	\N	2026-03-25 11:39:24.408	\N	\N	2026-03-25 11:39:24.451	2026-03-25 11:39:24.624	\N
23	2	2	1	10	\N	\N	\N	DINE_IN	OPEN	15.20	0.00	0.00	3.04	18.24	1	\N	2026-03-25 11:57:24.009	\N	\N	2026-03-25 11:57:24.028	2026-03-25 11:57:24.097	\N
10	2	2	1	7	\N	\N	\N	DINE_IN	PAID	14.50	0.00	0.00	2.90	17.40	1	1	2026-03-15 20:20:39.97	2026-03-16 04:35:30.681	\N	2026-03-15 20:20:39.973	2026-03-16 04:35:30.682	\N
24	2	2	1	3	\N	\N	\N	DINE_IN	OPEN	3.95	0.00	0.00	0.00	3.95	1	\N	2026-03-25 12:18:35.557	\N	\N	2026-03-25 12:18:35.571	2026-03-25 12:20:35.649	\N
25	2	2	1	1	\N	\N	\N	DINE_IN	OPEN	0.00	0.00	0.00	0.00	0.00	1	\N	2026-03-25 12:23:43.93	\N	\N	2026-03-25 12:23:43.932	2026-03-25 12:23:43.932	\N
11	2	2	1	3	\N	\N	\N	DINE_IN	PAID	14.50	0.00	0.00	2.90	17.40	1	1	2026-03-16 04:34:20.858	2026-03-17 11:28:03.098	\N	2026-03-16 04:34:20.859	2026-03-17 11:28:03.1	\N
9	2	2	1	1	\N	\N	\N	DINE_IN	PAID	37.20	0.00	0.00	7.44	44.64	1	1	2026-03-15 19:19:07.499	2026-03-17 11:29:00.477	\N	2026-03-15 19:19:07.504	2026-03-17 11:29:00.477	\N
12	2	2	1	2	\N	\N	\N	DINE_IN	PAID	47.50	0.00	0.00	9.50	57.00	1	1	2026-03-16 12:26:27.633	2026-03-17 11:36:47.162	\N	2026-03-16 12:26:27.636	2026-03-17 11:36:47.2	\N
4	2	2	1	6	\N	\N	\N	DINE_IN	PAID	15.00	0.00	0.00	3.00	18.00	1	1	2026-03-15 15:21:52.731	2026-03-17 11:36:54.638	\N	2026-03-15 15:21:52.732	2026-03-17 11:36:54.64	\N
16	2	2	1	2	\N	\N	\N	DINE_IN	PAID	18.50	0.00	0.00	3.70	22.20	1	1	2026-03-17 12:15:13.644	2026-03-17 12:15:24.553	\N	2026-03-17 12:15:13.671	2026-03-17 12:15:24.555	\N
14	2	2	1	3	\N	\N	\N	DINE_IN	PAID	52.50	0.00	0.00	10.50	63.00	1	1	2026-03-17 11:39:59.151	2026-03-17 12:15:25.827	\N	2026-03-17 11:39:59.182	2026-03-17 12:15:25.831	\N
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."OrderItem" (id, "orderId", "menuItemId", "seatNumber", quantity, "basePrice", "discountAmount", "finalPrice", comment, "kdsStatus", status, "voidedAt", "voidedByUserId", "voidReason", "createdAt", "updatedAt", "courseNumber") FROM stdin;
3	1	15	2	2	3.50	1.15	6.15	One with ice, one without	PENDING	ACTIVE	\N	\N	\N	2026-03-09 16:49:04.027	2026-03-09 16:49:04.027	\N
4	1	9	1	1	12.50	0.00	12.50	curl test with api key	PENDING	ACTIVE	\N	\N	\N	2026-03-15 14:48:24.85	2026-03-15 14:48:24.85	\N
5	2	9	2	1	12.50	0.00	14.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 14:57:34.239	2026-03-15 14:57:34.239	\N
6	3	10	2	1	13.50	0.00	15.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 15:04:24.396	2026-03-15 15:04:24.396	\N
7	3	11	2	1	14.00	0.00	15.20	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 15:04:24.403	2026-03-15 15:04:24.403	\N
8	2	11	2	1	14.00	0.00	15.20	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 15:14:42.577	2026-03-15 15:14:42.577	\N
9	2	16	2	1	4.50	0.00	5.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 15:14:42.586	2026-03-15 15:14:42.586	\N
10	2	10	2	1	13.50	0.00	15.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 15:14:42.596	2026-03-15 15:14:42.596	\N
11	3	10	2	1	13.50	0.00	15.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 15:21:29.518	2026-03-15 15:21:29.518	\N
12	3	12	2	2	32.00	0.00	34.40	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 15:21:29.528	2026-03-15 15:21:29.528	\N
13	4	10	5	1	13.50	0.00	15.00	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 15:21:52.743	2026-03-15 15:21:52.743	\N
14	2	11	2	1	14.00	0.00	15.20	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 15:24:44.493	2026-03-15 15:24:44.493	\N
15	1	17	3	1	5.00	0.00	6.00	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 15:53:55.519	2026-03-15 15:53:55.519	\N
1	1	9	1	1	12.50	1.25	11.25	No onions	READY	ACTIVE	\N	\N	\N	2026-03-09 16:49:04.002	2026-03-15 16:04:16.578	\N
2	1	13	1	1	5.50	0.55	4.95	\N	SERVED	ACTIVE	\N	\N	\N	2026-03-09 16:49:04.02	2026-03-15 16:04:19.868	\N
16	1	9	4	1	12.50	0.00	14.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 16:05:50.201	2026-03-15 16:05:50.201	\N
17	3	10	2	1	13.50	0.00	15.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 16:06:15.408	2026-03-15 16:06:15.408	\N
18	2	9	2	1	12.50	0.00	14.00	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 16:08:07.469	2026-03-15 16:08:07.469	\N
19	2	13	2	1	5.50	0.00	5.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 16:08:07.476	2026-03-15 16:08:07.476	\N
20	2	15	2	2	7.00	0.00	9.00	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 16:08:07.483	2026-03-15 16:08:07.483	\N
21	2	9	2	1	12.50	0.00	12.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 16:08:07.491	2026-03-15 16:08:07.491	\N
22	2	17	2	1	5.00	0.00	6.00	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 16:08:07.499	2026-03-15 16:08:07.499	\N
23	2	9	2	1	12.50	0.00	14.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 16:08:07.504	2026-03-15 16:08:07.504	\N
24	2	9	2	1	12.50	0.00	14.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 16:08:07.512	2026-03-15 16:08:07.512	\N
25	2	10	2	1	13.50	0.00	17.00	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 16:08:07.523	2026-03-15 16:08:07.523	\N
56	14	9	2	1	12.50	0.00	12.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-17 11:40:21.882	2026-03-17 11:40:21.882	\N
31	7	10	4	1	13.50	0.00	15.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 16:38:14.128	2026-03-15 16:38:14.128	\N
30	7	9	4	1	12.50	0.00	14.50	\N	IN_PROGRESS	ACTIVE	\N	\N	\N	2026-03-15 16:38:14.122	2026-03-15 16:39:42.834	\N
58	16	9	3	1	12.50	0.00	13.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-17 12:15:13.718	2026-03-17 12:15:13.718	\N
32	8	9	4	1	12.50	0.00	14.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 19:09:43.903	2026-03-15 19:09:43.903	\N
33	8	14	4	1	9.00	0.00	9.00	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 19:09:43.917	2026-03-15 19:09:43.917	\N
34	8	13	4	1	5.50	0.00	5.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 19:09:43.922	2026-03-15 19:09:43.922	\N
35	8	15	4	1	3.50	0.00	4.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 19:09:43.929	2026-03-15 19:09:43.929	\N
36	8	9	3	1	12.50	0.00	14.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 19:10:11.589	2026-03-15 19:10:11.589	\N
39	9	16	3	1	4.50	0.00	5.50	\N	IN_PROGRESS	ACTIVE	\N	\N	\N	2026-03-15 19:19:07.586	2026-03-15 19:19:53.117	\N
38	9	9	3	1	12.50	0.00	14.50	\N	IN_PROGRESS	ACTIVE	\N	\N	\N	2026-03-15 19:19:07.532	2026-03-15 19:19:54.884	\N
65	17	17	3	1	5.00	0.00	6.00	\N	SERVED	ACTIVE	\N	\N	\N	2026-03-18 08:24:14.786	2026-03-24 14:41:26.603	\N
40	10	9	8	1	12.50	0.00	14.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-15 20:20:39.996	2026-03-15 20:20:39.996	\N
37	8	17	3	1	5.00	0.00	6.00	\N	SERVED	ACTIVE	\N	\N	\N	2026-03-15 19:10:11.599	2026-03-16 04:35:01.601	\N
42	12	9	4	1	12.50	0.00	14.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-16 12:26:27.652	2026-03-16 12:26:27.652	\N
43	12	17	4	1	5.00	0.00	5.00	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-16 12:26:27.659	2026-03-16 12:26:27.659	\N
41	11	9	2	1	12.50	0.00	14.50	\N	IN_PROGRESS	ACTIVE	\N	\N	\N	2026-03-16 04:34:20.873	2026-03-16 12:26:59.511	\N
62	15	9	3	1	12.50	0.00	14.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-18 08:23:01.435	2026-03-18 08:23:44.579	\N
29	6	9	2	1	12.50	0.00	12.50	\N	SERVED	ACTIVE	\N	\N	\N	2026-03-15 16:37:36.464	2026-03-17 11:37:22.82	\N
45	12	10	3	1	13.50	0.00	13.50	\N	SERVED	ACTIVE	\N	\N	\N	2026-03-17 10:48:15.734	2026-03-17 11:37:24.448	\N
46	12	9	3	1	12.50	0.00	14.50	\N	SERVED	ACTIVE	\N	\N	\N	2026-03-17 11:10:47.524	2026-03-17 11:37:25.396	\N
44	9	12	3	1	16.00	0.00	17.20	\N	SERVED	ACTIVE	\N	\N	\N	2026-03-16 12:28:59.269	2026-03-17 11:37:27.101	\N
52	14	10	2	1	13.50	0.00	15.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-17 11:39:59.255	2026-03-17 11:39:59.255	\N
53	14	9	2	1	12.50	0.00	14.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-17 11:39:59.292	2026-03-17 11:39:59.292	\N
54	14	16	2	1	4.50	0.00	5.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-17 11:39:59.311	2026-03-17 11:39:59.311	\N
55	14	15	2	1	3.50	0.00	4.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-17 11:39:59.336	2026-03-17 11:39:59.336	\N
63	17	10	3	1	13.50	0.00	15.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-18 08:24:14.766	2026-03-18 08:24:14.766	\N
59	16	17	3	1	5.00	0.00	5.00	\N	SERVED	ACTIVE	\N	\N	\N	2026-03-17 12:15:13.748	2026-03-17 19:20:42.567	\N
57	15	10	4	1	13.50	0.00	13.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-17 11:40:45.883	2026-03-18 08:11:53.424	\N
47	13	9	2	1	12.50	0.00	14.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-17 11:27:58.375	2026-03-18 08:19:25.491	\N
49	13	10	2	1	13.50	0.00	13.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-17 11:27:58.395	2026-03-18 08:19:25.491	\N
51	13	12	2	1	16.00	0.00	17.20	\N	READY	ACTIVE	\N	\N	\N	2026-03-17 11:27:58.413	2026-03-18 08:19:25.544	\N
48	13	17	2	1	5.00	0.00	5.00	\N	READY	ACTIVE	\N	\N	\N	2026-03-17 11:27:58.385	2026-03-18 08:13:09.147	\N
61	17	17	1	1	5.00	0.00	6.00	\N	READY	ACTIVE	\N	\N	\N	2026-03-17 19:20:24.693	2026-03-18 08:13:12.305	\N
50	13	9	2	1	12.50	0.00	14.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-17 11:27:58.403	2026-03-18 08:19:25.545	\N
60	17	9	1	1	12.50	0.00	12.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-17 19:20:24.668	2026-03-18 08:19:28.172	\N
26	5	10	4	1	13.50	0.00	15.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-15 16:19:25.415	2026-03-18 08:19:32.706	\N
27	5	9	4	1	12.50	0.00	14.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-15 16:19:25.424	2026-03-18 08:19:38.692	\N
28	5	10	3	1	13.50	0.00	14.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-15 16:20:20.079	2026-03-18 08:19:41.272	\N
64	17	9	3	1	12.50	0.00	15.50	\N	IN_PROGRESS	ACTIVE	\N	\N	\N	2026-03-18 08:24:14.774	2026-03-18 08:24:47.346	\N
68	18	9	7	1	12.50	0.00	14.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-18 15:54:10.435	2026-03-18 15:54:10.435	\N
66	13	11	2	1	14.00	0.00	15.20	\N	READY	ACTIVE	\N	\N	\N	2026-03-18 08:24:37.24	2026-03-25 12:11:02.666	\N
73	20	9	3	1	12.50	0.00	14.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-24 21:06:28.874	2026-03-25 09:56:37.568	\N
74	20	17	3	1	5.00	0.00	6.00	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-24 21:06:28.907	2026-03-24 21:06:28.907	\N
69	19	12	6	1	16.00	0.00	17.20	\N	READY	ACTIVE	\N	\N	\N	2026-03-24 19:13:56.62	2026-03-24 19:29:53.919	\N
72	19	9	6	1	12.50	0.00	14.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-24 19:13:56.684	2026-03-24 19:29:53.919	\N
75	21	12	2	1	16.00	0.00	17.20	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-25 09:54:55.516	2026-03-25 09:54:55.516	\N
70	19	15	6	1	3.50	0.00	4.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-24 19:13:56.657	2026-03-24 21:56:58.172	\N
71	19	16	6	1	4.50	0.00	4.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-24 19:13:56.676	2026-03-24 21:56:58.172	\N
77	21	16	2	1	4.50	0.00	4.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-25 09:54:55.56	2026-03-25 09:58:07.536	\N
78	22	12	6	1	16.00	0.00	17.20	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-25 11:39:24.515	2026-03-25 11:39:24.515	\N
76	21	15	2	1	3.50	0.00	3.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-25 09:54:55.551	2026-03-25 09:58:07.459	\N
79	22	11	6	1	14.00	0.00	15.50	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-25 11:39:24.556	2026-03-25 11:39:24.556	\N
80	22	19	6	1	2.00	0.00	3.00	\N	PENDING	ACTIVE	\N	\N	\N	2026-03-25 11:39:24.581	2026-03-25 11:39:24.581	\N
67	13	15	2	1	3.50	0.00	4.50	\N	READY	ACTIVE	\N	\N	\N	2026-03-18 08:24:37.25	2026-03-25 11:57:29.936	\N
81	23	11	2	1	14.00	0.00	15.20	\N	READY	ACTIVE	\N	\N	\N	2026-03-25 11:57:24.061	2026-03-25 12:14:26.557	\N
82	24	18	2	1	2.45	0.00	3.95	\N	IN_PROGRESS	ACTIVE	\N	\N	\N	2026-03-25 12:20:35.596	2026-03-25 12:20:51.077	\N
\.


--
-- Data for Name: OrderItemModifier; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."OrderItemModifier" (id, "orderItemId", "modifierOptionId", "priceDelta", "createdAt", "updatedAt") FROM stdin;
1	1	28	1.50	2026-03-09 16:49:04.012	2026-03-09 16:49:04.012
2	1	32	0.00	2026-03-09 16:49:04.012	2026-03-09 16:49:04.012
3	3	38	1.00	2026-03-09 16:49:04.033	2026-03-09 16:49:04.033
4	5	29	2.00	2026-03-15 14:57:34.26	2026-03-15 14:57:34.26
5	5	31	0.00	2026-03-15 14:57:34.26	2026-03-15 14:57:34.26
6	6	29	2.00	2026-03-15 15:04:24.398	2026-03-15 15:04:24.398
7	6	31	0.00	2026-03-15 15:04:24.398	2026-03-15 15:04:24.398
8	7	35	1.20	2026-03-15 15:04:24.409	2026-03-15 15:04:24.409
9	8	35	1.20	2026-03-15 15:14:42.58	2026-03-15 15:14:42.58
10	9	38	1.00	2026-03-15 15:14:42.589	2026-03-15 15:14:42.589
11	10	29	2.00	2026-03-15 15:14:42.604	2026-03-15 15:14:42.604
12	10	33	0.00	2026-03-15 15:14:42.604	2026-03-15 15:14:42.604
13	11	29	2.00	2026-03-15 15:21:29.52	2026-03-15 15:21:29.52
14	11	31	0.00	2026-03-15 15:21:29.52	2026-03-15 15:21:29.52
15	12	36	1.20	2026-03-15 15:21:29.53	2026-03-15 15:21:29.53
16	13	28	1.50	2026-03-15 15:21:52.746	2026-03-15 15:21:52.746
17	13	32	0.00	2026-03-15 15:21:52.746	2026-03-15 15:21:52.746
18	14	35	1.20	2026-03-15 15:24:44.504	2026-03-15 15:24:44.504
19	15	38	1.00	2026-03-15 15:53:55.523	2026-03-15 15:53:55.523
20	16	29	2.00	2026-03-15 16:05:50.203	2026-03-15 16:05:50.203
21	16	31	0.00	2026-03-15 16:05:50.203	2026-03-15 16:05:50.203
22	17	29	2.00	2026-03-15 16:06:15.41	2026-03-15 16:06:15.41
23	17	33	0.00	2026-03-15 16:06:15.41	2026-03-15 16:06:15.41
24	18	28	1.50	2026-03-15 16:08:07.471	2026-03-15 16:08:07.471
25	18	32	0.00	2026-03-15 16:08:07.471	2026-03-15 16:08:07.471
26	20	38	1.00	2026-03-15 16:08:07.487	2026-03-15 16:08:07.487
27	22	38	1.00	2026-03-15 16:08:07.5	2026-03-15 16:08:07.5
28	23	29	2.00	2026-03-15 16:08:07.505	2026-03-15 16:08:07.505
29	23	31	0.00	2026-03-15 16:08:07.505	2026-03-15 16:08:07.505
30	24	29	2.00	2026-03-15 16:08:07.519	2026-03-15 16:08:07.519
31	24	32	0.00	2026-03-15 16:08:07.519	2026-03-15 16:08:07.519
32	25	28	1.50	2026-03-15 16:08:07.525	2026-03-15 16:08:07.525
33	25	29	2.00	2026-03-15 16:08:07.525	2026-03-15 16:08:07.525
34	25	31	0.00	2026-03-15 16:08:07.525	2026-03-15 16:08:07.525
35	26	29	2.00	2026-03-15 16:19:25.417	2026-03-15 16:19:25.417
36	26	31	0.00	2026-03-15 16:19:25.417	2026-03-15 16:19:25.417
37	27	29	2.00	2026-03-15 16:19:25.426	2026-03-15 16:19:25.426
38	27	31	0.00	2026-03-15 16:19:25.426	2026-03-15 16:19:25.426
39	28	30	1.00	2026-03-15 16:20:20.083	2026-03-15 16:20:20.083
40	28	33	0.00	2026-03-15 16:20:20.083	2026-03-15 16:20:20.083
41	29	31	0.00	2026-03-15 16:37:36.475	2026-03-15 16:37:36.475
42	30	29	2.00	2026-03-15 16:38:14.124	2026-03-15 16:38:14.124
43	30	32	0.00	2026-03-15 16:38:14.124	2026-03-15 16:38:14.124
44	31	29	2.00	2026-03-15 16:38:14.129	2026-03-15 16:38:14.129
45	31	32	0.00	2026-03-15 16:38:14.129	2026-03-15 16:38:14.129
46	32	29	2.00	2026-03-15 19:09:43.911	2026-03-15 19:09:43.911
47	32	32	0.00	2026-03-15 19:09:43.911	2026-03-15 19:09:43.911
48	35	38	1.00	2026-03-15 19:09:43.931	2026-03-15 19:09:43.931
49	36	29	2.00	2026-03-15 19:10:11.592	2026-03-15 19:10:11.592
50	36	33	0.00	2026-03-15 19:10:11.592	2026-03-15 19:10:11.592
51	37	38	1.00	2026-03-15 19:10:11.601	2026-03-15 19:10:11.601
52	38	29	2.00	2026-03-15 19:19:07.545	2026-03-15 19:19:07.545
53	38	32	0.00	2026-03-15 19:19:07.545	2026-03-15 19:19:07.545
54	39	38	1.00	2026-03-15 19:19:07.593	2026-03-15 19:19:07.593
55	40	29	2.00	2026-03-15 20:20:39.999	2026-03-15 20:20:39.999
56	40	32	0.00	2026-03-15 20:20:39.999	2026-03-15 20:20:39.999
57	41	29	2.00	2026-03-16 04:34:20.875	2026-03-16 04:34:20.875
58	41	31	0.00	2026-03-16 04:34:20.875	2026-03-16 04:34:20.875
59	42	29	2.00	2026-03-16 12:26:27.654	2026-03-16 12:26:27.654
60	42	33	0.00	2026-03-16 12:26:27.654	2026-03-16 12:26:27.654
61	43	37	0.00	2026-03-16 12:26:27.661	2026-03-16 12:26:27.661
62	44	35	1.20	2026-03-16 12:28:59.282	2026-03-16 12:28:59.282
63	45	32	0.00	2026-03-17 10:48:15.736	2026-03-17 10:48:15.736
64	46	29	2.00	2026-03-17 11:10:47.539	2026-03-17 11:10:47.539
65	46	33	0.00	2026-03-17 11:10:47.539	2026-03-17 11:10:47.539
66	47	29	2.00	2026-03-17 11:27:58.377	2026-03-17 11:27:58.377
67	47	33	0.00	2026-03-17 11:27:58.377	2026-03-17 11:27:58.377
68	48	37	0.00	2026-03-17 11:27:58.388	2026-03-17 11:27:58.388
69	49	32	0.00	2026-03-17 11:27:58.399	2026-03-17 11:27:58.399
70	50	29	2.00	2026-03-17 11:27:58.409	2026-03-17 11:27:58.409
71	50	33	0.00	2026-03-17 11:27:58.409	2026-03-17 11:27:58.409
72	51	35	1.20	2026-03-17 11:27:58.418	2026-03-17 11:27:58.418
73	52	29	2.00	2026-03-17 11:39:59.272	2026-03-17 11:39:59.272
74	52	33	0.00	2026-03-17 11:39:59.272	2026-03-17 11:39:59.272
75	53	29	2.00	2026-03-17 11:39:59.296	2026-03-17 11:39:59.296
76	53	32	0.00	2026-03-17 11:39:59.296	2026-03-17 11:39:59.296
77	54	38	1.00	2026-03-17 11:39:59.316	2026-03-17 11:39:59.316
78	55	38	1.00	2026-03-17 11:39:59.338	2026-03-17 11:39:59.338
79	56	31	0.00	2026-03-17 11:40:21.885	2026-03-17 11:40:21.885
80	57	32	0.00	2026-03-17 11:40:45.885	2026-03-17 11:40:45.885
81	58	30	1.00	2026-03-17 12:15:13.732	2026-03-17 12:15:13.732
82	58	32	0.00	2026-03-17 12:15:13.732	2026-03-17 12:15:13.732
83	59	37	0.00	2026-03-17 12:15:13.753	2026-03-17 12:15:13.753
84	60	32	0.00	2026-03-17 19:20:24.682	2026-03-17 19:20:24.682
85	61	38	1.00	2026-03-17 19:20:24.701	2026-03-17 19:20:24.701
86	62	29	2.00	2026-03-18 08:23:01.459	2026-03-18 08:23:01.459
87	62	32	0.00	2026-03-18 08:23:01.459	2026-03-18 08:23:01.459
88	63	29	2.00	2026-03-18 08:24:14.768	2026-03-18 08:24:14.768
89	63	32	0.00	2026-03-18 08:24:14.768	2026-03-18 08:24:14.768
90	64	29	2.00	2026-03-18 08:24:14.779	2026-03-18 08:24:14.779
91	64	30	1.00	2026-03-18 08:24:14.779	2026-03-18 08:24:14.779
92	64	33	0.00	2026-03-18 08:24:14.779	2026-03-18 08:24:14.779
93	65	38	1.00	2026-03-18 08:24:14.788	2026-03-18 08:24:14.788
94	66	35	1.20	2026-03-18 08:24:37.244	2026-03-18 08:24:37.244
95	67	38	1.00	2026-03-18 08:24:37.253	2026-03-18 08:24:37.253
96	68	29	2.00	2026-03-18 15:54:10.443	2026-03-18 15:54:10.443
97	68	32	0.00	2026-03-18 15:54:10.443	2026-03-18 15:54:10.443
98	69	35	1.20	2026-03-24 19:13:56.633	2026-03-24 19:13:56.633
99	70	38	1.00	2026-03-24 19:13:56.666	2026-03-24 19:13:56.666
100	71	37	0.00	2026-03-24 19:13:56.679	2026-03-24 19:13:56.679
101	72	29	2.00	2026-03-24 19:13:56.687	2026-03-24 19:13:56.687
102	72	32	0.00	2026-03-24 19:13:56.687	2026-03-24 19:13:56.687
103	73	29	2.00	2026-03-24 21:06:28.891	2026-03-24 21:06:28.891
104	73	32	0.00	2026-03-24 21:06:28.891	2026-03-24 21:06:28.891
105	74	38	1.00	2026-03-24 21:06:28.912	2026-03-24 21:06:28.912
106	75	31	0.00	2026-03-25 09:54:55.533	2026-03-25 09:54:55.533
107	75	35	1.20	2026-03-25 09:54:55.533	2026-03-25 09:54:55.533
108	76	37	0.00	2026-03-25 09:54:55.554	2026-03-25 09:54:55.554
109	77	37	0.00	2026-03-25 09:54:55.563	2026-03-25 09:54:55.563
110	78	32	0.00	2026-03-25 11:39:24.538	2026-03-25 11:39:24.538
111	78	35	1.20	2026-03-25 11:39:24.538	2026-03-25 11:39:24.538
112	79	34	1.50	2026-03-25 11:39:24.563	2026-03-25 11:39:24.563
113	80	38	1.00	2026-03-25 11:39:24.59	2026-03-25 11:39:24.59
114	81	35	1.20	2026-03-25 11:57:24.071	2026-03-25 11:57:24.071
115	82	7	0.00	2026-03-25 12:20:35.607	2026-03-25 12:20:35.607
116	82	10	1.50	2026-03-25 12:20:35.607	2026-03-25 12:20:35.607
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."Payment" (id, "orderId", "shiftId", "terminalId", amount, "tipAmount", "paymentMethod", provider, "transactionId", status, "paidAt", "createdAt", "updatedAt") FROM stdin;
1	1	1	2	10.00	0.00	CARD	demo-terminal	TXN-DEMO-0001	APPROVED	2026-03-09 16:49:04.07	2026-03-09 16:49:04.074	2026-03-09 16:49:04.074
2	3	1	2	115.32	0.00	CASH	manual-pay-close	3-1773592102915	APPROVED	2026-03-15 16:28:22.915	2026-03-15 16:28:22.925	2026-03-15 16:28:22.925
3	1	1	2	56.42	0.00	CASH	manual-pay-close	1-1773592666914	APPROVED	2026-03-15 16:37:46.914	2026-03-15 16:37:46.916	2026-03-15 16:37:46.916
4	6	1	2	15.00	0.00	CASH	manual-pay-close	6-1773601817983	APPROVED	2026-03-15 19:10:17.983	2026-03-15 19:10:17.984	2026-03-15 19:10:17.984
5	2	1	2	190.68	0.00	CASH	manual-pay-close	2-1773601821810	APPROVED	2026-03-15 19:10:21.81	2026-03-15 19:10:21.814	2026-03-15 19:10:21.814
6	7	1	2	36.00	0.00	CASH	manual-pay-close	7-1773601823498	APPROVED	2026-03-15 19:10:23.498	2026-03-15 19:10:23.499	2026-03-15 19:10:23.499
7	8	1	2	64.80	0.00	CASH	manual-pay-close	8-1773602320882	APPROVED	2026-03-15 19:18:40.882	2026-03-15 19:18:40.914	2026-03-15 19:18:40.914
8	10	1	2	17.40	0.00	CASH	manual-pay-close	10-1773635730673	APPROVED	2026-03-16 04:35:30.673	2026-03-16 04:35:30.675	2026-03-16 04:35:30.675
9	11	1	2	17.40	0.00	CASH	manual-pay-close	11-1773746883086	APPROVED	2026-03-17 11:28:03.086	2026-03-17 11:28:03.087	2026-03-17 11:28:03.087
10	9	1	2	44.64	0.00	CASH	manual-pay-close	9-1773746940473	APPROVED	2026-03-17 11:29:00.473	2026-03-17 11:29:00.474	2026-03-17 11:29:00.474
11	12	1	2	57.00	0.00	CASH	manual-pay-close	12-1773747407067	APPROVED	2026-03-17 11:36:47.067	2026-03-17 11:36:47.125	2026-03-17 11:36:47.125
12	4	1	2	18.00	0.00	CASH	manual-pay-close	4-1773747414605	APPROVED	2026-03-17 11:36:54.605	2026-03-17 11:36:54.616	2026-03-17 11:36:54.616
13	16	1	2	22.20	0.00	CASH	manual-pay-close	16-1773749724531	APPROVED	2026-03-17 12:15:24.531	2026-03-17 12:15:24.534	2026-03-17 12:15:24.534
14	14	1	2	63.00	0.00	CASH	manual-pay-close	14-1773749725813	APPROVED	2026-03-17 12:15:25.813	2026-03-17 12:15:25.816	2026-03-17 12:15:25.816
15	17	1	2	66.60	0.00	CASH	manual-pay-close	17-1773825678341	APPROVED	2026-03-18 09:21:18.341	2026-03-18 09:21:18.359	2026-03-18 09:21:18.359
16	18	1	2	17.40	0.00	CASH	manual-pay-close	18-1774362758934	APPROVED	2026-03-24 14:32:38.934	2026-03-24 14:32:38.945	2026-03-24 14:32:38.945
17	15	1	2	33.60	0.00	CASH	manual-pay-close	15-1774379431342	APPROVED	2026-03-24 19:10:31.342	2026-03-24 19:10:31.355	2026-03-24 19:10:31.355
18	21	1	2	30.24	0.00	CASH	manual-pay-close	21-1774432702096	APPROVED	2026-03-25 09:58:22.096	2026-03-25 09:58:22.107	2026-03-25 09:58:22.107
\.


--
-- Data for Name: PaymentRefund; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."PaymentRefund" (id, "paymentId", "orderId", "shiftId", "terminalId", amount, reason, provider, "refundTransactionId", status, "refundedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: ReportSnapshot; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."ReportSnapshot" (id, "locationId", "shiftId", date, type, "dataJson", "createdAt") FROM stdin;
\.


--
-- Data for Name: Reservation; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."Reservation" (id, "locationId", "guestId", "reservationTime", "partySize", status, source, note, "createdAt", "updatedAt", "serviceType") FROM stdin;
1	2	1	2026-03-09 18:49:03.686	4	CONFIRMED	PHONE	Birthday dinner	2026-03-09 16:49:03.759	2026-03-09 16:49:03.759	\N
2	2	2	2026-03-13 12:00:00	2	PENDING	PHONE	\N	2026-03-18 09:56:15.85	2026-03-18 09:56:15.85	ALL_DAY_MENU
3	2	3	2026-03-19 13:11:00	2	PENDING	PHONE	\N	2026-03-18 10:06:39.855	2026-03-18 10:06:39.855	ALL_DAY_MENU
4	2	\N	2026-03-18 10:00:00	2	PENDING	PHONE	\N	2026-03-18 10:06:46.698	2026-03-18 10:06:46.698	ALL_DAY_MENU
5	2	4	2026-03-19 11:11:00	2	PENDING	PHONE	\N	2026-03-18 10:09:18.525	2026-03-18 10:09:18.525	ALL_DAY_MENU
6	2	5	2026-03-19 11:11:00	2	PENDING	PHONE	\N	2026-03-18 10:09:46.69	2026-03-18 10:09:46.69	ALL_DAY_MENU
7	2	6	2026-03-19 11:11:00	2	PENDING	PHONE	\N	2026-03-18 10:12:48.893	2026-03-18 10:12:48.893	ALL_DAY_MENU
\.


--
-- Data for Name: ReservationTable; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."ReservationTable" (id, "reservationId", "tableId") FROM stdin;
1	1	2
2	2	1
3	3	1
4	4	7
5	5	1
6	6	1
7	7	4
\.


--
-- Data for Name: RestaurantLocation; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."RestaurantLocation" (id, name, code, timezone, address, phone, "isActive", "createdAt", "updatedAt") FROM stdin;
2	Demo Hospitality	DEMO	Europe/Kiev	Demo Street 1	+380000000000	t	2026-03-09 16:49:03.553	2026-03-09 16:49:03.553
3	City Club	CITY	Europe/Kiev	City Club Address	+380000000000	t	2026-03-25 11:57:58.281	2026-03-25 11:57:58.281
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."Role" (id, name, "permissionsJson", "createdAt", "updatedAt") FROM stdin;
1	admin	{"all": true}	2026-03-09 16:49:03.524	2026-03-09 16:49:03.524
2	manager	{"voids": true, "reports": true, "discounts": true, "shiftControl": true}	2026-03-09 16:49:03.538	2026-03-09 16:49:03.538
3	cashier	{"pos": true, "payments": true, "openOrders": true}	2026-03-09 16:49:03.543	2026-03-09 16:49:03.543
4	waiter	{"pos": true, "tables": true, "sendToKitchen": true}	2026-03-09 16:49:03.546	2026-03-09 16:49:03.546
5	admin	{}	2026-03-15 19:54:50.944	2026-03-15 19:54:50.944
6	manager	{}	2026-03-15 19:54:50.944	2026-03-15 19:54:50.944
7	waiter	{}	2026-03-15 19:54:50.944	2026-03-15 19:54:50.944
8	cashier	{}	2026-03-15 19:54:50.944	2026-03-15 19:54:50.944
9	kitchen	{}	2026-03-15 19:54:50.944	2026-03-15 19:54:50.944
\.


--
-- Data for Name: SavedFilter; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."SavedFilter" (id, "locationId", "userId", name, scope, "filterJson", "isDefault", "createdAt", "updatedAt") FROM stdin;
1	2	4	Open Orders	ORDERS	{"status": ["OPEN", "SENT_TO_KITCHEN"]}	t	2026-03-09 16:49:04.065	2026-03-09 16:49:04.065
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."Session" (id, token, "locationId", "terminalId", "userId", "createdAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: Shift; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."Shift" (id, "locationId", "userId", "terminalId", "openedAt", "closedAt", "openingCashAmount", "closingCashAmount", status, "createdAt", "updatedAt") FROM stdin;
1	2	2	2	2026-03-09 16:49:03.962	\N	200.00	\N	OPEN	2026-03-09 16:49:03.966	2026-03-09 16:49:03.966
2	3	1	5	2026-03-25 11:57:59.883	\N	0.00	\N	OPEN	2026-03-25 11:57:59.884	2026-03-25 11:57:59.884
\.


--
-- Data for Name: Table; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."Table" (id, "locationId", "areaId", name, capacity, status, "isActive", "createdAt", "updatedAt", "activeOrderId") FROM stdin;
5	2	2	P1	4	occupied	t	2026-03-09 16:49:03.639	2026-03-15 16:19:25.409	5
6	2	2	P2	6	available	t	2026-03-09 16:49:03.645	2026-03-17 11:36:54.652	\N
4	2	1	T4	2	occupied	t	2026-03-09 16:49:03.633	2026-03-18 08:24:37.277	13
8	2	2	Table 3	8	available	t	2026-03-18 08:49:13.753	2026-03-18 08:49:13.753	\N
9	2	1	Table 4	8	occupied	t	2026-03-18 08:49:32.196	2026-03-24 19:13:56.714	19
2	2	1	T2	4	occupied	t	2026-03-09 16:49:03.623	2026-03-24 21:06:28.946	20
7	2	1	T5	9	occupied	t	2026-03-15 20:20:12.015	2026-03-25 11:39:24.626	22
10	2	1	table 2	2	occupied	t	2026-03-18 15:34:12.227	2026-03-25 11:57:24.099	23
11	3	2	P3	4	free	t	2026-03-25 11:57:58.56	2026-03-25 11:57:58.56	\N
12	3	2	P4	4	free	t	2026-03-25 11:57:58.566	2026-03-25 11:57:58.566	\N
13	3	3	B1	2	free	t	2026-03-25 11:57:58.576	2026-03-25 11:57:58.576	\N
14	3	3	B2	2	free	t	2026-03-25 11:57:58.585	2026-03-25 11:57:58.585	\N
15	3	3	B3	2	free	t	2026-03-25 11:57:58.592	2026-03-25 11:57:58.592	\N
16	3	3	B4	2	free	t	2026-03-25 11:57:58.6	2026-03-25 11:57:58.6	\N
3	2	1	T3	2	occupied	t	2026-03-09 16:49:03.629	2026-03-25 12:20:35.655	24
1	2	1	T1	4	occupied	t	2026-03-09 16:49:03.617	2026-03-25 12:23:43.943	25
\.


--
-- Data for Name: Terminal; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."Terminal" (id, "locationId", name, code, "deviceType", "kdsStationId", "isActive", "createdAt", "updatedAt") FROM stdin;
2	2	Front POS	POS-1	POS	4	t	2026-03-09 16:49:03.579	2026-03-09 16:49:03.579
3	2	Bar POS	BAR-1	BAR	5	t	2026-03-09 16:49:03.588	2026-03-09 16:49:03.588
4	2	Kitchen Screen	KDS-1	KDS	4	t	2026-03-09 16:49:03.596	2026-03-09 16:49:03.596
5	3	POS 1	POS-1	POS	\N	t	2026-03-25 11:57:58.34	2026-03-25 11:57:58.34
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."User" (id, "locationId", "firstName", "lastName", "pinCode", email, phone, "roleId", "isActive", "createdAt", "updatedAt", "avatarColor") FROM stdin;
4	2	Kate	Manager	4444	manager@example.com	\N	2	t	2026-03-09 16:49:03.666	2026-03-09 16:49:03.666	\N
5	2	test	test	1234	\N	\N	6	t	2026-03-17 17:46:59.48	2026-03-17 17:46:59.48	#F472B6
6	2	Adam	Fitz	4343	\N	\N	6	t	2026-03-17 19:18:20.905	2026-03-17 19:18:20.905	#7EB8F7
7	2	test	test	1234	\N	\N	6	t	2026-03-25 07:42:54.44	2026-03-25 07:42:54.44	#A78BFA
3	2	Anna	Waiter	3334	\N	\N	4	t	2026-03-09 16:49:03.661	2026-03-25 08:47:08.131	#22C55E
1	2	System	Admin	1111	\N	\N	1	t	2026-03-09 16:49:03.652	2026-03-25 11:14:45.733	#3B82F6
2	2	John	Cashier	2222	\N	\N	3	t	2026-03-09 16:49:03.656	2026-03-25 11:14:53.68	#EF4444
\.


--
-- Data for Name: UserDevice; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public."UserDevice" (id, "userId", token, platform, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: hospitality
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
366de530-853a-45cd-ab4e-8e8c52d48ea5	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	2026-03-24 19:49:02.347664+00	0_init		\N	2026-03-24 19:49:02.347664+00	0
7d978c16-d15d-4849-b20c-0714f49614a3	58c0078514139364f0dec0fd3240a765d1569c1db58209a88db823d2c4d7446c	\N	20260126200649_init	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260126200649_init\n\nDatabase error code: 42710\n\nDatabase error:\nERROR: type "DeviceType" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42710), message: "type \\"DeviceType\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("typecmds.c"), line: Some(1167), routine: Some("DefineEnum") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260126200649_init"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260126200649_init"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:248	\N	2026-03-25 11:28:21.603244+00	0
63299d8b-5fc2-41e0-b67a-08180b6b0428	d7b0b27b0f90d27b6d3769513e6e39f6fbb55b62a1b16cb0f754ae0ec31e956b	2026-03-25 11:54:49.907112+00	20260325000000_add_scheduled_time_to_kitchen_ticket		\N	2026-03-25 11:54:49.907112+00	0
\.


--
-- Name: ApiIdempotency_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."ApiIdempotency_id_seq"', 1, false);


--
-- Name: Area_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."Area_id_seq"', 3, true);


--
-- Name: DisplayLayout_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."DisplayLayout_id_seq"', 1, true);


--
-- Name: Guest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."Guest_id_seq"', 6, true);


--
-- Name: KDSStation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."KDSStation_id_seq"', 7, true);


--
-- Name: KitchenTicketItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."KitchenTicketItem_id_seq"', 59, true);


--
-- Name: KitchenTicket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."KitchenTicket_id_seq"', 44, true);


--
-- Name: LocationSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."LocationSettings_id_seq"', 51, true);


--
-- Name: Membership_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."Membership_id_seq"', 2, true);


--
-- Name: MenuCategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."MenuCategory_id_seq"', 8, true);


--
-- Name: MenuItemModifierGroup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."MenuItemModifierGroup_id_seq"', 41, true);


--
-- Name: MenuItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."MenuItem_id_seq"', 19, true);


--
-- Name: ModifierGroup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."ModifierGroup_id_seq"', 13, true);


--
-- Name: ModifierOption_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."ModifierOption_id_seq"', 38, true);


--
-- Name: OrderItemModifier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."OrderItemModifier_id_seq"', 116, true);


--
-- Name: OrderItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."OrderItem_id_seq"', 82, true);


--
-- Name: Order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."Order_id_seq"', 25, true);


--
-- Name: PaymentRefund_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."PaymentRefund_id_seq"', 1, false);


--
-- Name: Payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."Payment_id_seq"', 18, true);


--
-- Name: ReportSnapshot_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."ReportSnapshot_id_seq"', 1, false);


--
-- Name: ReservationTable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."ReservationTable_id_seq"', 7, true);


--
-- Name: Reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."Reservation_id_seq"', 7, true);


--
-- Name: RestaurantLocation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."RestaurantLocation_id_seq"', 3, true);


--
-- Name: Role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."Role_id_seq"', 9, true);


--
-- Name: SavedFilter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."SavedFilter_id_seq"', 1, true);


--
-- Name: Session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."Session_id_seq"', 1, false);


--
-- Name: Shift_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."Shift_id_seq"', 2, true);


--
-- Name: Table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."Table_id_seq"', 10, true);


--
-- Name: Terminal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."Terminal_id_seq"', 5, true);


--
-- Name: UserDevice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."UserDevice_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hospitality
--

SELECT pg_catalog.setval('public."User_id_seq"', 7, true);


--
-- Name: ApiIdempotency ApiIdempotency_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ApiIdempotency"
    ADD CONSTRAINT "ApiIdempotency_pkey" PRIMARY KEY (id);


--
-- Name: Area Area_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Area"
    ADD CONSTRAINT "Area_pkey" PRIMARY KEY (id);


--
-- Name: DisplayLayout DisplayLayout_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."DisplayLayout"
    ADD CONSTRAINT "DisplayLayout_pkey" PRIMARY KEY (id);


--
-- Name: Guest Guest_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Guest"
    ADD CONSTRAINT "Guest_pkey" PRIMARY KEY (id);


--
-- Name: KDSStation KDSStation_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KDSStation"
    ADD CONSTRAINT "KDSStation_pkey" PRIMARY KEY (id);


--
-- Name: KitchenTicketItem KitchenTicketItem_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KitchenTicketItem"
    ADD CONSTRAINT "KitchenTicketItem_pkey" PRIMARY KEY (id);


--
-- Name: KitchenTicket KitchenTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KitchenTicket"
    ADD CONSTRAINT "KitchenTicket_pkey" PRIMARY KEY (id);


--
-- Name: LocationSettings LocationSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."LocationSettings"
    ADD CONSTRAINT "LocationSettings_pkey" PRIMARY KEY (id);


--
-- Name: Membership Membership_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_pkey" PRIMARY KEY (id);


--
-- Name: MenuCategory MenuCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."MenuCategory"
    ADD CONSTRAINT "MenuCategory_pkey" PRIMARY KEY (id);


--
-- Name: MenuItemModifierGroup MenuItemModifierGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."MenuItemModifierGroup"
    ADD CONSTRAINT "MenuItemModifierGroup_pkey" PRIMARY KEY (id);


--
-- Name: MenuItem MenuItem_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_pkey" PRIMARY KEY (id);


--
-- Name: ModifierGroup ModifierGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ModifierGroup"
    ADD CONSTRAINT "ModifierGroup_pkey" PRIMARY KEY (id);


--
-- Name: ModifierOption ModifierOption_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ModifierOption"
    ADD CONSTRAINT "ModifierOption_pkey" PRIMARY KEY (id);


--
-- Name: OrderItemModifier OrderItemModifier_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."OrderItemModifier"
    ADD CONSTRAINT "OrderItemModifier_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PaymentRefund PaymentRefund_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."PaymentRefund"
    ADD CONSTRAINT "PaymentRefund_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ReportSnapshot ReportSnapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ReportSnapshot"
    ADD CONSTRAINT "ReportSnapshot_pkey" PRIMARY KEY (id);


--
-- Name: ReservationTable ReservationTable_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ReservationTable"
    ADD CONSTRAINT "ReservationTable_pkey" PRIMARY KEY (id);


--
-- Name: Reservation Reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY (id);


--
-- Name: RestaurantLocation RestaurantLocation_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."RestaurantLocation"
    ADD CONSTRAINT "RestaurantLocation_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: SavedFilter SavedFilter_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."SavedFilter"
    ADD CONSTRAINT "SavedFilter_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Shift Shift_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Shift"
    ADD CONSTRAINT "Shift_pkey" PRIMARY KEY (id);


--
-- Name: Table Table_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_pkey" PRIMARY KEY (id);


--
-- Name: Terminal Terminal_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Terminal"
    ADD CONSTRAINT "Terminal_pkey" PRIMARY KEY (id);


--
-- Name: UserDevice UserDevice_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."UserDevice"
    ADD CONSTRAINT "UserDevice_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ApiIdempotency_key_key; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE UNIQUE INDEX "ApiIdempotency_key_key" ON public."ApiIdempotency" USING btree (key);


--
-- Name: ApiIdempotency_locationId_terminalId_createdAt_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "ApiIdempotency_locationId_terminalId_createdAt_idx" ON public."ApiIdempotency" USING btree ("locationId", "terminalId", "createdAt");


--
-- Name: ApiIdempotency_terminalId_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "ApiIdempotency_terminalId_idx" ON public."ApiIdempotency" USING btree ("terminalId");


--
-- Name: ApiIdempotency_userId_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "ApiIdempotency_userId_idx" ON public."ApiIdempotency" USING btree ("userId");


--
-- Name: KitchenTicketItem_orderItemId_key; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE UNIQUE INDEX "KitchenTicketItem_orderItemId_key" ON public."KitchenTicketItem" USING btree ("orderItemId");


--
-- Name: KitchenTicketItem_ticketId_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "KitchenTicketItem_ticketId_idx" ON public."KitchenTicketItem" USING btree ("ticketId");


--
-- Name: KitchenTicket_kdsStationId_status_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "KitchenTicket_kdsStationId_status_idx" ON public."KitchenTicket" USING btree ("kdsStationId", status);


--
-- Name: KitchenTicket_locationId_createdAt_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "KitchenTicket_locationId_createdAt_idx" ON public."KitchenTicket" USING btree ("locationId", "createdAt");


--
-- Name: KitchenTicket_orderId_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "KitchenTicket_orderId_idx" ON public."KitchenTicket" USING btree ("orderId");


--
-- Name: LocationSettings_locationId_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "LocationSettings_locationId_idx" ON public."LocationSettings" USING btree ("locationId");


--
-- Name: LocationSettings_locationId_key; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE UNIQUE INDEX "LocationSettings_locationId_key" ON public."LocationSettings" USING btree ("locationId");


--
-- Name: MenuItemModifierGroup_menuItemId_modifierGroupId_key; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE UNIQUE INDEX "MenuItemModifierGroup_menuItemId_modifierGroupId_key" ON public."MenuItemModifierGroup" USING btree ("menuItemId", "modifierGroupId");


--
-- Name: OrderItemModifier_orderItemId_modifierOptionId_key; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE UNIQUE INDEX "OrderItemModifier_orderItemId_modifierOptionId_key" ON public."OrderItemModifier" USING btree ("orderItemId", "modifierOptionId");


--
-- Name: OrderItem_courseNumber_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "OrderItem_courseNumber_idx" ON public."OrderItem" USING btree ("courseNumber");


--
-- Name: OrderItem_voidedByUserId_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "OrderItem_voidedByUserId_idx" ON public."OrderItem" USING btree ("voidedByUserId");


--
-- Name: Order_serverUserId_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "Order_serverUserId_idx" ON public."Order" USING btree ("serverUserId");


--
-- Name: Order_tableId_status_closedAt_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "Order_tableId_status_closedAt_idx" ON public."Order" USING btree ("tableId", status, "closedAt");


--
-- Name: PaymentRefund_orderId_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "PaymentRefund_orderId_idx" ON public."PaymentRefund" USING btree ("orderId");


--
-- Name: PaymentRefund_paymentId_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "PaymentRefund_paymentId_idx" ON public."PaymentRefund" USING btree ("paymentId");


--
-- Name: PaymentRefund_provider_refundTransactionId_key; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE UNIQUE INDEX "PaymentRefund_provider_refundTransactionId_key" ON public."PaymentRefund" USING btree (provider, "refundTransactionId");


--
-- Name: Payment_provider_transactionId_key; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE UNIQUE INDEX "Payment_provider_transactionId_key" ON public."Payment" USING btree (provider, "transactionId");


--
-- Name: ReservationTable_reservationId_tableId_key; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE UNIQUE INDEX "ReservationTable_reservationId_tableId_key" ON public."ReservationTable" USING btree ("reservationId", "tableId");


--
-- Name: Session_expiresAt_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "Session_expiresAt_idx" ON public."Session" USING btree ("expiresAt");


--
-- Name: Session_token_key; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE UNIQUE INDEX "Session_token_key" ON public."Session" USING btree (token);


--
-- Name: Session_userId_locationId_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "Session_userId_locationId_idx" ON public."Session" USING btree ("userId", "locationId");


--
-- Name: Table_activeOrderId_key; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE UNIQUE INDEX "Table_activeOrderId_key" ON public."Table" USING btree ("activeOrderId");


--
-- Name: Table_areaId_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "Table_areaId_idx" ON public."Table" USING btree ("areaId");


--
-- Name: Table_locationId_areaId_name_key; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE UNIQUE INDEX "Table_locationId_areaId_name_key" ON public."Table" USING btree ("locationId", "areaId", name);


--
-- Name: Table_locationId_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "Table_locationId_idx" ON public."Table" USING btree ("locationId");


--
-- Name: UserDevice_token_key; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE UNIQUE INDEX "UserDevice_token_key" ON public."UserDevice" USING btree (token);


--
-- Name: UserDevice_userId_idx; Type: INDEX; Schema: public; Owner: hospitality
--

CREATE INDEX "UserDevice_userId_idx" ON public."UserDevice" USING btree ("userId");


--
-- Name: ApiIdempotency ApiIdempotency_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ApiIdempotency"
    ADD CONSTRAINT "ApiIdempotency_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ApiIdempotency ApiIdempotency_terminalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ApiIdempotency"
    ADD CONSTRAINT "ApiIdempotency_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES public."Terminal"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ApiIdempotency ApiIdempotency_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ApiIdempotency"
    ADD CONSTRAINT "ApiIdempotency_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Area Area_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Area"
    ADD CONSTRAINT "Area_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DisplayLayout DisplayLayout_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."DisplayLayout"
    ADD CONSTRAINT "DisplayLayout_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DisplayLayout DisplayLayout_terminalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."DisplayLayout"
    ADD CONSTRAINT "DisplayLayout_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES public."Terminal"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Guest Guest_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Guest"
    ADD CONSTRAINT "Guest_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KDSStation KDSStation_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KDSStation"
    ADD CONSTRAINT "KDSStation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KitchenTicketItem KitchenTicketItem_orderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KitchenTicketItem"
    ADD CONSTRAINT "KitchenTicketItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES public."OrderItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KitchenTicketItem KitchenTicketItem_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KitchenTicketItem"
    ADD CONSTRAINT "KitchenTicketItem_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."KitchenTicket"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KitchenTicket KitchenTicket_createdByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KitchenTicket"
    ADD CONSTRAINT "KitchenTicket_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KitchenTicket KitchenTicket_kdsStationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KitchenTicket"
    ADD CONSTRAINT "KitchenTicket_kdsStationId_fkey" FOREIGN KEY ("kdsStationId") REFERENCES public."KDSStation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: KitchenTicket KitchenTicket_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KitchenTicket"
    ADD CONSTRAINT "KitchenTicket_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KitchenTicket KitchenTicket_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KitchenTicket"
    ADD CONSTRAINT "KitchenTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KitchenTicket KitchenTicket_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KitchenTicket"
    ADD CONSTRAINT "KitchenTicket_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public."Table"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: KitchenTicket KitchenTicket_terminalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."KitchenTicket"
    ADD CONSTRAINT "KitchenTicket_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES public."Terminal"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LocationSettings LocationSettings_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."LocationSettings"
    ADD CONSTRAINT "LocationSettings_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Membership Membership_guestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Membership"
    ADD CONSTRAINT "Membership_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES public."Guest"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuCategory MenuCategory_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."MenuCategory"
    ADD CONSTRAINT "MenuCategory_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuItemModifierGroup MenuItemModifierGroup_menuItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."MenuItemModifierGroup"
    ADD CONSTRAINT "MenuItemModifierGroup_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuItemModifierGroup MenuItemModifierGroup_modifierGroupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."MenuItemModifierGroup"
    ADD CONSTRAINT "MenuItemModifierGroup_modifierGroupId_fkey" FOREIGN KEY ("modifierGroupId") REFERENCES public."ModifierGroup"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuItem MenuItem_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."MenuCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuItem MenuItem_kdsStationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_kdsStationId_fkey" FOREIGN KEY ("kdsStationId") REFERENCES public."KDSStation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MenuItem MenuItem_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ModifierGroup ModifierGroup_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ModifierGroup"
    ADD CONSTRAINT "ModifierGroup_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ModifierOption ModifierOption_modifierGroupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ModifierOption"
    ADD CONSTRAINT "ModifierOption_modifierGroupId_fkey" FOREIGN KEY ("modifierGroupId") REFERENCES public."ModifierGroup"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItemModifier OrderItemModifier_modifierOptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."OrderItemModifier"
    ADD CONSTRAINT "OrderItemModifier_modifierOptionId_fkey" FOREIGN KEY ("modifierOptionId") REFERENCES public."ModifierOption"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItemModifier OrderItemModifier_orderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."OrderItemModifier"
    ADD CONSTRAINT "OrderItemModifier_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES public."OrderItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_menuItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_voidedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_voidedByUserId_fkey" FOREIGN KEY ("voidedByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_closedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_closedByUserId_fkey" FOREIGN KEY ("closedByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_guestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES public."Guest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_membershipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES public."Membership"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_openedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_openedByUserId_fkey" FOREIGN KEY ("openedByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_parentOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_parentOrderId_fkey" FOREIGN KEY ("parentOrderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_serverUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_serverUserId_fkey" FOREIGN KEY ("serverUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."Shift"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public."Table"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_terminalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES public."Terminal"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PaymentRefund PaymentRefund_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."PaymentRefund"
    ADD CONSTRAINT "PaymentRefund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PaymentRefund PaymentRefund_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."PaymentRefund"
    ADD CONSTRAINT "PaymentRefund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public."Payment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."Shift"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_terminalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES public."Terminal"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReportSnapshot ReportSnapshot_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ReportSnapshot"
    ADD CONSTRAINT "ReportSnapshot_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReportSnapshot ReportSnapshot_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ReportSnapshot"
    ADD CONSTRAINT "ReportSnapshot_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."Shift"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReservationTable ReservationTable_reservationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ReservationTable"
    ADD CONSTRAINT "ReservationTable_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES public."Reservation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReservationTable ReservationTable_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."ReservationTable"
    ADD CONSTRAINT "ReservationTable_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public."Table"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_guestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES public."Guest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Reservation Reservation_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SavedFilter SavedFilter_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."SavedFilter"
    ADD CONSTRAINT "SavedFilter_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SavedFilter SavedFilter_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."SavedFilter"
    ADD CONSTRAINT "SavedFilter_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_terminalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES public."Terminal"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Shift Shift_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Shift"
    ADD CONSTRAINT "Shift_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Shift Shift_terminalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Shift"
    ADD CONSTRAINT "Shift_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES public."Terminal"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Shift Shift_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Shift"
    ADD CONSTRAINT "Shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Table Table_activeOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_activeOrderId_fkey" FOREIGN KEY ("activeOrderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Table Table_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public."Area"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Table Table_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Terminal Terminal_kdsStationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Terminal"
    ADD CONSTRAINT "Terminal_kdsStationId_fkey" FOREIGN KEY ("kdsStationId") REFERENCES public."KDSStation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Terminal Terminal_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."Terminal"
    ADD CONSTRAINT "Terminal_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserDevice UserDevice_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."UserDevice"
    ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."RestaurantLocation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hospitality
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict ATLhvrdxnntLyXOsK36g1dR1X1K38O6nLugGFNR7JhAMyUa68dnNovdyrzSGYUM

