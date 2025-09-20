import { z } from "zod";

// Zod schemas for Clockodo API responses
const ClockodoUserSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    number: z.string().nullable().optional(),
    active: z.boolean(),
    role: z.string().nullable().optional(),
    initials: z.string().nullable().optional(),
    language: z.string().nullable().optional(),
    timezone: z.string().nullable().optional(),
    teams_id: z.number().nullable().optional(),
    weekstart_monday: z.boolean().optional(),
    weekend_friday: z.boolean().optional(),
    timeformat_12h: z.boolean().optional(),
    nonbusiness_groups_id: z.number().nullable().optional(),
    nonbusinessgroups_id: z.number().nullable().optional(),
    work_time_regulations_id: z.number().nullable().optional(),
    default_work_time_regulation: z.boolean().optional(),
    boss: z.any().nullable().optional(),
    absence_managers_id: z.array(z.number()).optional(),
    can_generally_see_absences: z.boolean().optional(),
    can_generally_manage_absences: z.boolean().optional(),
    can_add_customers: z.boolean().optional(),
    default_holidays_count: z.boolean().optional(),
    default_target_hours: z.boolean().optional(),
    future_coworker: z.boolean().optional(),
    start_date: z.string().nullable().optional(),
    wage_type: z.number().optional(),
    worktime_regulation_id: z.number().nullable().optional(),
    access_groups_ids: z.array(z.number()).optional(),
    edit_lock: z.any().nullable().optional(),
    edit_lock_dyn: z.any().nullable().optional(),
    edit_lock_sync: z.any().nullable().optional(),
    work_time_edit_lock_days: z.number().nullable().optional()
});

const ClockodoUsersResponseSchema = z.object({
    data: z.array(ClockodoUserSchema),
    paging: z.object({
        items_per_page: z.number(),
        current_page: z.number(),
        count_pages: z.number(),
        count_items: z.number()
    })
});

export type ClockodoUser = z.infer<typeof ClockodoUserSchema>;
export type ClockodoUsersResponse = z.infer<typeof ClockodoUsersResponseSchema>;

export class ClockodoAPI {
    private email: string;
    private apiKey: string;
    private baseUrl = "https://my.clockodo.com/api";

    constructor() {
        this.email = process.env.CLOCKODO_EMAIL || "";
        this.apiKey = process.env.CLOCKODO_API_KEY || "";

        if (!this.email || !this.apiKey) {
            throw new Error("CLOCKODO_EMAIL and CLOCKODO_API_KEY environment variables are required");
        }
    }

    private async makeRequest<T>(endpoint: string, schema: z.ZodSchema<T>): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-ClockodoApiUser': this.email,
                    'X-ClockodoApiKey': this.apiKey,
                    'X-Clockodo-External-Application': 'mcp-ts'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return schema.parse(data);
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Invalid API response format: ${error.message}`);
            }
            throw error;
        }
    }

    async getUsers(): Promise<ClockodoUser[]> {
        try {
            let allUsers: ClockodoUser[] = [];
            let page = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                const response = await this.makeRequest(
                    `/v3/users?page=${page}`,
                    ClockodoUsersResponseSchema
                );

                allUsers = allUsers.concat(response.data);

                hasMorePages = page < response.paging.count_pages;
                page++;
            }

            return allUsers;
        } catch (error) {
            throw new Error(`Failed to fetch users from Clockodo API: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}