-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.dispute_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dispute_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT dispute_messages_pkey PRIMARY KEY (id),
  CONSTRAINT dispute_messages_dispute_id_disputes_id_fk FOREIGN KEY (dispute_id) REFERENCES public.disputes(id),
  CONSTRAINT dispute_messages_author_id_profiles_id_fk FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.disputes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE,
  opened_by_id uuid NOT NULL,
  reason text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'OPEN'::dispute_status,
  resolution text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT disputes_pkey PRIMARY KEY (id),
  CONSTRAINT disputes_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT disputes_opened_by_id_profiles_id_fk FOREIGN KEY (opened_by_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number character varying NOT NULL UNIQUE,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING'::order_status,
  total_amount numeric NOT NULL,
  shipping_address jsonb NOT NULL,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_buyer_id_profiles_id_fk FOREIGN KEY (buyer_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_seller_id_profiles_id_fk FOREIGN KEY (seller_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  images ARRAY NOT NULL DEFAULT '{}'::text[],
  category character varying NOT NULL,
  condition USER-DEFINED NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_seller_id_profiles_id_fk FOREIGN KEY (seller_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email character varying NOT NULL,
  name character varying NOT NULL,
  avatar_url character varying,
  role USER-DEFINED NOT NULL DEFAULT 'USER'::user_role,
  suspended boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  author_id uuid NOT NULL,
  rating integer NOT NULL,
  comment text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT reviews_author_id_profiles_id_fk FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  verify_token character varying UNIQUE,
  reset_token character varying UNIQUE,
  reset_token_expiry timestamp without time zone,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
