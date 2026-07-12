--
-- PostgreSQL database dump
--

\restrict 7B2jqmFS3dxmJS7u35D2b5bUl6GZW1oSIFrkR6WxTYPQoVbun7OrXduYXADbTav

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

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
-- Name: stream_status; Type: TYPE; Schema: public; Owner: streamhub
--

CREATE TYPE public.stream_status AS ENUM (
    'offline',
    'live',
    'ended'
);


ALTER TYPE public.stream_status OWNER TO neondb_owner;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: streamhub
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'streamer',
    'viewer'
);


ALTER TYPE public.user_role OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: streamhub
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stream_id uuid NOT NULL,
    user_id uuid NOT NULL,
    body character varying(500) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO neondb_owner;

--
-- Name: streams; Type: TABLE; Schema: public; Owner: streamhub
--

CREATE TABLE public.streams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    thumbnail_url text,
    stream_key text NOT NULL,
    status public.stream_status DEFAULT 'offline'::public.stream_status NOT NULL,
    hls_url text,
    viewer_count integer DEFAULT 0 NOT NULL,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.streams OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: streamhub
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(32) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role public.user_role DEFAULT 'viewer'::public.user_role NOT NULL,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: streamhub
--

COPY public.chat_messages (id, stream_id, user_id, body, created_at) FROM stdin;
\.


--
-- Data for Name: streams; Type: TABLE DATA; Schema: public; Owner: streamhub
--

COPY public.streams (id, owner_id, title, description, thumbnail_url, stream_key, status, hls_url, viewer_count, started_at, ended_at, created_at, updated_at) FROM stdin;
d92c3fd0-0a97-40c0-9b04-ea28825a72f3	974427da-3559-4f6c-98ae-51beaa75779e	test	\N	\N	34cccb0ca6159a1705e6769289ee1f6268496026	offline	\N	0	\N	\N	2026-07-12 16:38:03.864931+00	2026-07-12 16:38:03.864931+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: streamhub
--

COPY public.users (id, username, email, password_hash, role, avatar_url, created_at, updated_at) FROM stdin;
cf6f1f46-1553-480c-b78b-534599a0cb78	testuser2	test2@example.com	$2a$12$mWAjbQmZeFtp/InQkG.DkeHasOnZaAMnQpxOtpOcfqraJ46D.59.C	viewer	\N	2026-07-12 15:40:20.697755+00	2026-07-12 15:40:20.697755+00
08862384-1999-4b2f-b1ab-bd3b711f8798	testuser3	test3@example.com	$2a$12$PNStyJFHEBs4Hfc2Eb3CGetqgdLafmzEu5bDhdSdT45NszWS88x1u	viewer	\N	2026-07-12 15:41:04.122183+00	2026-07-12 15:41:04.122183+00
974427da-3559-4f6c-98ae-51beaa75779e	admin	admin@streamhub.local	$2a$12$PMOx8Sd8h1KudCe54y3ed.EM3Rv/WleiGpHIIdCiaJoJUk/JIFRBy	admin	\N	2026-07-12 15:45:52.154196+00	2026-07-12 15:45:52.154196+00
4cf35cdf-5bfe-4bb2-a085-b7370b6b35f5	cxaualiAlt	alinassytb@gmail.com	$2a$12$MgZ1Pm.pcuDaYTIylvyRf.DYP/ra40r8L0KoJWNBxCVfksiiIihfO	viewer	\N	2026-07-12 16:34:57.382887+00	2026-07-12 16:34:57.382887+00
5027874a-00a0-42ea-9d49-6c1ce05450ef	cxauali	bouzidali2006@gmail.com	$2a$12$keHxXcmXNjZmRTIK4rJ/W.0TFPTM/dLy7PgmVU15VYXuB.DuKfKbG	admin	\N	2026-07-12 15:23:46.919568+00	2026-07-12 16:38:27.635944+00
\.


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: streamhub
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: streams streams_pkey; Type: CONSTRAINT; Schema: public; Owner: streamhub
--

ALTER TABLE ONLY public.streams
    ADD CONSTRAINT streams_pkey PRIMARY KEY (id);


--
-- Name: streams streams_stream_key_key; Type: CONSTRAINT; Schema: public; Owner: streamhub
--

ALTER TABLE ONLY public.streams
    ADD CONSTRAINT streams_stream_key_key UNIQUE (stream_key);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: streamhub
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: streamhub
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: streamhub
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_chat_stream; Type: INDEX; Schema: public; Owner: streamhub
--

CREATE INDEX idx_chat_stream ON public.chat_messages USING btree (stream_id, created_at);


--
-- Name: idx_streams_status; Type: INDEX; Schema: public; Owner: streamhub
--

CREATE INDEX idx_streams_status ON public.streams USING btree (status);


--
-- Name: chat_messages chat_messages_stream_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: streamhub
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_stream_id_fkey FOREIGN KEY (stream_id) REFERENCES public.streams(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: streamhub
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: streams streams_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: streamhub
--

ALTER TABLE ONLY public.streams
    ADD CONSTRAINT streams_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 7B2jqmFS3dxmJS7u35D2b5bUl6GZW1oSIFrkR6WxTYPQoVbun7OrXduYXADbTav

