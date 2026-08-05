ALTER TABLE "resume" ADD COLUMN "font" varchar(100) DEFAULT 'Inter' NOT NULL;--> statement-breakpoint
ALTER TABLE "resume" ADD COLUMN "accent_color" varchar(100) DEFAULT '#3b82f6' NOT NULL;--> statement-breakpoint
ALTER TABLE "resume" ADD COLUMN "spacing" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "resume" ADD COLUMN "font_size" integer DEFAULT 12 NOT NULL;