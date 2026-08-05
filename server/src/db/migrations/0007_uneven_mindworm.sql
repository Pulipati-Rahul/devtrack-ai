ALTER TABLE "dsa_problem" ADD COLUMN "status" varchar(50) DEFAULT 'Solved' NOT NULL;--> statement-breakpoint
ALTER TABLE "dsa_problem" ADD COLUMN "time_taken" integer;