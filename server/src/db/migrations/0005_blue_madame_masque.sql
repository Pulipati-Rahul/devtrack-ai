ALTER TABLE "project" ADD COLUMN "technologies" text;--> statement-breakpoint
ALTER TABLE "project_task" ADD COLUMN "assigned_to" varchar(255);--> statement-breakpoint
ALTER TABLE "project_task" ADD COLUMN "tags" text;--> statement-breakpoint
ALTER TABLE "project_task" ADD COLUMN "notes" text;