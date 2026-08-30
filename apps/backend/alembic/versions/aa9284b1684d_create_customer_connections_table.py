"""create_customer_connections_table

Revision ID: aa9284b1684d
Revises: b75860388016
Create Date: 2026-08-30 21:29:51.589337

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'aa9284b1684d'
down_revision: Union[str, Sequence[str], None] = 'b75860388016'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    connection_status = postgresql.ENUM('pending', 'connected', name='connection_status', create_type=False)

    op.create_table('customer_connections',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('merchant_id', sa.UUID(), nullable=False),
    sa.Column('customer_id', sa.UUID(), nullable=False),
    sa.Column('status', connection_status, server_default='pending', nullable=False),
    sa.Column('messages_used', sa.Integer(), server_default='0', nullable=False),
    sa.Column('total_spent', sa.Numeric(precision=10, scale=2), server_default='0', nullable=False),
    sa.Column('connected_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['merchant_id'], ['merchant_profiles.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('merchant_id', 'customer_id', name='uq_merchant_customer')
    )
    op.create_index(op.f('ix_customer_connections_customer_id'), 'customer_connections', ['customer_id'], unique=False)
    op.create_index(op.f('ix_customer_connections_merchant_id'), 'customer_connections', ['merchant_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_customer_connections_merchant_id'), table_name='customer_connections')
    op.drop_index(op.f('ix_customer_connections_customer_id'), table_name='customer_connections')
    op.drop_table('customer_connections')
