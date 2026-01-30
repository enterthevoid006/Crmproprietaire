export abstract class Entity<T> {
    protected readonly _id: string;
    protected readonly props: T;

    constructor(props: T, id?: string) {
        // We will generate generic UUIDs here if not provided, 
        // but typically use a UUID library in the final implementation
        this._id = id ? id : crypto.randomUUID();
        this.props = props;
    }

    get id(): string {
        return this._id;
    }

    public getProps(): T {
        return this.props;
    }

    public equals(object?: Entity<T>): boolean {
        if (object == null || object == undefined) {
            return false;
        }

        if (this === object) {
            return true;
        }

        if (!isEntity(object)) {
            return false;
        }

        return this._id === object._id;
    }
}

const isEntity = (v: any): v is Entity<any> => {
    return v instanceof Entity;
};
