import { z } from "zod";
import { writeFileSync, appendFileSync, existsSync } from "fs";
import { join } from "path";

// Logging utility
class Logger {
    private logFile: string;

    constructor() {
        this.logFile = join(process.cwd(), 'clockodo-api.log');
        // Initialize log file with timestamp
        if (!existsSync(this.logFile)) {
            writeFileSync(this.logFile, `=== Clockodo API Log Started at ${new Date().toISOString()} ===\n`);
        }
    }

    log(message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n\n`;
        appendFileSync(this.logFile, logEntry);
    }

    logRequest(method: string, url: string, headers?: any) {
        this.log(`>>> REQUEST ${method} ${url}`, { headers });
    }

    logResponse(status: number, statusText: string, data?: any) {
        this.log(`<<< RESPONSE ${status} ${statusText}`, data);
    }

    logError(error: string, details?: any) {
        this.log(`!!! ERROR: ${error}`, details);
    }
}

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

const ClockodoEntrySchema = z.object({
    id: z.number(),
    customers_id: z.number(),
    projects_id: z.number().nullable(),
    users_id: z.number(),
    billable: z.number(),
    text: z.string().nullable(),
    time_since: z.string(),
    time_until: z.string(),
    time_insert: z.string(),
    time_last_change: z.string(),
    hourly_rate: z.number().nullable().optional(),
    revenue: z.number().nullable().optional(),
    budget_is_hours: z.boolean().optional(),
    budget_is_not_strict: z.boolean().optional(),
    offset: z.number().optional(),
    clocked: z.boolean().optional(),
    locked: z.boolean().optional()
});

const ClockodoEntriesResponseSchema = z.object({
    entries: z.array(ClockodoEntrySchema),
    paging: z.object({
        items_per_page: z.number(),
        current_page: z.number(),
        count_pages: z.number(),
        count_items: z.number()
    })
});

const ClockodoProjectSchema = z.object({
    id: z.number(),
    customers_id: z.number(),
    name: z.string(),
    number: z.string().nullable(),
    active: z.boolean(),
    billable_default: z.boolean(),
    note: z.string().nullable().optional(),
    billed_money: z.number().nullable().optional(),
    billed_completely: z.boolean().nullable().optional(),
    completed: z.boolean(),
    completed_at: z.string().nullable(),
    revenue_factor: z.number().nullable().optional(),
    test_data: z.boolean(),
    count_subprojects: z.number(),
    deadline: z.string().nullable().optional(),
    start_date: z.string().nullable().optional(),
    budget: z.object({
        monetary: z.boolean(),
        hard: z.boolean(),
        from_subprojects: z.boolean(),
        interval: z.number().nullable().optional(),
        amount: z.number().nullable().optional(),
        notification_thresholds: z.array(z.any()).optional()
    }).nullable().optional()
});

const ClockodoProjectsResponseSchema = z.object({
    data: z.array(ClockodoProjectSchema),
    paging: z.object({
        items_per_page: z.number(),
        current_page: z.number(),
        count_pages: z.number(),
        count_items: z.number()
    })
});

export type ClockodoUser = z.infer<typeof ClockodoUserSchema>;
export type ClockodoUsersResponse = z.infer<typeof ClockodoUsersResponseSchema>;
export type ClockodoEntry = z.infer<typeof ClockodoEntrySchema>;
export type ClockodoEntriesResponse = z.infer<typeof ClockodoEntriesResponseSchema>;
export type ClockodoProject = z.infer<typeof ClockodoProjectSchema>;
export type ClockodoProjectsResponse = z.infer<typeof ClockodoProjectsResponseSchema>;

export class ClockodoAPI {
    private email: string;
    private apiKey: string;
    private baseUrl = "https://my.clockodo.com/api";
    private logger: Logger;

    constructor() {
        this.email = process.env.CLOCKODO_EMAIL || "";
        this.apiKey = process.env.CLOCKODO_API_KEY || "";
        this.logger = new Logger();

        if (!this.email || !this.apiKey) {
            throw new Error("CLOCKODO_EMAIL and CLOCKODO_API_KEY environment variables are required");
        }

        this.logger.log("ClockodoAPI initialized", {
            email: this.email,
            baseUrl: this.baseUrl,
            hasApiKey: !!this.apiKey
        });
    }

    private async makeRequest<T>(endpoint: string, schema: z.ZodSchema<T>): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Accept': 'application/json',
            'X-ClockodoApiUser': this.email,
            'X-ClockodoApiKey': '***',  // Hide API key in logs
            'X-Clockodo-External-Application': 'mcp-ts'
        };

        // Log the request
        this.logger.logRequest('GET', url, headers);

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

            // Log the response status
            this.logger.logResponse(response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.logError(`HTTP ${response.status}: ${response.statusText}`, {
                    url,
                    responseBody: errorText
                });
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Log the successful response data
            this.logger.log("Response data received", {
                dataType: typeof data,
                isArray: Array.isArray(data),
                keys: typeof data === 'object' ? Object.keys(data) : undefined,
                entryCount: data?.entries?.length || data?.data?.length || 'unknown'
            });

            const parsedData = schema.parse(data);
            this.logger.log("Data successfully validated with schema");

            return parsedData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                this.logger.logError("Zod validation error", {
                    error: error.message,
                    issues: error.issues
                });
                throw new Error(`Invalid API response format: ${error.message}`);
            }
            this.logger.logError("Request failed", {
                error: error instanceof Error ? error.message : String(error),
                url
            });
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

    async getEntries(userId: number, timeSince: string, timeUntil: string): Promise<ClockodoEntry[]> {
        try {
            let allEntries: ClockodoEntry[] = [];
            let page = 1;
            let hasMorePages = true;

            // Create filter object according to OpenAPI spec
            const filterObject = { users_id: userId };
            const filter = encodeURIComponent(JSON.stringify(filterObject));

            while (hasMorePages) {
                const response = await this.makeRequest(
                    `/v2/entries?time_since=${timeSince}&time_until=${timeUntil}&page=${page}`,
                    ClockodoEntriesResponseSchema
                );

                // Filter entries manually by user ID
                const userEntries = response.entries.filter(entry => entry.users_id === userId);
                allEntries = allEntries.concat(userEntries);

                hasMorePages = page < response.paging.count_pages;
                page++;
            }

            return allEntries;
        } catch (error) {
            throw new Error(`Failed to fetch entries from Clockodo API: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async getProjects(): Promise<ClockodoProject[]> {
        try {
            let allProjects: ClockodoProject[] = [];
            let page = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                const response = await this.makeRequest(
                    `/v4/projects?page=${page}`,
                    ClockodoProjectsResponseSchema
                );

                allProjects = allProjects.concat(response.data);

                hasMorePages = page < response.paging.count_pages;
                page++;
            }

            return allProjects;
        } catch (error) {
            throw new Error(`Failed to fetch projects from Clockodo API: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}