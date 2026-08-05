CREATE TABLE "interview_question_state" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" varchar(100) NOT NULL,
	"bookmarked" boolean DEFAULT false NOT NULL,
	"solved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_session" ADD COLUMN "company" varchar(255);--> statement-breakpoint
ALTER TABLE "interview_session" ADD COLUMN "position" varchar(255);--> statement-breakpoint
ALTER TABLE "interview_session" ADD COLUMN "duration" integer;--> statement-breakpoint
ALTER TABLE "interview_session" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "interview_question_state" ADD CONSTRAINT "interview_question_state_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "interview_question_state_user_id_idx" ON "interview_question_state" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "interview_question_state_question_id_idx" ON "interview_question_state" USING btree ("question_id");