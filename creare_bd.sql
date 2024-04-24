DROP TYPE IF EXISTS brands;

CREATE TYPE brands AS ENUM('BMW', 'Mini', 'Dacia', 'Renault', 'Mercedes', 'BMW M', 'Mercedes-AMG', 'Aston Martin', 'McLaren', 'Skoda', 'Volkswagen', 'Audi', 'Ford', 'Nissan', 'Mitsubishi', 'Toyota', 'Lexus', 'Lamborghini', 'Rolls-Royce', 'Fiat', 'Seat', 'Cupra', 'Bentley', 'Porsche', 'Citroen', 'Peugeot','Undefined');


CREATE TABLE IF NOT EXISTS public.masina
(
    id_masina bigint NOT NULL DEFAULT nextval('masina_id_masina_seq'::regclass),
    brand brands  NOT NULL DEFAULT 'Undefined',
    model character varying(128) NOT NULL,
    vin character varying(20) NOT NULL,
    pret integer NOT NULL,
    an_fabricatie integer NOT NULL,
    imagine character varying(255) NOT NULL,
    accident character varying(5) NULL,
    descriere character varying(1024) NOT NULL,
    km integer NOT NULL DEFAULT 0,
    CONSTRAINT masina_pk2 PRIMARY KEY (id_masina),
    CONSTRAINT vin_unique2 UNIQUE (vin)
)

GRANT ALL PRIVILEGES ON DATABASE mds TO alexm1126 ;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO alexm1126;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO alexm1126;