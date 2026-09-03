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
        "razorpay_key_id": "VARCHAR(100)",
        "razorpay_key_secret_encrypted": "TEXT",
        "is_razorpay_active": "BOOLEAN NOT NULL DEFAULT false",
        "razorpay_mode": "VARCHAR(20) NOT NULL DEFAULT 'test'",
        "razorpay_connected_at": "TIMESTAMPTZ",
        "onboarding_completed_at": "TIMESTAMPTZ",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()",
        "updated_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
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

    "customer_connections": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "merchant_id": "UUID NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE",
        "customer_id": "UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        "status": "connection_status NOT NULL DEFAULT 'pending'",
        "messages_used": "INTEGER NOT NULL DEFAULT 0",
        "total_spent": "NUMERIC(10,2) NOT NULL DEFAULT 0",
        "connected_at": "TIMESTAMPTZ",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()",
        "updated_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "orders": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "merchant_id": "UUID NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE",
        "customer_id": "UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        "customer_connection_id": "UUID REFERENCES customer_connections(id) ON DELETE SET NULL",
        "total_amount": "NUMERIC(10,2) NOT NULL",
        "paid_amount": "NUMERIC(10,2) NOT NULL DEFAULT 0",
        "status": "order_status NOT NULL DEFAULT 'unpaid'",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()",
        "updated_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "order_items": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "order_id": "UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE",
        "product_id": "UUID REFERENCES products(id) ON DELETE SET NULL",
        "product_name_snapshot": "VARCHAR(255) NOT NULL",
        "quantity": "INTEGER NOT NULL",
        "unit_price_snapshot": "NUMERIC(10,2) NOT NULL",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "order_status_history": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "order_id": "UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE",
        "previous_status": "order_status",
        "new_status": "order_status NOT NULL",
        "changed_by": "actor_type NOT NULL",
        "reason": "TEXT",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "conversations": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "customer_connection_id": "UUID UNIQUE NOT NULL REFERENCES customer_connections(id) ON DELETE CASCADE",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()",
        "updated_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "messages": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "conversation_id": "UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE",
        "sender_type": "sender_type NOT NULL",
        "content": "TEXT NOT NULL",
        "status": "send_status NOT NULL DEFAULT 'pending'",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },
    
    "payment_links": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "merchant_id": "UUID NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE",
        "order_id": "UUID REFERENCES orders(id) ON DELETE SET NULL",
        "customer_id": "UUID REFERENCES users(id) ON DELETE SET NULL",
        "customer_name": "VARCHAR(255) NOT NULL",
        "customer_phone": "VARCHAR(20)",
        "customer_email": "VARCHAR(255)",
        "description": "VARCHAR(500) NOT NULL",
        "amount": "NUMERIC(10,2) NOT NULL",
        "currency": "VARCHAR(10) NOT NULL DEFAULT 'INR'",
        "receipt_number": "VARCHAR(100)",
        "razorpay_link_id": "VARCHAR(255) UNIQUE",
        "razorpay_link_url": "TEXT",
        "callback_url": "TEXT",
        "callback_method": "VARCHAR(10) NOT NULL DEFAULT 'get'",
        "razorpay_payment_id": "VARCHAR(255)",
        "razorpay_signature": "VARCHAR(255)",
        "payment_method": "VARCHAR(50)",
        "status": "payment_link_status NOT NULL DEFAULT 'created'",
        "notify_sms": "BOOLEAN NOT NULL DEFAULT false",
        "notify_email": "BOOLEAN NOT NULL DEFAULT false",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()",
        "paid_at": "TIMESTAMPTZ",
        "cancelled_at": "TIMESTAMPTZ",
        "expired_at": "TIMESTAMPTZ",
        "updated_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "settlements": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "merchant_id": "UUID NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE",
        "razorpay_settlement_id": "VARCHAR(255) UNIQUE",
        "amount": "NUMERIC(10,2) NOT NULL",
        "fee": "NUMERIC(10,2) NOT NULL DEFAULT 0",
        "tax": "NUMERIC(10,2) NOT NULL DEFAULT 0",
        "net_amount": "NUMERIC(10,2) NOT NULL",
        "currency": "VARCHAR(10) NOT NULL DEFAULT 'INR'",
        "utr": "VARCHAR(255)",
        "method": "VARCHAR(50) NOT NULL DEFAULT 'NEFT'",
        "status": "settlement_status NOT NULL DEFAULT 'pending'",
        "settled_at": "TIMESTAMPTZ",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()",
        "updated_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "audit_logs": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "merchant_id": "UUID REFERENCES merchant_profiles(id) ON DELETE SET NULL",
        "user_id": "UUID REFERENCES users(id) ON DELETE SET NULL",
        "action": "VARCHAR(100) NOT NULL",
        "entity_type": "VARCHAR(50) NOT NULL",
        "entity_id": "VARCHAR(255) NOT NULL",
        "details": "JSONB NOT NULL DEFAULT '{}'::jsonb",
        "ip_address": "VARCHAR(45)",
        "user_agent": "TEXT",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "enums": {
        "user_role": ["merchant", "customer"],
        "connection_status": ["pending", "connected"],
        "order_status": ["unpaid", "paid", "cancelled"],
        "actor_type": ["merchant", "customer", "system", "ai_agent"],
        "sender_type": ["customer", "agent", "merchant"],
        "send_status": ["pending", "sent", "failed"],
        "payment_link_status": ["created", "partially_paid", "paid", "expired", "cancelled"],
        "settlement_status": ["pending", "processed", "failed"]
    }
}
```



## Raw Schema (JSON) : AI
```json
{   
    "knowledge_chunks": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "merchant_id": "UUID NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE",
        "source_type": "knowledge_source_type NOT NULL DEFAULT 'product'",
        "source_id": "UUID",
        "content": "TEXT NOT NULL",
        "embedding": "vector(384) NOT NULL",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()",
        "updated_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "agent_runs": {
        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
        "conversation_id": "UUID REFERENCES conversations(id) ON DELETE SET NULL",
        "merchant_id": "UUID NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE",
        "persona": "agent_persona NOT NULL",
        "user_message": "TEXT NOT NULL",
        "agent_response": "TEXT NOT NULL",
        "tools_invoked": "JSONB NOT NULL DEFAULT '[]'::jsonb",
        "status": "agent_run_status NOT NULL DEFAULT 'success'",
        "latency_ms": "INTEGER",
        "error_detail": "TEXT",
        "created_at": "TIMESTAMPTZ NOT NULL DEFAULT now()"
    },

    "ai_enums": {
        "knowledge_source_type": ["product", "shop_profile", "faq", "policy"],
        "agent_persona": ["merchant_admin", "customer_shopfront"],
        "agent_run_status": ["success", "failed", "fallback"]
    }
}
```
