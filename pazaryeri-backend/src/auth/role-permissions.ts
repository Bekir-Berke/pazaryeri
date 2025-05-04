import { Role } from "@prisma/client";
import { Permission } from "./permissions.enum";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.USER]: [
        Permission.READ_PROFILE,
        Permission.UPDATE_PROFILE,
        Permission.DELETE_PROFILE,
        Permission.READ_PRODUCT,
        Permission.CREATE_ADDRESS,
        Permission.READ_ANY_ADDRESS,
        Permission.UPDATE_ANY_ADDRESS,
        Permission.READ_CARD,
        Permission.CREATE_CARD,
        Permission.UPDATE_CARD,
        Permission.DELETE_CARD,
        Permission.CREATE_ORDER,
        Permission.READ_ORDER,
        Permission.UPDATE_FAVORITE,
        Permission.CREATE_FAVORITE,
        Permission.READ_FAVORITE,
        Permission.DELETE_FAVORITE,
        Permission.CREATE_REVIEW,
        Permission.READ_REVIEW,
        Permission.UPDATE_REVIEW,
        Permission.DELETE_REVIEW,
    ],
    [Role.STORE]: [
        Permission.READ_PROFILE,
        Permission.UPDATE_PROFILE,
        Permission.CREATE_PRODUCT,
        Permission.READ_PRODUCT,
        Permission.UPDATE_PRODUCT,
        Permission.DELETE_PRODUCT,
        Permission.UPDATE_ORDER,
        Permission.READ_REVIEW,
    ],
    [Role.ADMIN]: [
        Permission.READ_PROFILE,
        Permission.UPDATE_PROFILE,
        Permission.CREATE_PRODUCT,
        Permission.READ_PRODUCT,
        Permission.UPDATE_PRODUCT,
        Permission.DELETE_PRODUCT,

        Permission.READ_ALL_USERS,
        Permission.READ_ANY_USER,
        Permission.UPDATE_ANY_USER,
        Permission.DELETE_ANY_USER,

        Permission.READ_ALL_ORDERS,

        Permission.READ_ALL_STORES,
        Permission.READ_ANY_STORE,
        Permission.UPDATE_ANY_STORE,
        Permission.DELETE_ANY_STORE,

        Permission.CREATE_BRAND,
        Permission.READ_ALL_BRANDS,
        Permission.READ_ANY_BRAND,
        Permission.UPDATE_ANY_BRAND,
        Permission.DELETE_ANY_BRAND,

        Permission.CREATE_CATEGORY,
        Permission.READ_ALL_CATEGORIES,
        Permission.READ_ANY_CATEGORY,
        Permission.UPDATE_ANY_CATEGORY,
        Permission.DELETE_ANY_CATEGORY,

        Permission.READ_ALL_ADDRESS,
        Permission.READ_ANY_ADDRESS,
        Permission.UPDATE_ANY_ADDRESS,
        Permission.DELETE_ANY_ADDRESS,

        Permission.READ_SYSTEM_LOGS,
    ],
};