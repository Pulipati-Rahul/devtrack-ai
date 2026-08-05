CREATE TABLE "ats_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"resume_id" uuid,
	"resume_name" varchar(255) NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"company" varchar(255) NOT NULL,
	"job_description" text NOT NULL,
	"ats_score" integer NOT NULL,
	"feedback" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ats_analysis" ADD CONSTRAINT "ats_analysis_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ats_analysis" ADD CONSTRAINT "ats_analysis_resume_id_resume_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resume"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ats_analysis_user_id_idx" ON "ats_analysis" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ats_analysis_created_at_idx" ON "ats_analysis" USING btree ("created_at");