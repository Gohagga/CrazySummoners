export class ClassificationService<ClassificationType> {

    private typeClass: Record<number, ClassificationType> = {};

    constructor(
    ) {
    }

    public Set(typeId: number, value: ClassificationType) {
        this.typeClass[typeId] = value;
    }

    public Get(typeId: number): ClassificationType {
        return this.typeClass[typeId];
    }
}