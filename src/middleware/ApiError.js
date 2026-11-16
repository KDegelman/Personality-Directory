class ApiError extends Error { //Error is a default class that we extend to modify
    constructor(status, message) { //Intakes number and msg
        super(message);
        this.status = status;
    }
}
module.exports = { ApiError }; //Outputs an Object with the Error class
