from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.utils.database import get_db
from app.utils.security import get_current_user
from app.models.user import User
from app.models.api_key import APIKey
from app.models.usage_log import UsageLog
from app.schemas.analytics import UsageLogResponse, UsageSummary

router = APIRouter()

@router.get("/usage", response_model=List[UsageLogResponse])
async def get_usage(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(UsageLog).join(APIKey).filter(APIKey.user_id == current_user.id)
    if start_date:
        query = query.filter(UsageLog.created_at >= start_date)
    if end_date:
        query = query.filter(UsageLog.created_at <= end_date)
        
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/usage/summary", response_model=UsageSummary)
async def get_usage_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(
        func.sum(UsageLog.total_cost).label("total_cost"),
        func.count(UsageLog.id).label("total_requests"),
        func.avg(UsageLog.latency_ms).label("avg_latency")
    ).join(APIKey).filter(APIKey.user_id == current_user.id)
    
    if start_date:
        query = query.filter(UsageLog.created_at >= start_date)
    if end_date:
        query = query.filter(UsageLog.created_at <= end_date)
        
    result = await db.execute(query)
    row = result.first()
    
    return UsageSummary(
        total_cost=row.total_cost or 0.0,
        total_requests=row.total_requests or 0,
        avg_latency_ms=row.avg_latency or 0.0
    )
