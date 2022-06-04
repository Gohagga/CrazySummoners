export interface IOrbModel {
    
    isAvailable: boolean;
    cooldownRemaining: number;
    orbTypeId: number;

    onUpdate: null | (() => void);

}