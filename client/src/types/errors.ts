export class PetfinderApiError extends Error {
    status: number;
    title: string;
    detail: string;
    invalidParams?: Array<{
        in: string;
        path: string;
        message: string;
    }>;

    constructor(error: any) {
        super(error.detail || 'An error occurred with the Petfinder API');
        this.name = 'PetfinderApiError';
        this.status = error.status;
        this.title = error.title;
        this.detail = error.detail;
        this.invalidParams = error['invalid-params'];
    }

    getErrorMessage(): string {
        if (this.status === 401) {
            return 'Authentication failed. Please try again later.';
        }
        if (this.status === 403) {
            return 'Access denied. You do not have permission to perform this action.';
        }
        if (this.status === 404) {
            return 'The requested resource was not found.';
        }
        if (this.status === 500) {
            return 'An unexpected error occurred. Please try again later.';
        }
        if (this.invalidParams) {
            return `Invalid parameters: ${this.invalidParams.map(p => p.message).join(', ')}`;
        }
        return this.detail || 'An unexpected error occurred';
    }
}