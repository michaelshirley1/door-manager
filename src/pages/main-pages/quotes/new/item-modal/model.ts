import { OrderItem } from '../../../jobs/model';
import { DoorType } from '../../../../side-pages/door-types/model';
import { HingeType } from '../../../../side-pages/hinge-types/model';
import { HandleType } from '../../../../side-pages/handle-types/model';

export interface QuoteItemModalProps {
    isOpen: boolean;
    sortOrder: number;
    doorTypes: DoorType[];
    hingeTypes: HingeType[];
    handleTypes: HandleType[];
    onAdd: (item: OrderItem) => void;
    onClose: () => void;
}
