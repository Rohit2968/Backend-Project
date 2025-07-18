class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something Went Wrong!!",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, new.target); // ✅ Safe replacement
        }
    }
}

export { ApiError };
