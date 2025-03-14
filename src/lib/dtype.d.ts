// Type definitions for the application
import type { MenuItem, CartItem } from './types';

// Export all interfaces in a namespace
export namespace F16 {
    // Component Props Interfaces
    export interface MenuItemProps {
        item: MenuItem;
    }
    
    export interface DietaryFilterProps {
        onFilterChange: (filters: Record<string, boolean>) => void;
    }
    
    export interface EditableOrderItemProps {
        item: CartItem;
        index: number;
        onIncrease: string;
        onDecrease: string;
        onEdit: string;
    }
    
    export interface CustomizationModalProps {
        item: CartItem;
        isOpen: boolean;
        onClose: string;
        onAddToCart: string;
    }
    
    export interface PromoSlide {
        title: string;
        description: string;
        image: string;
    }
}

// Also export the types directly for convenience
export type MenuItemProps = F16.MenuItemProps;
export type DietaryFilterProps = F16.DietaryFilterProps;
export type EditableOrderItemProps = F16.EditableOrderItemProps;
export type CustomizationModalProps = F16.CustomizationModalProps;
export type PromoSlide = F16.PromoSlide;