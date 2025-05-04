export enum Permission {
    // User permissions
    READ_PROFILE = 'read:profile',
    UPDATE_PROFILE = 'update:profile',
    DELETE_PROFILE = 'delete:profile',
    CREATE_ADDRESS= 'create:address',
    CREATE_REVIEW = 'create:review',
    READ_REVIEW = 'read:review',
    UPDATE_REVIEW = 'update:review',
    DELETE_REVIEW = 'delete:review',

    CREATE_FAVORITE = 'create:favorite',
    READ_FAVORITE = 'read:favorite',
    UPDATE_FAVORITE = 'update:favorite',
    DELETE_FAVORITE = 'delete:favorite',

    CREATE_CARD = 'create:card',
    READ_CARD = 'read:card',
    UPDATE_CARD = 'update:card',
    DELETE_CARD = 'delete:card',

    CREATE_ORDER = 'create:order',
    READ_ORDER = 'read:order',
    UPDATE_ORDER = 'update:order',
    DELETE_ORDER = 'delete:order',
    
    // Store permissions
    CREATE_PRODUCT = 'create:product',
    READ_PRODUCT = 'read:product',
    UPDATE_PRODUCT = 'update:product',
    DELETE_PRODUCT = 'delete:product',
    //READ_ORDERS = 'read:orders',
    //UPDATE_ORDERS = 'update:orders',
    
    // Admin permissions
    READ_ALL_USERS = 'read:all_users',
    READ_ANY_USER  = 'read:any_user',
    UPDATE_ANY_USER = 'update:any_user',
    DELETE_ANY_USER = 'delete:any_user',

    READ_ALL_ADDRESS = 'read:all_address',
    READ_ANY_ADDRESS = 'read:any_address',
    UPDATE_ANY_ADDRESS = 'update:any_address',
    DELETE_ANY_ADDRESS = 'delete:any_address',

    READ_ALL_STORES = 'read:all_stores',
    READ_ANY_STORE = 'read:any_store',
    UPDATE_ANY_STORE = 'update:any_store',
    DELETE_ANY_STORE = 'delete:any_store',

    READ_ALL_ORDERS = 'read:all_orders',

    CREATE_BRAND = 'create:brand',
    READ_ALL_BRANDS = 'read:all_brands',
    READ_ANY_BRAND = 'read:any_brand',
    UPDATE_ANY_BRAND = 'update:any_brand',
    DELETE_ANY_BRAND = 'delete:any_brand',

    CREATE_CATEGORY = 'create:category',
    READ_ALL_CATEGORIES = 'read:all_categories',
    READ_ANY_CATEGORY = 'read:any_category',
    UPDATE_ANY_CATEGORY = 'update:any_category',
    DELETE_ANY_CATEGORY = 'delete:any_category',

    READ_SYSTEM_LOGS = 'read:system_logs',
  }