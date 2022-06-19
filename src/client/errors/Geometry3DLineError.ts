export class Geometry3DLineError implements Error {
    name: string;
    message: string;
    stack?: string;

    constructor(name: string, message: string) {
        this.name = name;
        this.message = message;
    }
}