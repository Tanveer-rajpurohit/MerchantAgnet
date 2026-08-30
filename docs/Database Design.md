# MerchantAgent - Database Design

## Raw Schema (JSON)
```json
{   
    "users": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "email": "VARCHAR(255) UNIQUE NOT NULL",
        "google_id": "VARCHAR(255) UNIQUE",
        "phone_number": "VARCHAR(20) UNIQUE",
        "password_hash": "VARCHAR(255)",
        "role": "user_role NOT NULL",
        "full_name": "VARCHAR(255) NOT NULL",
        "profile_picture": "VARCHAR(255)",
        "is_phone_verified": "BOOLEAN NOT NULL DEFAULT false",
        "is_active": "BOOLEAN NOT NULL DEFAULT true",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()",
        "updated_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },
    
    "addresses": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "user_id": "UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        "label": "VARCHAR(50) NOT NULL",
        "line1": "VARCHAR(255) NOT NULL",
        "line2": "VARCHAR(255)",
        "landmark": "VARCHAR(255)",
        "city": "VARCHAR(100) NOT NULL",
        "state": "VARCHAR(100) NOT NULL",
        "country": "VARCHAR(50) NOT NULL DEFAULT 'India'",
        "pincode": "VARCHAR(10) NOT NULL",
        "is_default": "BOOLEAN NOT NULL DEFAULT false",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },
    
    "merchant_profiles": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "user_id": "UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        "business_name": "VARCHAR(255) NOT NULL",
        "business_type": "VARCHAR(100) NOT NULL",
        "business_description": "TEXT",
        "gstin": "VARCHAR(15)",
        "upi_vpa": "VARCHAR(100)",
        "preferred_language": "VARCHAR(20) NOT NULL DEFAULT 'English'",
        "razorpay_key_id_encrypted": "TEXT",
        "razorpay_key_secret_encrypted": "TEXT",
        "is_razorpay_active": "BOOLEAN NOT NULL DEFAULT false",
        "onboarding_completed_at": "TIMESTAMPTZ"
    },

    "user_settings": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "user_id": "UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        "show_mobile_number": "BOOLEAN NOT NULL DEFAULT true",
        "show_email": "BOOLEAN NOT NULL DEFAULT false",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()",
        "updated_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "info_ai": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "merchant_id": "UUID UNIQUE NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE",
        "help_with": "TEXT NOT NULL",
        "rule": "TEXT",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()",
        "updated_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "expenses": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "merchant_id": "UUID NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE",
        "category": "VARCHAR(100) NOT NULL",
        "amount": "NUMERIC(10,2) NOT NULL",
        "due_on": "VARCHAR(50) NOT NULL DEFAULT '1st of month'",
        "notes": "TEXT",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()",
        "updated_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "products": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "merchant_id": "UUID NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE",
        "product_name": "VARCHAR(255) NOT NULL",
        "cost_price": "NUMERIC(10,2) NOT NULL",
        "selling_price": "NUMERIC(10,2) NOT NULL",
        "current_stock": "INTEGER NOT NULL DEFAULT 0",
        "low_stock_alert": "INTEGER NOT NULL DEFAULT 0",
        "is_active": "BOOLEAN NOT NULL DEFAULT true",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()",
        "updated_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "enums": {
        "user_role": ["merchant", "customer"]
    }
}
```
