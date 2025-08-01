import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-linkedin-activity.ts';
import '@/ai/flows/generate-linkedin-post-suggestions.ts';
import '@/ai/flows/extract-linkedin-data.ts';
import '@/ai/schemas.ts';
