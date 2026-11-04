from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class ListObjectsFoundSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Optional[Literal["Pendente", "Encontrado", "Devolvido"]] = None
    id_category: Optional[int] = Field(default=None, gt=0)
    id_location: Optional[int] = Field(default=None, gt=0)
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)