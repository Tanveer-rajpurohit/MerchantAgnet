"""add_trgm_indexes_for_users_and_merchants

Revision ID: c34e222d439a
Revises: aa9284b1684d
Create Date: 2026-08-30 22:31:33.516853

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'c34e222d439a'
down_revision: Union[str, Sequence[str], None] = 'aa9284b1684d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    op.create_index('ix_merchant_profiles_business_name_trgm', 'merchant_profiles', ['business_name'], unique=False, postgresql_using='gin', postgresql_ops={'business_name': 'gin_trgm_ops'})
    op.create_index('ix_users_email_trgm', 'users', ['email'], unique=False, postgresql_using='gin', postgresql_ops={'email': 'gin_trgm_ops'})
    op.create_index('ix_users_full_name_trgm', 'users', ['full_name'], unique=False, postgresql_using='gin', postgresql_ops={'full_name': 'gin_trgm_ops'})
    op.create_index('ix_users_phone_number_trgm', 'users', ['phone_number'], unique=False, postgresql_using='gin', postgresql_ops={'phone_number': 'gin_trgm_ops'})

def downgrade() -> None:
    op.drop_index('ix_users_phone_number_trgm', table_name='users', postgresql_using='gin', postgresql_ops={'phone_number': 'gin_trgm_ops'})
    op.drop_index('ix_users_full_name_trgm', table_name='users', postgresql_using='gin', postgresql_ops={'full_name': 'gin_trgm_ops'})
    op.drop_index('ix_users_email_trgm', table_name='users', postgresql_using='gin', postgresql_ops={'email': 'gin_trgm_ops'})
    op.drop_index('ix_merchant_profiles_business_name_trgm', table_name='merchant_profiles', postgresql_using='gin', postgresql_ops={'business_name': 'gin_trgm_ops'})
