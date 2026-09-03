"""create_campaigns_and_targets_tables

Revision ID: 91369eeb4a74
Revises: ed97ded5a2b6
Create Date: 2026-09-03 20:51:34.083081

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import pgvector.sqlalchemy


# revision identifiers, used by Alembic.
revision: str = '91369eeb4a74'
down_revision: Union[str, Sequence[str], None] = 'ed97ded5a2b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Create campaigns table with new campaign_status enum
    op.create_table('campaigns',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('merchant_id', sa.UUID(), nullable=False),
        sa.Column('offer_description', sa.Text(), nullable=False),
        sa.Column('segment_description', sa.String(length=500), nullable=False),
        sa.Column('discount_percent', sa.String(length=10), server_default='0%', nullable=False),
        sa.Column('status', sa.Enum('draft', 'approved', 'sending', 'sent', 'cancelled', name='campaign_status'), server_default='draft', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('approved_by', sa.UUID(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['merchant_id'], ['merchant_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_campaigns_merchant_id'), 'campaigns', ['merchant_id'], unique=False)
    op.create_index(op.f('ix_campaigns_status'), 'campaigns', ['status'], unique=False)

    # 2. Create campaign_targets using existing send_status enum (create_type=False)
    op.create_table('campaign_targets',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('campaign_id', sa.UUID(), nullable=False),
        sa.Column('customer_connection_id', sa.UUID(), nullable=False),
        sa.Column('message_content', sa.Text(), nullable=False),
        sa.Column('payment_link_id', sa.UUID(), nullable=True),
        sa.Column('send_status', postgresql.ENUM('pending', 'sent', 'failed', name='send_status', create_type=False), server_default='pending', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['customer_connection_id'], ['customer_connections.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['payment_link_id'], ['payment_links.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_campaign_targets_campaign_id'), 'campaign_targets', ['campaign_id'], unique=False)
    op.create_index(op.f('ix_campaign_targets_customer_connection_id'), 'campaign_targets', ['customer_connection_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_campaign_targets_customer_connection_id'), table_name='campaign_targets')
    op.drop_index(op.f('ix_campaign_targets_campaign_id'), table_name='campaign_targets')
    op.drop_table('campaign_targets')
    op.drop_index(op.f('ix_campaigns_status'), table_name='campaigns')
    op.drop_index(op.f('ix_campaigns_merchant_id'), table_name='campaigns')
    op.drop_table('campaigns')
    sa.Enum(name='campaign_status').drop(op.get_bind(), checkfirst=True)
