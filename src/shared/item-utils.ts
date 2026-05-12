import { OrderItem } from '../pages/main-pages/jobs/model';
import { DoorType } from '../pages/side-pages/door-types/model';
import { HingeType } from '../pages/side-pages/hinge-types/model';
import { HandleType } from '../pages/side-pages/handle-types/model';

export type ItemFormState = ReturnType<typeof blankItemForm>;

export const blankItemForm = () => ({
    itemType:     'Door' as OrderItem['itemType'],
    doorTypeId:   '',
    hingeTypeId:  '',
    handleTypeId: '',
    room:         '',
    assembly:     '',
    heightMm:     '1980',
    widthMm:      '',
    thicknessMm:  '32',
    handSide:     '',
    colourFinish: '',
    glazing:      '',
    fireRating:   '',
    drilling:     'false',
    drillSize:    '',
    quantity:     '1',
    unitPrice:    '',
    notes:        '',
});

export const lookupDoorPrice = (
    doorTypes: DoorType[],
    doorTypeId: string,
    heightMm: string,
    widthMm: string,
): string => {
    if (!doorTypeId) return '';
    const dt = doorTypes.find(d => d.id === parseInt(doorTypeId));
    if (!dt) return '';
    if (dt.prices && heightMm && widthMm) {
        const entry = dt.prices.find(
            p => p.heightMm === parseInt(heightMm) && p.widthMm === parseInt(widthMm)
        );
        if (entry) return entry.price.toString();
    }
    return dt.price?.toString() ?? '';
};

export const activeOnly = <T extends { isActive: boolean }>(list: T[]) =>
    list.filter(x => x.isActive);

export const buildOrderItem = (itemForm: ItemFormState, sortOrder: number, quantityDefault: number | null = null): OrderItem => ({
    id:           0,
    itemType:     itemForm.itemType,
    doorTypeId:   itemForm.doorTypeId   ? parseInt(itemForm.doorTypeId)   : null,
    hingeTypeId:  itemForm.hingeTypeId  ? parseInt(itemForm.hingeTypeId)  : null,
    handleTypeId: itemForm.handleTypeId ? parseInt(itemForm.handleTypeId) : null,
    room:         itemForm.room         || null,
    assembly:     itemForm.assembly     || null,
    heightMm:     itemForm.heightMm && itemForm.heightMm !== 'custom' ? parseInt(itemForm.heightMm) : null,
    widthMm:      itemForm.widthMm      ? parseInt(itemForm.widthMm)      : null,
    thicknessMm:  itemForm.thicknessMm  ? parseInt(itemForm.thicknessMm)  : null,
    handSide:     itemForm.handSide     || null,
    colourFinish: itemForm.colourFinish || null,
    glazing:      itemForm.glazing      || null,
    fireRating:   itemForm.fireRating   || null,
    drilling:     itemForm.drilling === 'true',
    drillSize:    itemForm.drillSize    || null,
    quantity:     itemForm.quantity ? parseInt(itemForm.quantity) : quantityDefault,
    unitPrice:    itemForm.unitPrice    ? parseFloat(itemForm.unitPrice)   : null,
    notes:        itemForm.notes        || null,
    sortOrder,
    createdAt:    null,
});
